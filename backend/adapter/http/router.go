package http

import (
	"github.com/gofiber/fiber/v2"

	templateadapter "smart-parcel-locker/backend/adapter/http/template"
)

// Register attaches all HTTP routes to the Fiber app.
func Register(app *fiber.App, templateHandler *templateadapter.Handler) {
	api := app.Group("/api")

	templateGroup := api.Group("/templates")
	templateadapter.RegisterRoutes(templateGroup, templateHandler)
}
