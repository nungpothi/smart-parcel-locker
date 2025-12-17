package parcel

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires parcel endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Get("/:parcel_id", handler.GetByID)
}
