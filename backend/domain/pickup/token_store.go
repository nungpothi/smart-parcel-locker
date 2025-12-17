package pickup

import "time"

type TokenInfo struct {
	Phone     string
	ExpiresAt time.Time
}

// TokenStore keeps pickup tokens in memory for now.
type TokenStore interface {
	Store(token string, phone string, expiresAt time.Time)
	Get(token string) (TokenInfo, bool)
}
