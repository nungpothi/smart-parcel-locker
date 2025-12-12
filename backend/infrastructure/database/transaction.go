package database

import (
	"context"

	"gorm.io/gorm"
)

// TransactionManager coordinates database transactions.
type TransactionManager struct {
	db *gorm.DB
}

func NewTransactionManager(db *gorm.DB) *TransactionManager {
	return &TransactionManager{db: db}
}

// WithinTransaction runs the given function in a transaction boundary.
func (tm *TransactionManager) WithinTransaction(ctx context.Context, fn func(tx *gorm.DB) error) error {
	if tm == nil || tm.db == nil {
		return fn(nil)
	}

	return tm.db.WithContext(ctx).Transaction(fn)
}
