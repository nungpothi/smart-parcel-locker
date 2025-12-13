package locker

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires locker query endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Get("/available", handler.ListAvailable)
}
