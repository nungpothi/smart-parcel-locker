package admin

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires admin CRUD endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Post("/", handler.Create)
	router.Get("/:id", handler.Get)
	router.Put("/:id", handler.Update)
	router.Delete("/:id", handler.Delete)
}
