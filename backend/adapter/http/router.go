package http

import (
	"github.com/gofiber/fiber/v2"

	adminadapter "smart-parcel-locker/backend/adapter/http/admin"
	adminopsadapter "smart-parcel-locker/backend/adapter/http/adminops"
	lockeradapter "smart-parcel-locker/backend/adapter/http/locker"
	parceladapter "smart-parcel-locker/backend/adapter/http/parcel"
	pickupadapter "smart-parcel-locker/backend/adapter/http/pickup"
)

// Register attaches all HTTP routes to the Fiber app.
func Register(
	app *fiber.App,
	parcelHandler *parceladapter.Handler,
	adminHandler *adminadapter.Handler,
	adminOpsHandler *adminopsadapter.Handler,
	lockerHandler *lockeradapter.Handler,
	pickupHandler *pickupadapter.Handler,
) {
	api := app.Group("/api/v1")

	parcelGroup := api.Group("/parcels")
	parceladapter.RegisterRoutes(parcelGroup, parcelHandler)

	lockerGroup := api.Group("/lockers")
	lockeradapter.RegisterRoutes(lockerGroup, lockerHandler)

	pickupGroup := api.Group("/pickup")
	pickupadapter.RegisterRoutes(pickupGroup, pickupHandler)

	adminGroup := api.Group("/admins")
	adminadapter.RegisterRoutes(adminGroup, adminHandler)

	adminOpsGroup := api.Group("/admin")
	adminopsadapter.RegisterRoutes(adminOpsGroup, adminOpsHandler)
}
