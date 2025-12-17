package models

import (
	"time"

	"github.com/google/uuid"
)

type Location struct {
	ID        uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	Code      string     `gorm:"column:code;type:varchar(50);not null;unique"`
	Name      string     `gorm:"column:name;type:varchar(200);not null"`
	Address   *string    `gorm:"column:address;type:text"`
	IsActive  bool       `gorm:"column:is_active;type:boolean;not null;default:true"`
	CreatedAt time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
	UpdatedAt *time.Time `gorm:"column:updated_at;type:timestamptz"`
}

func (Location) TableName() string {
	return "locations"
}

type Locker struct {
	ID         uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	LocationID uuid.UUID  `gorm:"column:location_id;type:uuid;not null;index:idx_lockers_location_id"`
	LockerCode string     `gorm:"column:locker_code;type:varchar(50);not null;unique"`
	Name       *string    `gorm:"column:name;type:varchar(200)"`
	Status     string     `gorm:"column:status;type:varchar(20);not null;default:ACTIVE;index:idx_lockers_status"`
	CreatedAt  time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
	UpdatedAt  *time.Time `gorm:"column:updated_at;type:timestamptz"`
}

func (Locker) TableName() string {
	return "lockers"
}

type Compartment struct {
	ID            uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	LockerID      uuid.UUID  `gorm:"column:locker_id;type:uuid;not null;index:idx_compartments_locker_id;index:idx_compartments_locker_id_size;index:idx_compartments_locker_id_status;uniqueIndex:uidx_compartment_locker_no"`
	CompartmentNo int        `gorm:"column:compartment_no;not null;uniqueIndex:uidx_compartment_locker_no"`
	Size          string     `gorm:"column:size;type:varchar(2);not null;index:idx_compartments_locker_id_size"`
	Status        string     `gorm:"column:status;type:varchar(20);not null;default:AVAILABLE;index:idx_compartments_locker_id_status"`
	CreatedAt     time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
	UpdatedAt     *time.Time `gorm:"column:updated_at;type:timestamptz"`
}

func (Compartment) TableName() string {
	return "compartments"
}

type Parcel struct {
	ID            uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	ParcelCode    string     `gorm:"column:parcel_code;type:varchar(40);not null;unique"`
	LockerID      uuid.UUID  `gorm:"column:locker_id;type:uuid;not null;index:idx_parcels_locker_id_status"`
	CompartmentID *uuid.UUID `gorm:"column:compartment_id;type:uuid;index:idx_parcels_compartment_id"`
	Size          string     `gorm:"column:size;type:varchar(2);not null"`
	ReceiverPhone string     `gorm:"column:receiver_phone;type:varchar(30)"`
	SenderPhone   string     `gorm:"column:sender_phone;type:varchar(30)"`
	PickupCode    string     `gorm:"column:pickup_code;type:varchar(40)"`
	Status        string     `gorm:"column:status;type:varchar(20);not null;index:idx_parcels_locker_id_status;index:idx_parcels_status_expires_at"`
	ReservedAt    *time.Time `gorm:"column:reserved_at;type:timestamptz"`
	DepositedAt   *time.Time `gorm:"column:deposited_at;type:timestamptz"`
	PickedUpAt    *time.Time `gorm:"column:picked_up_at;type:timestamptz"`
	ExpiresAt     *time.Time `gorm:"column:expires_at;type:timestamptz;index:idx_parcels_status_expires_at"`
	CreatedAt     time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
	UpdatedAt     *time.Time `gorm:"column:updated_at;type:timestamptz"`
}

func (Parcel) TableName() string {
	return "parcels"
}
