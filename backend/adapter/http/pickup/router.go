package pickup

import "github.com/gofiber/fiber/v2"

// RegisterRoutes attaches pickup endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Post("/request-otp", handler.RequestOTP)
	router.Post("/verify-otp", handler.VerifyOTP)
}
