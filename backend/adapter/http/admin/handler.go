package admin

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/admin"
	"smart-parcel-locker/backend/pkg/logger"
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
	requestURL := c.OriginalURL()
	var req createRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "admin create invalid body", map[string]interface{}{
			"error": err.Error(),
		}, requestURL)
		return adminInvalidRequest(c, "invalid request body")
	}
	if req.Username == "" || req.PasswordHash == "" || req.Role == "" {
		logger.Warn(c.Context(), "admin create missing fields", map[string]interface{}{
			"username": req.Username,
			"role":     req.Role,
		}, requestURL)
		return adminInvalidRequest(c, "username, password_hash, and role are required")
	}
	if req.Role != "ADMIN" {
		logger.Warn(c.Context(), "admin create invalid role", map[string]interface{}{
			"username": req.Username,
			"role":     req.Role,
		}, requestURL)
		return adminInvalidRequest(c, "role must be ADMIN")
	}
	logger.Info(c.Context(), "admin create request received", map[string]interface{}{
		"username": req.Username,
		"role":     req.Role,
	}, requestURL)
	result, err := h.uc.Create(c.Context(), adminusecase.CreateInput{
		Username:     req.Username,
		PasswordHash: req.PasswordHash,
		Role:         req.Role,
	})
	if err != nil {
		logger.Error(c.Context(), "admin create failed unexpectedly", map[string]interface{}{
			"username": req.Username,
			"role":     req.Role,
			"error":    err.Error(),
		}, requestURL)
		return adminError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	logger.Info(c.Context(), "admin created", map[string]interface{}{
		"adminId":  result.ID,
		"username": result.Username,
		"role":     result.Role,
	}, requestURL)
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{Success: true, Data: adminToResponse(result)})
}

func (h *Handler) Get(c *fiber.Ctx) error {
	requestURL := c.OriginalURL()
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		logger.Warn(c.Context(), "admin get invalid id", map[string]interface{}{
			"adminId": c.Params("id"),
			"error":   err.Error(),
		}, requestURL)
		return adminError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	logger.Info(c.Context(), "admin get request received", map[string]interface{}{
		"adminId": id.String(),
	}, requestURL)
	result, err := h.uc.Get(c.Context(), id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(c.Context(), "admin not found", map[string]interface{}{
				"adminId": id.String(),
				"error":   err.Error(),
			}, requestURL)
			return adminError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		logger.Error(c.Context(), "admin get failed unexpectedly", map[string]interface{}{
			"adminId": id.String(),
			"error":   err.Error(),
		}, requestURL)
		return adminError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	logger.Info(c.Context(), "admin retrieved", map[string]interface{}{
		"adminId":  result.ID,
		"username": result.Username,
		"role":     result.Role,
	}, requestURL)
	return c.JSON(response.APIResponse{Success: true, Data: adminToResponse(result)})
}

func (h *Handler) Update(c *fiber.Ctx) error {
	requestURL := c.OriginalURL()
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		logger.Warn(c.Context(), "admin update invalid id", map[string]interface{}{
			"adminId": c.Params("id"),
			"error":   err.Error(),
		}, requestURL)
		return adminError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	var req createRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "admin update invalid body", map[string]interface{}{
			"adminId": id.String(),
			"error":   err.Error(),
		}, requestURL)
		return adminInvalidRequest(c, "invalid request body")
	}
	if req.Username == "" || req.PasswordHash == "" || req.Role == "" {
		logger.Warn(c.Context(), "admin update missing fields", map[string]interface{}{
			"adminId":  id.String(),
			"username": req.Username,
			"role":     req.Role,
		}, requestURL)
		return adminInvalidRequest(c, "username, password_hash, and role are required")
	}
	if req.Role != "ADMIN" {
		logger.Warn(c.Context(), "admin update invalid role", map[string]interface{}{
			"adminId":  id.String(),
			"username": req.Username,
			"role":     req.Role,
		}, requestURL)
		return adminInvalidRequest(c, "role must be ADMIN")
	}
	logger.Info(c.Context(), "admin update request received", map[string]interface{}{
		"adminId":  id.String(),
		"username": req.Username,
		"role":     req.Role,
	}, requestURL)
	result, err := h.uc.Update(c.Context(), adminusecase.UpdateInput{
		ID:           id,
		Username:     req.Username,
		PasswordHash: req.PasswordHash,
		Role:         req.Role,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(c.Context(), "admin update not found", map[string]interface{}{
				"adminId": id.String(),
				"error":   err.Error(),
			}, requestURL)
			return adminError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		logger.Error(c.Context(), "admin update failed unexpectedly", map[string]interface{}{
			"adminId": id.String(),
			"error":   err.Error(),
		}, requestURL)
		return adminError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	logger.Info(c.Context(), "admin updated", map[string]interface{}{
		"adminId":  result.ID,
		"username": result.Username,
		"role":     result.Role,
	}, requestURL)
	return c.JSON(response.APIResponse{Success: true, Data: adminToResponse(result)})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	requestURL := c.OriginalURL()
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		logger.Warn(c.Context(), "admin delete invalid id", map[string]interface{}{
			"adminId": c.Params("id"),
			"error":   err.Error(),
		}, requestURL)
		return adminError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid id")
	}
	logger.Info(c.Context(), "admin delete request received", map[string]interface{}{
		"adminId": id.String(),
	}, requestURL)
	if err := h.uc.Delete(c.Context(), id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(c.Context(), "admin delete not found", map[string]interface{}{
				"adminId": id.String(),
				"error":   err.Error(),
			}, requestURL)
			return adminError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
		}
		logger.Error(c.Context(), "admin delete failed unexpectedly", map[string]interface{}{
			"adminId": id.String(),
			"error":   err.Error(),
		}, requestURL)
		return adminError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
	}
	logger.Info(c.Context(), "admin deleted", map[string]interface{}{
		"adminId": id.String(),
	}, requestURL)
	return c.JSON(response.APIResponse{Success: true})
}

func adminError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}

func adminInvalidRequest(c *fiber.Ctx, msg string) error {
	return adminError(c, fiber.StatusBadRequest, "INVALID_REQUEST", msg)
}

func adminToResponse(result *admin.Admin) map[string]interface{} {
	if result == nil {
		return nil
	}
	return map[string]interface{}{
		"id":            result.ID,
		"username":      result.Username,
		"password_hash": result.PasswordHash,
		"role":          result.Role,
		"created_at":    result.CreatedAt,
		"updated_at":    result.UpdatedAt,
	}
}
