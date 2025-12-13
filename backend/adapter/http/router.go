package http

import (
	"github.com/gofiber/fiber/v2"

	adminadapter "smart-parcel-locker/backend/adapter/http/admin"
	adminopsadapter "smart-parcel-locker/backend/adapter/http/adminops"
	authadapter "smart-parcel-locker/backend/adapter/http/auth"
	lockeradapter "smart-parcel-locker/backend/adapter/http/locker"
	parceladapter "smart-parcel-locker/backend/adapter/http/parcel"
	templateadapter "smart-parcel-locker/backend/adapter/http/template"
)

// Register attaches all HTTP routes to the Fiber app.
func Register(
	app *fiber.App,
	templateHandler *templateadapter.Handler,
	parcelHandler *parceladapter.Handler,
	adminHandler *adminadapter.Handler,
	adminOpsHandler *adminopsadapter.Handler,
	authHandler *authadapter.Handler,
	lockerHandler *lockeradapter.Handler,
) {
	api := app.Group("/api/v1")

	templateGroup := api.Group("/templates")
	templateadapter.RegisterRoutes(templateGroup, templateHandler)

	parcelGroup := api.Group("/parcels")
	parceladapter.RegisterRoutes(parcelGroup, parcelHandler)

	authGroup := api.Group("/auth")
	authadapter.RegisterRoutes(authGroup, authHandler)

	lockerGroup := api.Group("/lockers")
	lockeradapter.RegisterRoutes(lockerGroup, lockerHandler)

	adminGroup := api.Group("/admins")
	adminadapter.RegisterRoutes(adminGroup, adminHandler)

	adminOpsGroup := api.Group("/admin")
	adminopsadapter.RegisterRoutes(adminOpsGroup, adminOpsHandler)
}
