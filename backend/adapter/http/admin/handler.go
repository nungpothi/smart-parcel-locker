package admin

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

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
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	if req.Email == "" || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "email and name are required"})
	}
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

func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid id"})
	}
	var req createRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid request body"})
	}
	if req.Email == "" || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "email and name are required"})
	}
	result, err := h.uc.Update(c.Context(), adminusecase.UpdateInput{
		ID:    id,
		Email: req.Email,
		Name:  req.Name,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.APIResponse{Success: false, Error: "not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.APIResponse{Success: false, Error: "invalid id"})
	}
	if err := h.uc.Delete(c.Context(), id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.APIResponse{Success: false, Error: "not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{Success: false, Error: err.Error()})
	}
	return c.JSON(response.APIResponse{Success: true})
}
