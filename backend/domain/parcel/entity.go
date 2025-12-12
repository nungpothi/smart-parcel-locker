package parcel

// Parcel represents a package stored in a locker.
type Parcel struct {
	ID       uint `gorm:"primaryKey"`
	LockerID uint
	SlotID   uint
	Status   string `gorm:"size:50"`
	Size     int
	// TODO: add sender/recipient details in future phases.
}

// SetStatus updates the parcel status.
func (p *Parcel) SetStatus(status string) {
	p.Status = status
}
