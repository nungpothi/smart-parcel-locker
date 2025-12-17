package parcel

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/response"
	parcelusecase "smart-parcel-locker/backend/usecase/parcel"
)

// Handler exposes parcel endpoints.
type Handler struct {
	uc *parcelusecase.UseCase
}

func NewHandler(uc *parcelusecase.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	parcelID, err := uuid.Parse(c.Params("parcel_id"))
	if err != nil {
		return writeError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid parcel_id")
	}
	p, err := h.uc.GetByID(c.Context(), parcelID)
	if err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"parcel_id":      p.ID,
			"parcel_code":    p.ParcelCode,
			"status":         p.Status,
			"locker_id":      p.LockerID,
			"compartment_id": p.CompartmentID,
			"size":           p.Size,
			"receiver_phone": p.ReceiverPhone,
			"sender_phone":   p.SenderPhone,
			"pickup_code":    p.PickupCode,
			"reserved_at":    p.ReservedAt,
			"deposited_at":   p.DepositedAt,
			"picked_up_at":   p.PickedUpAt,
			"expires_at":     p.ExpiresAt,
		},
	})
}

func writeError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}

func mapError(c *fiber.Ctx, err error) error {
	if err == nil {
		return nil
	}
	code, msg := extractError(err)
	status := statusFromCode(code)
	return writeError(c, status, code, msg)
}

func extractError(err error) (string, string) {
	var appErr errorx.Error
	if errors.As(err, &appErr) {
		return appErr.Code, appErr.Message
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return parcel.ErrParcelNotFound.Code, parcel.ErrParcelNotFound.Message
	}
	return "INTERNAL_ERROR", err.Error()
}

func statusFromCode(code string) int {
	switch code {
	case "INVALID_UUID":
		return fiber.StatusBadRequest
	case parcel.ErrParcelNotFound.Code:
		return fiber.StatusNotFound
	default:
		return fiber.StatusInternalServerError
	}
}
