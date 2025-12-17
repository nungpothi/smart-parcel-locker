package pickup

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/otp"
	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/response"
	otpusecase "smart-parcel-locker/backend/usecase/otp"
)

// Handler exposes pickup OTP endpoints.
type Handler struct {
	uc *otpusecase.UseCase
}

func NewHandler(uc *otpusecase.UseCase) *Handler {
	return &Handler{uc: uc}
}

type requestOTPRequest struct {
	Phone string `json:"phone"`
}

func (h *Handler) RequestOTP(c *fiber.Ctx) error {
	var req requestOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid request body")
	}

	result, err := h.uc.RequestOTP(c.Context(), req.Phone)
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
	Phone string `json:"phone"`
	OTP   string `json:"otp"`
}

func (h *Handler) VerifyOTP(c *fiber.Ctx) error {
	var req verifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid request body")
	}

	result, err := h.uc.VerifyOTP(c.Context(), req.Phone, req.OTP)
	if err != nil {
		return mapError(c, err)
	}

	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"status": result.Status,
		},
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
	return "INTERNAL_ERROR", err.Error()
}

func statusFromCode(code string) int {
	switch code {
	case "INVALID_REQUEST", "INVALID_OTP":
		return fiber.StatusBadRequest
	case "OTP_EXPIRED":
		return fiber.StatusConflict
	case "OTP_NOT_FOUND":
		return fiber.StatusNotFound
	default:
		return fiber.StatusInternalServerError
	}
}

func writeError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}
