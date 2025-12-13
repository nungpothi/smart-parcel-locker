package auth

import (
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Session stores minimal user info for an access token.
type Session struct {
	Token     string
	UserID    uuid.UUID
	Role      string
	Phone     string
	IssuedAt  time.Time
	ExpiresAt time.Time
}

// TokenManager keeps in-memory tokens for v1.
type TokenManager struct {
	mu      sync.RWMutex
	tokens  map[string]Session
	ttl     time.Duration
	nowFunc func() time.Time
}

// NewTokenManager constructs a manager with the given TTL.
func NewTokenManager(ttl time.Duration) *TokenManager {
	return &TokenManager{
		tokens:  make(map[string]Session),
		ttl:     ttl,
		nowFunc: time.Now,
	}
}

// Issue creates and stores a session token.
func (m *TokenManager) Issue(userID uuid.UUID, role, phone string) Session {
	m.mu.Lock()
	defer m.mu.Unlock()
	now := m.nowFunc()
	token := uuid.NewString()
	s := Session{
		Token:     token,
		UserID:    userID,
		Role:      role,
		Phone:     phone,
		IssuedAt:  now,
		ExpiresAt: now.Add(m.ttl),
	}
	m.tokens[token] = s
	return s
}

// Validate returns session if valid.
func (m *TokenManager) Validate(token string) (Session, error) {
	m.mu.RLock()
	s, ok := m.tokens[token]
	m.mu.RUnlock()
	if !ok {
		return Session{}, errors.New("invalid token")
	}
	if m.nowFunc().After(s.ExpiresAt) {
		m.mu.Lock()
		delete(m.tokens, token)
		m.mu.Unlock()
		return Session{}, errors.New("invalid token")
	}
	return s, nil
}

// Revoke removes a token if present.
func (m *TokenManager) Revoke(token string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.tokens, token)
}
