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

// Handle is a placeholder handler showcasing the pattern.
func (h *Handler) Handle(c *fiber.Ctx) error {
	output, err := h.uc.Execute(c.Context(), templateusecase.Input{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
	}

	return c.JSON(response.APIResponse{
		Success: true,
		Data:    output,
	})
}
