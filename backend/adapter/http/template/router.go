package template

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires the template HTTP endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	// TODO: adjust route definitions when adding real endpoints.
	router.Get("/", handler.Handle)
}
