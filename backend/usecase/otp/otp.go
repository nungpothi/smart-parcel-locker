package otp

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"math/big"
	"sync"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/otp"
	pickupdomain "smart-parcel-locker/backend/domain/pickup"
	"smart-parcel-locker/backend/infrastructure/database"
	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/logger"
)

const otpTTL = 5 * time.Minute

// Notifier delivers OTP codes to users.
type Notifier interface {
	SendOTP(ctx context.Context, phone string, otpCode string) error
}

type otpRepository interface {
	otp.Repository
	WithDB(db *gorm.DB) otp.Repository
}

// UseCase handles OTP request/verify flow.
type UseCase struct {
	repo        otpRepository
	notifier    Notifier
	tokenStore  pickupdomain.TokenStore
	now         func() time.Time
	tx          *database.TransactionManager
	rateLimiter *phoneRateLimiter
}

type RequestResult struct {
	OtpRef    string
	ExpiresAt time.Time
}

type VerifyResult struct {
	Status      otp.Status
	PickupToken string
	ExpiresAt   time.Time
}

// NewUseCase constructs OTP use case.
func NewUseCase(
	repo otp.Repository,
	notifier Notifier,
	tokenStore pickupdomain.TokenStore,
	tx *database.TransactionManager,
) *UseCase {
	if notifier == nil {
		notifier = noopNotifier{}
	}
	if tokenStore == nil {
		tokenStore = noopTokenStore{}
	}
	if tx == nil {
		tx = database.NewTransactionManager(nil)
	}
	return &UseCase{
		repo: repo.(interface {
			otp.Repository
			WithDB(db *gorm.DB) otp.Repository
		}),
		notifier:    notifier,
		tokenStore:  tokenStore,
		now:         time.Now,
		tx:          tx,
		rateLimiter: newPhoneRateLimiter(30 * time.Second),
	}
}

// RequestOTP generates and stores an OTP, then notifies the user.
func (uc *UseCase) RequestOTP(ctx context.Context, phone string) (*RequestResult, error) {
	logger.Info(ctx, "otp usecase request started", map[string]interface{}{
		"receiverPhone": phone,
	}, "")
	if !isValidPhone(phone) {
		logger.Warn(ctx, "otp usecase request invalid phone", map[string]interface{}{
			"receiverPhone": phone,
		}, "")
		return nil, otp.ErrInvalidRequest
	}

	if !uc.rateLimiter.Allow(phone, uc.now()) {
		logger.Warn(ctx, "otp usecase request rate limited", map[string]interface{}{
			"receiverPhone": phone,
		}, "")
		return nil, errorx.Error{Code: "TOO_MANY_REQUESTS", Message: "too many requests"}
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
		logger.Error(ctx, "otp usecase create failed unexpectedly", map[string]interface{}{
			"receiverPhone": phone,
			"error":         err.Error(),
		}, "")
		return nil, err
	}

	logger.Info(ctx, "otp usecase created", map[string]interface{}{
		"receiverPhone": phone,
		"otpRef":        created.OtpRef,
	}, "")

	if err := uc.notifier.SendOTP(ctx, phone, otpCode); err != nil {
		logger.Warn(ctx, "otp usecase notify failed", map[string]interface{}{
			"receiverPhone": phone,
			"error":         err.Error(),
		}, "")
	} else {
		logger.Info(ctx, "otp usecase notified", map[string]interface{}{
			"receiverPhone": phone,
		}, "")
	}

	return &RequestResult{
		OtpRef:    created.OtpRef,
		ExpiresAt: created.ExpiresAt,
	}, nil
}

// VerifyOTP checks OTP code and marks it as verified.
func (uc *UseCase) VerifyOTP(ctx context.Context, phone string, otpRef string, otpCode string) (*VerifyResult, error) {
	logger.Info(ctx, "otp usecase verify started", map[string]interface{}{
		"receiverPhone": phone,
		"otpRef":        otpRef,
	}, "")
	if otpRef == "" || otpCode == "" || !isValidPhone(phone) || !isNumeric(otpCode) {
		logger.Warn(ctx, "otp usecase verify invalid request", map[string]interface{}{
			"receiverPhone": phone,
			"otpRef":        otpRef,
		}, "")
		return nil, otp.ErrInvalidRequest
	}
	if len(otpCode) != 6 {
		logger.Warn(ctx, "otp usecase verify invalid otp length", map[string]interface{}{
			"receiverPhone": phone,
			"otpRef":        otpRef,
		}, "")
		return nil, errorx.Error{Code: "INVALID_REQUEST", Message: "otp must be 6 digits"}
	}

	var result *VerifyResult
	err := uc.tx.WithinTransaction(ctx, func(tx *gorm.DB) error {
		var repo otp.Repository = uc.repo
		if tx != nil {
			repo = uc.repo.WithDB(tx)
		}
		record, err := repo.GetByRefAndPhone(ctx, otpRef, phone)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				logger.Warn(ctx, "otp usecase verify not found", map[string]interface{}{
					"receiverPhone": phone,
					"otpRef":        otpRef,
				}, "")
				return otp.ErrNotFound
			}
			logger.Error(ctx, "otp usecase verify load failed unexpectedly", map[string]interface{}{
				"receiverPhone": phone,
				"otpRef":        otpRef,
				"error":         err.Error(),
			}, "")
			return err
		}

		now := uc.now()
		switch record.Status {
		case otp.StatusVerified:
			logger.Warn(ctx, "otp usecase verify already used", map[string]interface{}{
				"receiverPhone": phone,
				"otpRef":        otpRef,
			}, "")
			return otp.ErrAlreadyUsed
		case otp.StatusExpired:
			logger.Warn(ctx, "otp usecase verify expired", map[string]interface{}{
				"receiverPhone": phone,
				"otpRef":        otpRef,
			}, "")
			return otp.ErrExpired
		}

		if now.After(record.ExpiresAt) {
			record.Status = otp.StatusExpired
			record.VerifiedAt = nil
			if _, err := repo.Update(ctx, record); err != nil {
				logger.Error(ctx, "otp usecase verify update expired failed unexpectedly", map[string]interface{}{
					"receiverPhone": phone,
					"otpRef":        otpRef,
					"error":         err.Error(),
				}, "")
				return err
			}
			logger.Warn(ctx, "otp usecase verify expired after lookup", map[string]interface{}{
				"receiverPhone": phone,
				"otpRef":        otpRef,
			}, "")
			return otp.ErrExpired
		}

		if hashOTP(otpCode) != record.OtpHash {
			logger.Warn(ctx, "otp usecase verify invalid otp", map[string]interface{}{
				"receiverPhone": phone,
				"otpRef":        otpRef,
			}, "")
			return otp.ErrInvalidOTP
		}

		record.Status = otp.StatusVerified
		record.VerifiedAt = &now
		if _, err := repo.Update(ctx, record); err != nil {
			logger.Error(ctx, "otp usecase verify update failed unexpectedly", map[string]interface{}{
				"receiverPhone": phone,
				"otpRef":        otpRef,
				"error":         err.Error(),
			}, "")
			return err
		}

		result = &VerifyResult{
			Status:      record.Status,
			PickupToken: uuid.NewString(),
			ExpiresAt:   now.Add(15 * time.Minute),
		}
		uc.tokenStore.Store(result.PickupToken, phone, result.ExpiresAt)
		return nil
	})
	if err != nil {
		if err == otp.ErrNotFound || err == otp.ErrInvalidOTP || err == otp.ErrAlreadyUsed || err == otp.ErrExpired || err == otp.ErrInvalidRequest {
			logger.Warn(ctx, "otp usecase verify failed", map[string]interface{}{
				"receiverPhone": phone,
				"otpRef":        otpRef,
				"error":         err.Error(),
			}, "")
		} else {
			logger.Error(ctx, "otp usecase verify failed unexpectedly", map[string]interface{}{
				"receiverPhone": phone,
				"otpRef":        otpRef,
				"error":         err.Error(),
			}, "")
		}
		return nil, err
	}
	logger.Info(ctx, "otp usecase verified", map[string]interface{}{
		"receiverPhone": phone,
		"otpRef":        otpRef,
	}, "")
	return result, nil
}

type noopNotifier struct{}

func (noopNotifier) SendOTP(ctx context.Context, phone string, otpCode string) error {
	return nil
}

type noopTokenStore struct{}

func (noopTokenStore) Store(token string, phone string, expiresAt time.Time) {}
func (noopTokenStore) Get(token string) (pickupdomain.TokenInfo, bool) {
	return pickupdomain.TokenInfo{}, false
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

func isValidPhone(value string) bool {
	if value == "" || len(value) < 9 || len(value) > 15 {
		return false
	}
	return isNumeric(value)
}

type phoneRateLimiter struct {
	window time.Duration
	mu     sync.Mutex
	last   map[string]time.Time
}

func newPhoneRateLimiter(window time.Duration) *phoneRateLimiter {
	return &phoneRateLimiter{
		window: window,
		last:   make(map[string]time.Time),
	}
}

func (rl *phoneRateLimiter) Allow(phone string, now time.Time) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	lastTime, ok := rl.last[phone]
	if ok && now.Sub(lastTime) < rl.window {
		return false
	}
	rl.last[phone] = now
	return true
}
