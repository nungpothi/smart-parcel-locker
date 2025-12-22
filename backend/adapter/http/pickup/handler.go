package pickup

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/otp"
	"smart-parcel-locker/backend/domain/parcel"
	pickupdomain "smart-parcel-locker/backend/domain/pickup"
	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/logger"
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
	requestURL := c.OriginalURL()
	var req requestOTPRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "pickup otp request invalid body", map[string]interface{}{
			"error": err.Error(),
		}, requestURL)
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid request body")
	}
	logger.Info(c.Context(), "pickup otp request received", map[string]interface{}{
		"receiverPhone": req.Phone,
	}, requestURL)

	result, err := h.otpUC.RequestOTP(c.Context(), req.Phone)
	if err != nil {
		code, msg := extractError(err)
		if code == "INTERNAL_ERROR" {
			logger.Error(c.Context(), "pickup otp request failed unexpectedly", map[string]interface{}{
				"receiverPhone": req.Phone,
				"error":         msg,
			}, requestURL)
		} else {
			logger.Warn(c.Context(), "pickup otp request failed", map[string]interface{}{
				"receiverPhone": req.Phone,
				"error":         msg,
			}, requestURL)
		}
		return mapError(c, err)
	}
	logger.Info(c.Context(), "pickup otp request succeeded", map[string]interface{}{
		"receiverPhone": req.Phone,
		"otpRef":        result.OtpRef,
	}, requestURL)

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
	requestURL := c.OriginalURL()
	var req verifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "pickup otp verify invalid body", map[string]interface{}{
			"error": err.Error(),
		}, requestURL)
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid request body")
	}
	logger.Info(c.Context(), "pickup otp verify request received", map[string]interface{}{
		"receiverPhone": req.Phone,
		"otpRef":        req.OtpRef,
	}, requestURL)

	result, err := h.otpUC.VerifyOTP(c.Context(), req.Phone, req.OtpRef, req.Otp)
	if err != nil {
		code, msg := extractError(err)
		if code == "INTERNAL_ERROR" {
			logger.Error(c.Context(), "pickup otp verify failed unexpectedly", map[string]interface{}{
				"receiverPhone": req.Phone,
				"otpRef":        req.OtpRef,
				"error":         msg,
			}, requestURL)
		} else {
			logger.Warn(c.Context(), "pickup otp verify failed", map[string]interface{}{
				"receiverPhone": req.Phone,
				"otpRef":        req.OtpRef,
				"error":         msg,
			}, requestURL)
		}
		return mapError(c, err)
	}
	logger.Info(c.Context(), "pickup otp verified", map[string]interface{}{
		"receiverPhone": req.Phone,
		"otpRef":        req.OtpRef,
	}, requestURL)

	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"pickup_token": result.PickupToken,
			"expires_at":   result.ExpiresAt,
		},
	})
}

func (h *Handler) ListParcels(c *fiber.Ctx) error {
	requestURL := c.OriginalURL()
	token := c.Get("X-Pickup-Token")
	logger.Info(c.Context(), "pickup parcel list request received", map[string]interface{}{
		"tokenPresent": token != "",
	}, requestURL)
	result, err := h.pickupUC.ListParcels(c.Context(), token)
	if err != nil {
		code, msg := extractError(err)
		if code == "INTERNAL_ERROR" {
			logger.Error(c.Context(), "pickup parcel list failed unexpectedly", map[string]interface{}{
				"error": msg,
			}, requestURL)
		} else {
			logger.Warn(c.Context(), "pickup parcel list failed", map[string]interface{}{
				"error": msg,
			}, requestURL)
		}
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
	logger.Info(c.Context(), "pickup parcel list succeeded", map[string]interface{}{
		"count": len(items),
	}, requestURL)
	return c.JSON(response.APIResponse{
		Success: true,
		Data:    items,
	})
}

type confirmPickupRequest struct {
	ParcelID string `json:"parcel_id"`
}

func (h *Handler) ConfirmPickup(c *fiber.Ctx) error {
	requestURL := c.OriginalURL()
	token := c.Get("X-Pickup-Token")
	var req confirmPickupRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "pickup confirm invalid body", map[string]interface{}{
			"error": err.Error(),
		}, requestURL)
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid request body")
	}
	if req.ParcelID == "" {
		logger.Warn(c.Context(), "pickup confirm missing parcel_id", map[string]interface{}{
			"parcelId": "",
		}, requestURL)
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "parcel_id is required")
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		logger.Warn(c.Context(), "pickup confirm invalid parcel_id", map[string]interface{}{
			"parcelId": req.ParcelID,
			"error":    err.Error(),
		}, requestURL)
		return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", "invalid parcel_id")
	}
	logger.Info(c.Context(), "pickup confirm request received", map[string]interface{}{
		"parcelId": parcelID.String(),
	}, requestURL)
	result, err := h.pickupUC.ConfirmPickup(c.Context(), token, parcelID)
	if err != nil {
		code, msg := extractError(err)
		if code == "INTERNAL_ERROR" {
			logger.Error(c.Context(), "pickup confirm failed unexpectedly", map[string]interface{}{
				"parcelId": parcelID.String(),
				"error":    msg,
			}, requestURL)
		} else {
			logger.Warn(c.Context(), "pickup confirm failed", map[string]interface{}{
				"parcelId": parcelID.String(),
				"error":    msg,
			}, requestURL)
		}
		return mapError(c, err)
	}
	logger.Info(c.Context(), "pickup confirmed", map[string]interface{}{
		"parcelId":    result.ParcelID,
		"status":      result.Status,
		"overdueDays": result.OverdueDays,
		"overdueFee":  result.OverdueFee,
	}, requestURL)
	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"parcel_id":    result.ParcelID,
			"status":       result.Status,
			"picked_up_at": result.PickedUpAt,
			"overdue_days": result.OverdueDays,
			"overdue_fee":  result.OverdueFee,
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
	if errors.Is(err, pickupdomain.ErrInvalidToken) {
		return pickupdomain.ErrInvalidToken.Code, pickupdomain.ErrInvalidToken.Message
	}
	if errors.Is(err, pickupdomain.ErrTokenExpired) {
		return pickupdomain.ErrTokenExpired.Code, pickupdomain.ErrTokenExpired.Message
	}
	if errors.Is(err, parcel.ErrParcelNotFound) {
		return parcel.ErrParcelNotFound.Code, parcel.ErrParcelNotFound.Message
	}
	return "INTERNAL_ERROR", err.Error()
}

func statusFromCode(code string) int {
	switch code {
	case "INVALID_REQUEST", "INVALID_OTP":
		return fiber.StatusBadRequest
	case "FORBIDDEN":
		return fiber.StatusForbidden
	case "INVALID_TOKEN":
		return fiber.StatusUnauthorized
	case "OTP_ALREADY_USED":
		return fiber.StatusConflict
	case "CONFLICT", "INVALID_STATUS_TRANSITION":
		return fiber.StatusConflict
	case "OTP_EXPIRED":
		return fiber.StatusGone
	case "OTP_NOT_FOUND":
		return fiber.StatusNotFound
	case "PARCEL_NOT_FOUND":
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
