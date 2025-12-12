package parcel

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/compartment"
	lockerdomain "smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/pkg/response"
	parcelusecase "smart-parcel-locker/backend/usecase/parcel"
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
	ParcelID  string `json:"parcel_id"`
	OTPCode   string `json:"otp_code"`
	ExpiresAt string `json:"expires_at"`
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
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	lockerID, err := uuid.Parse(req.LockerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid locker_id"})
	}
	courierID, err := uuid.Parse(req.CourierID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid courier_id"})
	}
	recipientID, err := uuid.Parse(req.RecipientID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid recipient_id"})
	}
	if req.Size != "S" && req.Size != "M" && req.Size != "L" {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "size must be one of S, M, L"})
	}
	expiresAt, err := parseTimePtr(req.ExpiresAt)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid expires_at"})
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
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid parcel_id"})
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
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid parcel_id"})
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
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid parcel_id"})
	}
	expiresAt, err := parseTimePtr(req.ExpiresAt)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid expires_at"})
	}
	result, err := h.uc.Ready(c.Context(), parcelusecase.ReadyInput{ParcelID: parcelID, ExpiresAt: expiresAt})
	if err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) RequestOTP(c *fiber.Ctx) error {
	var req otpRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid parcel_id"})
	}
	if req.OTPCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "otp_code is required"})
	}
	expiresAtTime, err := time.Parse(time.RFC3339, req.ExpiresAt)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid expires_at"})
	}

	result, err := h.uc.RequestOTP(c.Context(), parcelusecase.OTPRequestInput{
		ParcelID:  parcelID,
		OTPCode:   req.OTPCode,
		ExpiresAt: expiresAtTime,
	})
	if err != nil {
		return mapError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) VerifyOTP(c *fiber.Ctx) error {
	var req otpVerifyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	if req.OTPRef == "" || req.OTPCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "otp_ref and otp_code are required"})
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
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid parcel_id"})
	}
	if req.OTPRef == "" {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "otp_ref is required"})
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

func mapError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, parcel.ErrInvalidStatusTransition):
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case errors.Is(err, parcel.ErrOTPInvalid):
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case errors.Is(err, parcel.ErrOTPExpired):
		return c.Status(fiber.StatusGone).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case errors.Is(err, lockerdomain.ErrNoAvailableSlot):
		return c.Status(fiber.StatusConflict).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case errors.Is(err, lockerdomain.ErrLockerInactive):
		return c.Status(fiber.StatusConflict).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case errors.Is(err, compartment.ErrInvalidCompartmentStatus):
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case errors.Is(err, gorm.ErrRecordNotFound):
		return c.Status(fiber.StatusNotFound).JSON(response.APIResponse{Success: false, Error: "not found"})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
}
