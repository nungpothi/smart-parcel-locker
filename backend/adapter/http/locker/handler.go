package locker

import (
	"net/http"

	"github.com/gofiber/fiber/v2"

	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/pkg/response"
	depositusecase "smart-parcel-locker/backend/usecase/locker"
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
	LockerID   uint `json:"locker_id"`
	ParcelSize int  `json:"parcel_size"`
}

type retrieveRequest struct {
	LockerID uint `json:"locker_id"`
	ParcelID uint `json:"parcel_id"`
}

func (h *Handler) Deposit(c *fiber.Ctx) error {
	var req depositRequest
	_ = c.BodyParser(&req)

	result, err := h.depositUC.Execute(c.Context(), depositusecase.DepositInput{
		LockerID:   req.LockerID,
		ParcelSize: req.ParcelSize,
	})
	if err != nil {
		return mapError(c, err)
	}

	return c.Status(http.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Retrieve(c *fiber.Ctx) error {
	var req retrieveRequest
	_ = c.BodyParser(&req)

	result, err := h.retrieveUC.Execute(c.Context(), depositusecase.RetrieveInput{
		LockerID: req.LockerID,
		ParcelID: req.ParcelID,
	})
	if err != nil {
		return mapError(c, err)
	}

	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func mapError(c *fiber.Ctx, err error) error {
	switch err {
	case locker.ErrNoAvailableSlot:
		return c.Status(http.StatusConflict).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case locker.ErrInvalidDeposit:
		return c.Status(http.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: err.Error()})
	case locker.ErrParcelNotFound:
		return c.Status(http.StatusNotFound).JSON(response.APIResponse{Success: false, Error: err.Error()})
	default:
		return c.Status(http.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
}
