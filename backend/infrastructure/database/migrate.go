package database

import (
	"fmt"

	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/admin"
	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/domain/template"
)

// Prepare applies DB-level setup (extensions + migrations).
func Prepare(db *gorm.DB) error {
	if err := ensureUUIDExtension(db); err != nil {
		return err
	}
	return AutoMigrate(db)
}

// AutoMigrate runs schema migration for core entities.
func AutoMigrate(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&admin.Admin{},
		&locker.Locker{},
		&locker.Slot{},
		&parcel.Parcel{},
		&template.Template{},
	); err != nil {
		return fmt.Errorf("auto migrate: %w", err)
	}
	return nil
}

func ensureUUIDExtension(db *gorm.DB) error {
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`).Error; err != nil {
		return fmt.Errorf("enable pgcrypto: %w", err)
	}
	return nil
}
