//go:build ignore

package locker

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires locker endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Post("/deposit", handler.Deposit)
	router.Post("/retrieve", handler.Retrieve)
}
