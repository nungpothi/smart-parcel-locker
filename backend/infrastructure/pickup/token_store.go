package pickup

import (
	"sync"
	"time"

	pickupdomain "smart-parcel-locker/backend/domain/pickup"
)

// TokenStore keeps pickup tokens in-memory.
type TokenStore struct {
	mu     sync.RWMutex
	tokens map[string]pickupdomain.TokenInfo
}

func NewTokenStore() *TokenStore {
	return &TokenStore{
		tokens: make(map[string]pickupdomain.TokenInfo),
	}
}

func (s *TokenStore) Store(token string, phone string, expiresAt time.Time) {
	if token == "" {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tokens[token] = pickupdomain.TokenInfo{
		Phone:     phone,
		ExpiresAt: expiresAt,
	}
}

func (s *TokenStore) Get(token string) (pickupdomain.TokenInfo, bool) {
	if token == "" {
		return pickupdomain.TokenInfo{}, false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	info, ok := s.tokens[token]
	return info, ok
}
