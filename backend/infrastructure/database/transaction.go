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
	if tm.db == nil {
		return nil
	}

	// TODO: add transaction orchestration and error handling in future phases.
	return tm.db.WithContext(ctx).Transaction(fn)
}
