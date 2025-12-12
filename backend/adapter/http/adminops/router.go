package adminops

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires admin operational endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Post("/locations", handler.CreateLocation)
	router.Get("/locations", handler.ListLocations)

	router.Post("/lockers", handler.CreateLocker)
	router.Get("/lockers", handler.ListLockers)
	router.Patch("/lockers/:locker_id/status", handler.UpdateLockerStatus)

	router.Post("/lockers/:locker_id/compartments", handler.CreateCompartments)
	router.Get("/lockers/:locker_id/compartments", handler.ListCompartments)

	router.Get("/overview", handler.Overview)
}
