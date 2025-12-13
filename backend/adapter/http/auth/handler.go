package auth

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/user"
	"smart-parcel-locker/backend/pkg/response"
	authusecase "smart-parcel-locker/backend/usecase/auth"
)

// Handler exposes authentication endpoints.
type Handler struct {
	uc *authusecase.UseCase
}

// NewHandler builds a new auth handler.
func NewHandler(uc *authusecase.UseCase) *Handler {
	return &Handler{uc: uc}
}

type loginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type registerRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

// Register creates a new user.
func (h *Handler) Register(c *fiber.Ctx) error {
	var req registerRequest
	if err := c.BodyParser(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if req.Phone == "" || req.Password == "" || req.Role == "" {
		return badRequest(c, "phone, password and role are required")
	}
	res, err := h.uc.Register(c.Context(), authusecase.RegisterInput{
		Phone: req.Phone,
		Pass:  req.Password,
		Role:  req.Role,
	})
	if err != nil {
		return mapError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"user_id": res.UserID,
			"role":    res.Role,
		},
	})
}

// Login authenticates a user and returns a token.
func (h *Handler) Login(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if req.Phone == "" || req.Password == "" {
		return badRequest(c, "phone and password are required")
	}
	res, err := h.uc.Login(c.Context(), authusecase.LoginInput{
		Phone: req.Phone,
		Pass:  req.Password,
	})
	if err != nil {
		return mapError(c, err)
	}
	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"user_id":      res.UserID,
			"role":         res.Role,
			"access_token": res.AccessToken,
		},
	})
}

// Me returns current user based on bearer token.
func (h *Handler) Me(c *fiber.Ctx) error {
	token := parseBearer(c.Get("Authorization"))
	session, err := h.uc.ValidateToken(token)
	if err != nil {
		return unauthorized(c, "invalid token")
	}
	u, err := h.uc.GetUserByID(c.Context(), session.UserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return unauthorized(c, "invalid token")
		}
		return internalError(c, err)
	}
	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"user_id": u.ID,
			"role":    u.UserType,
			"phone":   u.Phone,
		},
	})
}

// Logout revokes the current token.
func (h *Handler) Logout(c *fiber.Ctx) error {
	token := parseBearer(c.Get("Authorization"))
	if token == "" {
		return unauthorized(c, "invalid token")
	}
	h.uc.Logout(token)
	return c.JSON(response.APIResponse{Success: true})
}

func parseBearer(header string) string {
	const prefix = "Bearer "
	if header == "" {
		return ""
	}
	if !strings.HasPrefix(header, prefix) {
		return ""
	}
	return strings.TrimSpace(header[len(prefix):])
}

func mapError(c *fiber.Ctx, err error) error {
	if err == nil {
		return nil
	}
	switch {
	case errors.Is(err, user.ErrInvalidCredentials):
		return writeError(c, fiber.StatusUnauthorized, user.ErrInvalidCredentials.Code, user.ErrInvalidCredentials.Message)
	case errors.Is(err, user.ErrPhoneExists):
		return writeError(c, fiber.StatusConflict, user.ErrPhoneExists.Code, user.ErrPhoneExists.Message)
	case errors.Is(err, gorm.ErrRecordNotFound):
		return writeError(c, fiber.StatusUnauthorized, user.ErrInvalidCredentials.Code, user.ErrInvalidCredentials.Message)
	default:
		return internalError(c, err)
	}
}

func badRequest(c *fiber.Ctx, msg string) error {
	return writeError(c, fiber.StatusBadRequest, "INVALID_REQUEST", msg)
}

func unauthorized(c *fiber.Ctx, msg string) error {
	return writeError(c, fiber.StatusUnauthorized, "INVALID_TOKEN", msg)
}

func internalError(c *fiber.Ctx, err error) error {
	return writeError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
}

func writeError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}
