package database

import (
	"fmt"
	gormmodels "smart-parcel-locker/backend/infrastructure/persistence/gorm/models"

	"gorm.io/gorm"
)

// Prepare applies DB-level setup (extensions + migrations).
func Prepare(db *gorm.DB) error {
	if err := ensureUUIDExtension(db); err != nil {
		return err
	}
	return AutoMigrateSchema(db)
}

// AutoMigrateSchema runs schema migration for core entities using schema models only.
func AutoMigrateSchema(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&gormmodels.Location{},
		&gormmodels.Locker{},
		&gormmodels.Compartment{},
		&gormmodels.Parcel{},
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
