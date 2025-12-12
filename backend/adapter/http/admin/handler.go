package admin

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"smart-parcel-locker/backend/pkg/response"
	adminusecase "smart-parcel-locker/backend/usecase/admin"
)

// Handler exposes admin CRUD endpoints.
type Handler struct {
	uc *adminusecase.UseCase
}

func NewHandler(uc *adminusecase.UseCase) *Handler {
	return &Handler{uc: uc}
}

type createRequest struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var req createRequest
	_ = c.BodyParser(&req)
	result, err := h.uc.Create(c.Context(), adminusecase.CreateInput{
		Email: req.Email,
		Name:  req.Name,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Get(c *fiber.Ctx) error {
	id, _ := uuid.Parse(c.Params("id"))
	result, err := h.uc.Get(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id, _ := uuid.Parse(c.Params("id"))
	var req createRequest
	_ = c.BodyParser(&req)
	result, err := h.uc.Update(c.Context(), adminusecase.UpdateInput{
		ID:    id,
		Email: req.Email,
		Name:  req.Name,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id, _ := uuid.Parse(c.Params("id"))
	if err := h.uc.Delete(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true})
}
