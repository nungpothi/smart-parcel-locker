package template

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

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
	if err := c.BodyParser(&req); err != nil {
		return templateInvalidRequest(c, "invalid request body")
	}
	if req.Name == "" {
		return templateInvalidRequest(c, "name is required")
	}

	result, err := h.uc.Create(c.Context(), templateusecase.CreateInput{Name: req.Name, Description: req.Description})
	if err != nil {
		return templateError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

// List returns all templates.
func (h *Handler) List(c *fiber.Ctx) error {
	result, err := h.uc.List(c.Context())
	if err != nil {
		return templateError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

// Get retrieves a Template by ID.
func (h *Handler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return templateError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	result, err := h.uc.Get(c.Context(), id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return templateError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		return templateError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

// Update modifies a Template.
func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return templateError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.BodyParser(&req); err != nil {
		return templateInvalidRequest(c, "invalid request body")
	}
	if req.Name == "" {
		return templateInvalidRequest(c, "name is required")
	}

	result, err := h.uc.Update(c.Context(), templateusecase.UpdateInput{ID: id, Name: req.Name, Description: req.Description})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return templateError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		return templateError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

// Delete removes a Template.
func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return templateError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	if err := h.uc.Delete(c.Context(), id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return templateError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		return templateError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.JSON(response.APIResponse{Success: true})
}

func templateError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}

func templateInvalidRequest(c *fiber.Ctx, msg string) error {
	return templateError(c, fiber.StatusBadRequest, "INVALID_REQUEST", msg)
}
