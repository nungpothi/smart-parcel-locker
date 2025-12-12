package template

// Template represents a sample domain entity used as a blueprint for future modules.
type Template struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"size:255"`
	// TODO: add domain-specific fields in future phases.
}
