package auth

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires auth endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Post("/login", handler.Login)
	router.Post("/register", handler.Register)
	router.Get("/me", handler.Me)
	router.Post("/logout", handler.Logout)
}
