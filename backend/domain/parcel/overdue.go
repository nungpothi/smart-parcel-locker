package parcel

import (
	"math"
	"time"
)

// CalculateOverdue computes overdue days and fee based on deposited time and fee per day.
func CalculateOverdue(depositedAt *time.Time, now time.Time, overdueFeePerDay int) (int, int) {
	if depositedAt == nil {
		return 0, 0
	}
	overdueDuration := now.Sub(*depositedAt)
	if overdueDuration <= 24*time.Hour {
		return 0, 0
	}
	overdueHours := overdueDuration.Hours()
	overdueDays := int(math.Ceil(overdueHours / 24))
	overdueFee := overdueDays * overdueFeePerDay
	return overdueDays, overdueFee
}
