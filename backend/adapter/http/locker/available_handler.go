package locker

import (
	"github.com/gofiber/fiber/v2"

	"smart-parcel-locker/backend/pkg/response"
	lockerquery "smart-parcel-locker/backend/usecase/lockerquery"
)

// Handler exposes public locker endpoints.
type Handler struct {
	uc *lockerquery.UseCase
}

// NewHandler builds a locker handler.
func NewHandler(uc *lockerquery.UseCase) *Handler {
	return &Handler{uc: uc}
}

// ListAvailable returns active lockers with location name.
func (h *Handler) ListAvailable(c *fiber.Ctx) error {
	lockers, err := h.uc.ListAvailable(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.Error("INTERNAL_ERROR", err.Error()))
	}
	items := make([]map[string]interface{}, 0, len(lockers))
	for _, l := range lockers {
		items = append(items, map[string]interface{}{
			"locker_id":     l.LockerID,
			"locker_code":   l.LockerCode,
			"location_name": l.LocationName,
		})
	}
	return c.JSON(response.APIResponse{Success: true, Data: items})
}
