package parcel

import (
	"testing"
	"time"
)

func TestCalculateOverdueNilDepositedAt(t *testing.T) {
	now := time.Date(2025, 1, 10, 12, 0, 0, 0, time.UTC)
	days, fee := CalculateOverdue(nil, now, 25)
	if days != 0 || fee != 0 {
		t.Fatalf("expected 0,0; got %d,%d", days, fee)
	}
}

func TestCalculateOverdueExactly24Hours(t *testing.T) {
	depositedAt := time.Date(2025, 1, 9, 12, 0, 0, 0, time.UTC)
	now := depositedAt.Add(24 * time.Hour)
	days, fee := CalculateOverdue(&depositedAt, now, 10)
	if days != 0 || fee != 0 {
		t.Fatalf("expected 0,0; got %d,%d", days, fee)
	}
}

func TestCalculateOverdueMoreThan24Hours(t *testing.T) {
	depositedAt := time.Date(2025, 1, 9, 12, 0, 0, 0, time.UTC)
	now := depositedAt.Add(24*time.Hour + time.Second)
	days, fee := CalculateOverdue(&depositedAt, now, 10)
	if days != 2 || fee != 20 {
		t.Fatalf("expected 2,20; got %d,%d", days, fee)
	}
}

func TestCalculateOverdueMultipleDays(t *testing.T) {
	depositedAt := time.Date(2025, 1, 9, 12, 0, 0, 0, time.UTC)
	now := depositedAt.Add(49 * time.Hour)
	days, fee := CalculateOverdue(&depositedAt, now, 15)
	if days != 3 || fee != 45 {
		t.Fatalf("expected 3,45; got %d,%d", days, fee)
	}
}
