package admin

// Admin represents a minimal administrative user.
type Admin struct {
	ID    uint   `gorm:"primaryKey"`
	Email string `gorm:"size:255"`
	Name  string `gorm:"size:255"`
}
