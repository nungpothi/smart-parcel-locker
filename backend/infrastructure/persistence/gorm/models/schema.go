package models

import (
	"time"

	"github.com/google/uuid"
)

type Location struct {
	ID        uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	Code      string     `gorm:"column:code;type:varchar(50);not null;uniqueIndex:uidx_locations_code"`
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
	LockerCode string     `gorm:"column:locker_code;type:varchar(50);not null;uniqueIndex:uidx_lockers_code"`
	Name       *string    `gorm:"column:name;type:varchar(200)"`
	Status     string     `gorm:"column:status;type:varchar(20);not null;default:ACTIVE"`
	CreatedAt  time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
	UpdatedAt  *time.Time `gorm:"column:updated_at;type:timestamptz"`

	Location Location `gorm:"foreignKey:LocationID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

func (Locker) TableName() string {
	return "lockers"
}

type Compartment struct {
	ID               uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	LockerID         uuid.UUID  `gorm:"column:locker_id;type:uuid;not null;index:idx_compartments_locker_id_size,priority:1;index:idx_compartments_locker_id_status,priority:1;uniqueIndex:uidx_compartment_locker_no,priority:1"`
	CompartmentNo    int        `gorm:"column:compartment_no;not null;uniqueIndex:uidx_compartment_locker_no,priority:2"`
	Size             string     `gorm:"column:size;type:varchar(2);not null;index:idx_compartments_locker_id_size,priority:2"`
	Status           string     `gorm:"column:status;type:varchar(20);not null;default:AVAILABLE;index:idx_compartments_locker_id_status,priority:2"`
	OverdueFeePerDay int        `gorm:"column:overdue_fee_per_day;type:integer;not null;default:0"`
	CreatedAt        time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
	UpdatedAt        *time.Time `gorm:"column:updated_at;type:timestamptz"`

	Locker Locker `gorm:"foreignKey:LockerID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

func (Compartment) TableName() string {
	return "compartments"
}

type User struct {
	ID          uuid.UUID `gorm:"column:id;type:uuid;primaryKey"`
	UserType    string    `gorm:"column:user_type;type:varchar(20);not null"`
	Phone       string    `gorm:"column:phone;type:varchar(30);not null;index:idx_users_phone"`
	DisplayName *string   `gorm:"column:display_name;type:varchar(200)"`
	CreatedAt   time.Time `gorm:"column:created_at;type:timestamptz;not null"`
}

func (User) TableName() string {
	return "users"
}

type Parcel struct {
	ID            uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	ParcelCode    string     `gorm:"column:parcel_code;type:varchar(40);not null;uniqueIndex:uidx_parcels_code"`
	LockerID      uuid.UUID  `gorm:"column:locker_id;type:uuid;not null;index:idx_parcels_locker_status,priority:1"`
	CompartmentID *uuid.UUID `gorm:"column:compartment_id;type:uuid;index:idx_parcels_compartment_id"`
	Size          string     `gorm:"column:size;type:varchar(2);not null"`
	ReceiverPhone string     `gorm:"column:receiver_phone;type:varchar(30);not null;index:idx_parcels_receiver_status,priority:1"`
	SenderPhone   string     `gorm:"column:sender_phone;type:varchar(30);not null;index:idx_parcels_sender_status,priority:1"`
	PickupCode    *string    `gorm:"column:pickup_code;type:varchar(40);uniqueIndex:uidx_parcels_pickup_code"`
	Status        string     `gorm:"column:status;type:varchar(20);not null;index:idx_parcels_locker_status,priority:2;index:idx_parcels_status_expires_at,priority:1;index:idx_parcels_receiver_status,priority:2;index:idx_parcels_sender_status,priority:2"`
	DepositedAt   *time.Time `gorm:"column:deposited_at;type:timestamptz"`
	PickedUpAt    *time.Time `gorm:"column:picked_up_at;type:timestamptz"`
	ExpiresAt     *time.Time `gorm:"column:expires_at;type:timestamptz;index:idx_parcels_status_expires_at,priority:2"`
	CreatedAt     time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
	UpdatedAt     *time.Time `gorm:"column:updated_at;type:timestamptz"`

	Locker      Locker       `gorm:"foreignKey:LockerID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Compartment *Compartment `gorm:"foreignKey:CompartmentID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

func (Parcel) TableName() string {
	return "parcels"
}

type ParcelEvent struct {
	ID        uuid.UUID `gorm:"column:id;type:uuid;primaryKey"`
	ParcelID  uuid.UUID `gorm:"column:parcel_id;type:uuid;not null;index:idx_parcel_events_parcel_id"`
	EventType string    `gorm:"column:event_type;type:varchar(30);not null"`
	CreatedAt time.Time `gorm:"column:created_at;type:timestamptz;not null"`

	Parcel Parcel `gorm:"foreignKey:ParcelID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

func (ParcelEvent) TableName() string {
	return "parcel_events"
}

type ParcelOTP struct {
	ID         uuid.UUID  `gorm:"column:id;type:uuid;primaryKey"`
	Phone      string     `gorm:"column:phone;type:varchar(30);not null;index:idx_parcel_otps_phone_status,priority:1"`
	OtpRef     string     `gorm:"column:otp_ref;type:varchar(64);not null;uniqueIndex:uidx_parcel_otps_ref"`
	OtpHash    string     `gorm:"column:otp_hash;type:varchar(255);not null"`
	Status     string     `gorm:"column:status;type:varchar(20);not null;index:idx_parcel_otps_phone_status,priority:2"`
	ExpiresAt  time.Time  `gorm:"column:expires_at;type:timestamptz;not null;index:idx_parcel_otps_expires_at"`
	VerifiedAt *time.Time `gorm:"column:verified_at;type:timestamptz"`
	CreatedAt  time.Time  `gorm:"column:created_at;type:timestamptz;not null"`
}

func (ParcelOTP) TableName() string {
	return "parcel_otps"
}
