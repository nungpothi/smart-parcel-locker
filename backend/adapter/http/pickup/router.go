package pickup

import "github.com/gofiber/fiber/v2"

// RegisterRoutes attaches pickup endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Post("/otp/request", handler.RequestOTP)
	router.Post("/otp/verify", handler.VerifyOTP)
}
