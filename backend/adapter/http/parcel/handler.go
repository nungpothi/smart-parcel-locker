package parcel

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

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
	LockerID uint   `json:"locker_id"`
	SlotID   uint   `json:"slot_id"`
	Status   string `json:"status"`
	Size     int    `json:"size"`
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var req createRequest
	_ = c.BodyParser(&req)
	result, err := h.uc.Create(c.Context(), parcelusecase.CreateInput{
		LockerID: req.LockerID,
		SlotID:   req.SlotID,
		Size:     req.Size,
		Status:   req.Status,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Get(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	result, err := h.uc.Get(c.Context(), uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}
