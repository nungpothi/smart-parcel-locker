package parcel

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires parcel endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Post("/", handler.Create)
	router.Get("/:id", handler.Get)
}
