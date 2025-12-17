package pickup

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/otp"
	pickupdomain "smart-parcel-locker/backend/domain/pickup"
	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/response"
	otpusecase "smart-parcel-locker/backend/usecase/otp"
	pickupusecase "smart-parcel-locker/backend/usecase/pickup"
)

// Handler exposes pickup OTP endpoints.
type Handler struct {
	otpUC    *otpusecase.UseCase
	pickupUC *pickupusecase.UseCase
}

func NewHandler(otpUC *otpusecase.UseCase, pickupUC *pickupusecase.UseCase) *Handler {
	return &Handler{otpUC: otpUC, pickupUC: pickupUC}
}

type requestOTPRequest struct {
	Phone string `json:"phone"`
}

func (h *Handler) RequestOTP(c *fiber.Ctx) error {
	var req requestOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid request body")
	}

	result, err := h.otpUC.RequestOTP(c.Context(), req.Phone)
	if err != nil {
		return mapError(c, err)
	}

	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"otp_ref":    result.OtpRef,
			"expires_at": result.ExpiresAt,
		},
	})
}

type verifyOTPRequest struct {
	Phone  string `json:"phone"`
	OtpRef string `json:"otp_ref"`
	Otp    string `json:"otp_code"`
}

func (h *Handler) VerifyOTP(c *fiber.Ctx) error {
	var req verifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid request body")
	}

	result, err := h.otpUC.VerifyOTP(c.Context(), req.Phone, req.OtpRef, req.Otp)
	if err != nil {
		return mapError(c, err)
	}

	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"pickup_token": result.PickupToken,
			"expires_at":   result.ExpiresAt,
		},
	})
}

func (h *Handler) ListParcels(c *fiber.Ctx) error {
	token := c.Get("X-Pickup-Token")
	result, err := h.pickupUC.ListParcels(c.Context(), token)
	if err != nil {
		return mapError(c, err)
	}
	items := make([]map[string]interface{}, 0, len(result))
	for _, p := range result {
		items = append(items, map[string]interface{}{
			"parcel_id":      p.ID,
			"parcel_code":    p.ParcelCode,
			"locker_id":      p.LockerID,
			"compartment_id": p.CompartmentID,
			"size":           p.Size,
			"expires_at":     p.ExpiresAt,
		})
	}
	return c.JSON(response.APIResponse{
		Success: true,
		Data:    items,
	})
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
		return otp.ErrNotFound.Code, otp.ErrNotFound.Message
	}
	if errors.Is(err, pickupdomain.ErrInvalidToken) {
		return pickupdomain.ErrInvalidToken.Code, pickupdomain.ErrInvalidToken.Message
	}
	if errors.Is(err, pickupdomain.ErrTokenExpired) {
		return pickupdomain.ErrTokenExpired.Code, pickupdomain.ErrTokenExpired.Message
	}
	return "INTERNAL_ERROR", err.Error()
}

func statusFromCode(code string) int {
	switch code {
	case "INVALID_REQUEST", "INVALID_OTP":
		return fiber.StatusBadRequest
	case "INVALID_TOKEN":
		return fiber.StatusUnauthorized
	case "OTP_ALREADY_USED":
		return fiber.StatusConflict
	case "OTP_EXPIRED":
		return fiber.StatusGone
	case "OTP_NOT_FOUND":
		return fiber.StatusNotFound
	case "TOO_MANY_REQUESTS":
		return fiber.StatusTooManyRequests
	case "TOKEN_EXPIRED":
		return fiber.StatusGone
	default:
		return fiber.StatusInternalServerError
	}
}

func writeError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}
