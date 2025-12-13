package parcel

import (
	"errors"
	"smart-parcel-locker/backend/domain/compartment"
	lockerdomain "smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/response"
	parcelusecase "smart-parcel-locker/backend/usecase/parcel"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Handler exposes parcel workflow endpoints.
type Handler struct {
	uc *parcelusecase.UseCase
}

func NewHandler(uc *parcelusecase.UseCase) *Handler {
	return &Handler{uc: uc}
}

type createRequest struct {
	LockerID    string  `json:"locker_id"`
	Size        string  `json:"size"`
	CourierID   string  `json:"courier_id"`
	RecipientID string  `json:"recipient_id"`
	ExpiresAt   *string `json:"expires_at"`
}

type parcelIDRequest struct {
	ParcelID string `json:"parcel_id"`
}

type readyRequest struct {
	ParcelID  string  `json:"parcel_id"`
	ExpiresAt *string `json:"expires_at"`
}

type otpRequest struct {
	ParcelID    string `json:"parcel_id"`
	RecipientID string `json:"recipient_id"`
	OTPCode     string `json:"otp_code"`
	ExpiresAt   string `json:"expires_at"`
}

type otpVerifyRequest struct {
	OTPRef  string `json:"otp_ref"`
	OTPCode string `json:"otp_code"`
}

type pickupRequest struct {
	ParcelID string `json:"parcel_id"`
	OTPRef   string `json:"otp_ref"`
}

func parseTimePtr(value *string) (*time.Time, error) {
	if value == nil || *value == "" {
		return nil, nil
	}
	t, err := time.Parse(time.RFC3339, *value)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var req createRequest
	if err := c.BodyParser(&req); err != nil {
		return invalidRequest(c, "invalid request body")
	}
	lockerID, err := uuid.Parse(req.LockerID)
	if err != nil {
		return invalidUUID(c, "locker_id")
	}
	courierID, err := uuid.Parse(req.CourierID)
	if err != nil {
		return invalidUUID(c, "courier_id")
	}
	recipientID, err := uuid.Parse(req.RecipientID)
	if err != nil {
		return invalidUUID(c, "recipient_id")
	}
	if req.Size != "S" && req.Size != "M" && req.Size != "L" {
		return invalidInput(c, "size must be one of S, M, L")
	}
	expiresAt, err := parseTimePtr(req.ExpiresAt)
	if err != nil {
		return invalidInput(c, "invalid expires_at")
	}

	result, err := h.uc.Create(c.Context(), parcelusecase.CreateInput{
		LockerID:    lockerID,
		Size:        req.Size,
		CourierID:   courierID,
		RecipientID: recipientID,
		ExpiresAt:   expiresAt,
	})
	if err != nil {
		return mapError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Reserve(c *fiber.Ctx) error {
	var req parcelIDRequest
	if err := c.BodyParser(&req); err != nil {
		return invalidRequest(c, "invalid request body")
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return invalidUUID(c, "parcel_id")
	}
	result, err := h.uc.Reserve(c.Context(), parcelusecase.ReserveInput{ParcelID: parcelID})
	if err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Deposit(c *fiber.Ctx) error {
	var req parcelIDRequest
	if err := c.BodyParser(&req); err != nil {
		return invalidRequest(c, "invalid request body")
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return invalidUUID(c, "parcel_id")
	}
	result, err := h.uc.Deposit(c.Context(), parcelusecase.DepositInput{ParcelID: parcelID})
	if err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Ready(c *fiber.Ctx) error {
	var req readyRequest
	if err := c.BodyParser(&req); err != nil {
		return invalidRequest(c, "invalid request body")
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return invalidUUID(c, "parcel_id")
	}
	expiresAt, err := parseTimePtr(req.ExpiresAt)
	if err != nil {
		return invalidInput(c, "invalid expires_at")
	}
	result, err := h.uc.Ready(c.Context(), parcelusecase.ReadyInput{ParcelID: parcelID, ExpiresAt: expiresAt})
	if err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	parcelID, err := uuid.Parse(c.Params("parcel_id"))
	if err != nil {
		return invalidUUID(c, "parcel_id")
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
			"courier_id":     p.CourierID,
			"recipient_id":   p.RecipientID,
			"reserved_at":    p.ReservedAt,
			"deposited_at":   p.DepositedAt,
			"picked_up_at":   p.PickedUpAt,
			"expires_at":     p.ExpiresAt,
		},
	})
}

func (h *Handler) GetByRecipient(c *fiber.Ctx) error {
	recipientID, err := uuid.Parse(c.Params("recipient_id"))
	if err != nil {
		return invalidUUID(c, "recipient_id")
	}
	p, err := h.uc.GetActiveByRecipient(c.Context(), recipientID)
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
			"expires_at":     p.ExpiresAt,
		},
	})
}

func (h *Handler) RequestOTP(c *fiber.Ctx) error {
	var req otpRequest
	if err := c.BodyParser(&req); err != nil {
		return invalidRequest(c, "invalid request body")
	}
	var parcelID *uuid.UUID
	if req.ParcelID != "" {
		parsed, err := uuid.Parse(req.ParcelID)
		if err != nil {
			return invalidUUID(c, "parcel_id")
		}
		parcelID = &parsed
	}
	var recipientID *uuid.UUID
	if req.RecipientID != "" {
		parsed, err := uuid.Parse(req.RecipientID)
		if err != nil {
			return invalidUUID(c, "recipient_id")
		}
		recipientID = &parsed
	}
	if parcelID == nil && recipientID == nil {
		return invalidRequest(c, "parcel_id or recipient_id is required")
	}
	if req.OTPCode == "" {
		return invalidInput(c, "otp_code is required")
	}
	expiresAtTime, err := time.Parse(time.RFC3339, req.ExpiresAt)
	if err != nil {
		return invalidInput(c, "invalid expires_at")
	}

	result, err := h.uc.RequestOTP(c.Context(), parcelusecase.OTPRequestInput{
		ParcelID:    parcelID,
		RecipientID: recipientID,
		OTPCode:     req.OTPCode,
		ExpiresAt:   expiresAtTime,
	})
	if err != nil {
		return mapError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) VerifyOTP(c *fiber.Ctx) error {
	var req otpVerifyRequest
	if err := c.BodyParser(&req); err != nil {
		return invalidRequest(c, "invalid request body")
	}
	if req.OTPRef == "" || req.OTPCode == "" {
		return invalidRequest(c, "otp_ref and otp_code are required")
	}
	result, err := h.uc.VerifyOTP(c.Context(), parcelusecase.OTPVerifyInput{
		OTPRef:  req.OTPRef,
		OTPCode: req.OTPCode,
	})
	if err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Pickup(c *fiber.Ctx) error {
	var req pickupRequest
	if err := c.BodyParser(&req); err != nil {
		return invalidRequest(c, "invalid request body")
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return invalidUUID(c, "parcel_id")
	}
	if req.OTPRef == "" {
		return invalidRequest(c, "otp_ref is required")
	}
	result, err := h.uc.Pickup(c.Context(), parcelusecase.PickupInput{
		ParcelID: parcelID,
		OTPRef:   req.OTPRef,
	})
	if err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) RunExpire(c *fiber.Ctx) error {
	if err := h.uc.RunExpire(c.Context()); err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{Success: true})
}

func writeError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}

func invalidUUID(c *fiber.Ctx, field string) error {
	return writeError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid "+field)
}

func invalidRequest(c *fiber.Ctx, msg string) error {
	return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", msg)
}

func invalidInput(c *fiber.Ctx, msg string) error {
	return writeError(c, fiber.StatusBadRequest, "INVALID_INPUT", msg)
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
	case "INVALID_REQUEST", "INVALID_UUID", "INVALID_INPUT":
		return fiber.StatusBadRequest
	case parcel.ErrParcelNotFound.Code:
		return fiber.StatusNotFound
	case "OTP_NOT_FOUND":
		return fiber.StatusNotFound
	case "NO_AVAILABLE_COMPARTMENT", "INVALID_STATUS_TRANSITION", "OTP_ALREADY_USED", "LOCKER_INACTIVE":
		return fiber.StatusConflict
	case "PARCEL_EXPIRED", "OTP_EXPIRED":
		return fiber.StatusGone
	default:
		return fiber.StatusInternalServerError
	}
}
