package parcel

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/logger"
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

type depositRequest struct {
	LockerID      string `json:"locker_id"`
	Size          string `json:"size"`
	ReceiverPhone string `json:"receiver_phone"`
	SenderPhone   string `json:"sender_phone"`
}

func (h *Handler) Deposit(c *fiber.Ctx) error {
	var req depositRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid request body")
	}
	if req.LockerID == "" || req.Size == "" || req.ReceiverPhone == "" || req.SenderPhone == "" {
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "missing required fields")
	}
	lockerID, err := uuid.Parse(req.LockerID)
	if err != nil {
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid locker_id")
	}
	requestURL := c.OriginalURL()
	requestCtx := logger.WithTransactionID(c.Context(), uuid.New().String())
	logger.Info(requestCtx, "deposit request received", map[string]interface{}{
		"lockerId":      lockerID.String(),
		"requestedSize": req.Size,
	}, requestURL)

	result, err := h.uc.Deposit(requestCtx, parcelusecase.DepositInput{
		LockerID:      lockerID,
		Size:          req.Size,
		ReceiverPhone: req.ReceiverPhone,
		SenderPhone:   req.SenderPhone,
		RequestURL:    requestURL,
	})
	if err != nil {
		code, msg := extractError(err)
		if code == "INTERNAL_ERROR" {
			logger.Error(requestCtx, "deposit failed unexpectedly", map[string]interface{}{
				"lockerId":      lockerID.String(),
				"requestedSize": req.Size,
				"error":         msg,
			}, requestURL)
		}
		return mapError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"parcel_id":   result.ParcelID,
			"parcel_code": result.ParcelCode,
			"pickup_code": result.PickupCode,
			"status":      result.Status,
		},
	})
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
	case "INVALID_UUID", "INVALID_REQUEST":
		return fiber.StatusBadRequest
	case "NOT_FOUND", parcel.ErrParcelNotFound.Code:
		return fiber.StatusNotFound
	case "NO_AVAILABLE_COMPARTMENT", "LOCKER_INACTIVE", "INVALID_STATUS_TRANSITION":
		return fiber.StatusConflict
	default:
		return fiber.StatusInternalServerError
	}
}
