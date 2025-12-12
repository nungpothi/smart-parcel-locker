package template

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires the template HTTP endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	// TODO: adjust route definitions when adding real endpoints.
	router.Post("/", handler.Create)
	router.Get("/:id", handler.Get)
	router.Put("/:id", handler.Update)
	router.Delete("/:id", handler.Delete)
}
