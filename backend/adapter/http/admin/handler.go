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
	Username     string `json:"username"`
	PasswordHash string `json:"password_hash"`
	Role         string `json:"role"`
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var req createRequest
	if err := c.BodyParser(&req); err != nil {
		return adminInvalidRequest(c, "invalid request body")
	}
	if req.Username == "" || req.PasswordHash == "" || req.Role == "" {
		return adminInvalidRequest(c, "username, password_hash, and role are required")
	}
	result, err := h.uc.Create(c.Context(), adminusecase.CreateInput{
		Username:     req.Username,
		PasswordHash: req.PasswordHash,
		Role:         req.Role,
	})
	if err != nil {
		return adminError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return adminError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	result, err := h.uc.Get(c.Context(), id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return adminError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		return adminError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return adminError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	var req createRequest
	if err := c.BodyParser(&req); err != nil {
		return adminInvalidRequest(c, "invalid request body")
	}
	if req.Username == "" || req.PasswordHash == "" || req.Role == "" {
		return adminInvalidRequest(c, "username, password_hash, and role are required")
	}
	result, err := h.uc.Update(c.Context(), adminusecase.UpdateInput{
		ID:           id,
		Username:     req.Username,
		PasswordHash: req.PasswordHash,
		Role:         req.Role,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return adminError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		return adminError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.JSON(response.APIResponse{Success: true, Data: result})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return adminError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	if err := h.uc.Delete(c.Context(), id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return adminError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		return adminError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	return c.JSON(response.APIResponse{Success: true})
}

func adminError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}

func adminInvalidRequest(c *fiber.Ctx, msg string) error {
	return adminError(c, fiber.StatusBadRequest, "INVALID_REQUEST", msg)
}
