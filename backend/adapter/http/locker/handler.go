//go:build ignore

package locker

import (
	"errors"
	"net/http"
	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/pkg/response"
	depositusecase "smart-parcel-locker/backend/usecase/locker"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Handler exposes locker endpoints.
type Handler struct {
	depositUC  *depositusecase.DepositUseCase
	retrieveUC *depositusecase.RetrieveUseCase
}

func NewHandler(depositUC *depositusecase.DepositUseCase, retrieveUC *depositusecase.RetrieveUseCase) *Handler {
	return &Handler{
		depositUC:  depositUC,
		retrieveUC: retrieveUC,
	}
}

type depositRequest struct {
	LockerID   string `json:"locker_id"`
	ParcelSize int    `json:"parcel_size"`
}

type retrieveRequest struct {
	LockerID string `json:"locker_id"`
	ParcelID string `json:"parcel_id"`
}

func (h *Handler) Deposit(c *fiber.Ctx) error {
	var req depositRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	if req.LockerID == "" || req.ParcelSize <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "locker_id and parcel_size are required"})
	}

	lockerID, err := uuid.Parse(req.LockerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid locker_id"})
	}

	result, err := h.depositUC.Execute(c.Context(), depositusecase.DepositInput{
		LockerID:   lockerID,
		ParcelSize: req.ParcelSize,
	})
	if err != nil {
		return mapError(c, err)
	}

	return c.Status(http.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Retrieve(c *fiber.Ctx) error {
	var req retrieveRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}

	lockerID, err := uuid.Parse(req.LockerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid locker_id"})
	}
	parcelID, err := uuid.Parse(req.ParcelID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid parcel_id"})
	}

	result, err := h.retrieveUC.Execute(c.Context(), depositusecase.RetrieveInput{
		LockerID: lockerID,
		ParcelID: parcelID,
	})
	if err != nil {
		return mapError(c, err)
	}

	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func mapError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, locker.ErrNoAvailableSlot):
		return c.Status(http.StatusConflict).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case errors.Is(err, locker.ErrInvalidDeposit):
		return c.Status(http.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case errors.Is(err, locker.ErrParcelNotFound):
		return c.Status(http.StatusNotFound).JSON(response.APIResponse{Success: false, Error: err.Error()})
	default:
		return c.Status(http.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
}
