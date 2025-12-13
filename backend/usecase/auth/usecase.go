package auth

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/user"
	"smart-parcel-locker/backend/pkg/auth"
)

// UseCase handles authentication flows.
type UseCase struct {
	userRepo interface {
		user.Repository
		WithDB(db *gorm.DB) user.Repository
	}
	tokenManager *auth.TokenManager
}

// RegisterInput holds data for registration.
type RegisterInput struct {
	Phone string
	Pass  string
	Role  string
}

// LoginInput holds credentials for login.
type LoginInput struct {
	Phone string
	Pass  string
}

// LoginResult contains user and token.
type LoginResult struct {
	UserID      uuid.UUID
	Role        string
	AccessToken string
}

// RegisterResult contains created user info.
type RegisterResult struct {
	UserID uuid.UUID
	Role   string
}

// NewUseCase constructs the auth use case.
func NewUseCase(userRepo user.Repository, tm *auth.TokenManager) *UseCase {
	return &UseCase{
		userRepo: userRepo.(interface {
			user.Repository
			WithDB(*gorm.DB) user.Repository
		}),
		tokenManager: tm,
	}
}

// Register creates a new user with hashed password.
func (uc *UseCase) Register(ctx context.Context, input RegisterInput) (*RegisterResult, error) {
	phone := strings.TrimSpace(input.Phone)
	pass := input.Pass
	if phone == "" || pass == "" || input.Role == "" {
		return nil, user.ErrInvalidCredentials
	}
	if _, err := uc.userRepo.GetByPhone(ctx, phone); err == nil {
		return nil, user.ErrPhoneExists
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(pass), 12)
	if err != nil {
		return nil, err
	}
	entity := &user.User{
		ID:           uuid.New(),
		Phone:        phone,
		PasswordHash: string(hash),
		UserType:     input.Role,
		CreatedAt:    time.Now(),
	}
	created, err := uc.userRepo.Create(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &RegisterResult{UserID: created.ID, Role: created.UserType}, nil
}

// Login validates credentials and issues a token.
func (uc *UseCase) Login(ctx context.Context, input LoginInput) (*LoginResult, error) {
	phone := strings.TrimSpace(input.Phone)
	pass := input.Pass
	if phone == "" || pass == "" {
		return nil, user.ErrInvalidCredentials
	}
	u, err := uc.userRepo.GetByPhone(ctx, phone)
	if err != nil {
		return nil, user.ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(pass)); err != nil {
		return nil, user.ErrInvalidCredentials
	}
	session := uc.tokenManager.Issue(u.ID, u.UserType, u.Phone)
	return &LoginResult{
		UserID:      u.ID,
		Role:        u.UserType,
		AccessToken: session.Token,
	}, nil
}

// GetUserByID returns user entity.
func (uc *UseCase) GetUserByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	return uc.userRepo.GetByID(ctx, id)
}

// ValidateToken returns session if token is valid.
func (uc *UseCase) ValidateToken(token string) (auth.Session, error) {
	if token == "" {
		return auth.Session{}, user.ErrInvalidToken
	}
	s, err := uc.tokenManager.Validate(token)
	if err != nil {
		return auth.Session{}, user.ErrInvalidToken
	}
	return s, nil
}

// Logout revokes token if present.
func (uc *UseCase) Logout(token string) {
	if token == "" {
		return
	}
	uc.tokenManager.Revoke(token)
}
