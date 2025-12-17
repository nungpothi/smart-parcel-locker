package otp

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"log"
	"math/big"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/otp"
	"smart-parcel-locker/backend/pkg/errorx"
)

const otpTTL = 5 * time.Minute

// Notifier delivers OTP codes to users.
type Notifier interface {
	SendOTP(ctx context.Context, phone string, otpCode string) error
}

// UseCase handles OTP request/verify flow.
type UseCase struct {
	repo     otp.Repository
	notifier Notifier
	now      func() time.Time
}

type RequestResult struct {
	OtpRef    string
	ExpiresAt time.Time
}

type VerifyResult struct {
	Status otp.Status
}

// NewUseCase constructs OTP use case.
func NewUseCase(repo otp.Repository, notifier Notifier) *UseCase {
	if notifier == nil {
		notifier = noopNotifier{}
	}
	return &UseCase{
		repo:     repo,
		notifier: notifier,
		now:      time.Now,
	}
}

// RequestOTP generates and stores an OTP, then notifies the user.
func (uc *UseCase) RequestOTP(ctx context.Context, phone string) (*RequestResult, error) {
	if phone == "" || !isNumeric(phone) {
		return nil, otp.ErrInvalidRequest
	}

	otpCode := generateNumericCode(6)
	now := uc.now()
	entity := &otp.OTP{
		ID:        uuid.New(),
		Phone:     phone,
		OtpRef:    uuid.NewString(),
		OtpHash:   hashOTP(otpCode),
		Status:    otp.StatusActive,
		ExpiresAt: now.Add(otpTTL),
		CreatedAt: now,
	}

	created, err := uc.repo.Create(ctx, entity)
	if err != nil {
		return nil, err
	}

	if err := uc.notifier.SendOTP(ctx, phone, otpCode); err != nil {
		log.Printf("otp webhook error for phone=%s: %v", phone, err)
	} else {
		log.Printf("otp sent to discord for phone=%s", phone)
	}

	return &RequestResult{
		OtpRef:    created.OtpRef,
		ExpiresAt: created.ExpiresAt,
	}, nil
}

// VerifyOTP checks OTP code and marks it as verified.
func (uc *UseCase) VerifyOTP(ctx context.Context, phone string, otpCode string) (*VerifyResult, error) {
	if phone == "" || otpCode == "" || !isNumeric(phone) || !isNumeric(otpCode) {
		return nil, otp.ErrInvalidRequest
	}
	if len(otpCode) != 6 {
		return nil, errorx.Error{Code: "INVALID_REQUEST", Message: "otp must be 6 digits"}
	}

	record, err := uc.repo.GetActiveByPhone(ctx, phone)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, otp.ErrNotFound
		}
		return nil, err
	}

	now := uc.now()
	if now.After(record.ExpiresAt) {
		record.Status = otp.StatusExpired
		record.VerifiedAt = nil
		if _, err := uc.repo.Update(ctx, record); err != nil {
			return nil, err
		}
		return nil, otp.ErrExpired
	}

	if hashOTP(otpCode) != record.OtpHash {
		return nil, otp.ErrInvalidOTP
	}

	record.Status = otp.StatusVerified
	record.VerifiedAt = &now
	if _, err := uc.repo.Update(ctx, record); err != nil {
		return nil, err
	}

	return &VerifyResult{Status: record.Status}, nil
}

type noopNotifier struct{}

func (noopNotifier) SendOTP(ctx context.Context, phone string, otpCode string) error {
	return nil
}

func generateNumericCode(digits int) string {
	const charset = "0123456789"
	result := make([]byte, digits)
	for i := range result {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			result[i] = '0'
			continue
		}
		result[i] = charset[n.Int64()]
	}
	return string(result)
}

func hashOTP(code string) string {
	sum := sha256.Sum256([]byte(code))
	return hex.EncodeToString(sum[:])
}

func isNumeric(value string) bool {
	for _, r := range value {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}
