package template

import (
	"github.com/gofiber/fiber/v2"

	"smart-parcel-locker/backend/pkg/response"
	templateusecase "smart-parcel-locker/backend/usecase/template"
)

// Handler exposes HTTP endpoints for the template module.
type Handler struct {
	uc *templateusecase.UseCase
}

func NewHandler(uc *templateusecase.UseCase) *Handler {
	return &Handler{uc: uc}
}

// Create handles Template creation.
func (h *Handler) Create(c *fiber.Ctx) error {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	_ = c.BodyParser(&req)

	result, err := h.uc.Create(c.Context(), templateusecase.CreateInput{Name: req.Name, Description: req.Description})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

// List returns all templates.
func (h *Handler) List(c *fiber.Ctx) error {
	result, err := h.uc.List(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

// Get retrieves a Template by ID.
func (h *Handler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	result, err := h.uc.Get(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

// Update modifies a Template.
func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	_ = c.BodyParser(&req)

	result, err := h.uc.Update(c.Context(), templateusecase.UpdateInput{ID: id, Name: req.Name, Description: req.Description})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

// Delete removes a Template.
func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.uc.Delete(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true})
}
