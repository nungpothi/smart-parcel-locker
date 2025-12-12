package parcel

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/parcel"
	"smart-parcel-locker/backend/pkg/response"
	parcelusecase "smart-parcel-locker/backend/usecase/parcel"
)

// Handler exposes minimal parcel endpoints.
type Handler struct {
	uc *parcelusecase.UseCase
}

func NewHandler(uc *parcelusecase.UseCase) *Handler {
	return &Handler{uc: uc}
}

type createRequest struct {
	LockerID   string `json:"locker_id"`
	SlotID     string `json:"slot_id"`
	Status     string `json:"status"`
	Size       int    `json:"size"`
	PickupCode string `json:"pickup_code"`
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
	slotID, err := uuid.Parse(req.SlotID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid slot_id"})
	}
	if strings.TrimSpace(req.PickupCode) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "pickup_code is required"})
	}
	if req.Size <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "size is required"})
	}

	status := parcel.StatusPending
	if req.Status != "" {
		status = parcel.Status(strings.ToUpper(req.Status))
	}

	result, err := h.uc.Create(c.Context(), parcelusecase.CreateInput{
		LockerID:   lockerID,
		SlotID:     slotID,
		Size:       req.Size,
		Status:     status,
		PickupCode: req.PickupCode,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid id"})
	}
	result, err := h.uc.Get(c.Context(), id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.APIResponse{Success: false, Error: "not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}
