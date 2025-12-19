package http

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"smart-parcel-locker/backend/pkg/config"
)

// NewFiberApp configures the Fiber application.
func NewFiberApp(cfg *config.Config) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName: fmt.Sprintf("%s-%s", cfg.App.Name, cfg.App.Env),
	})
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "*",
		AllowMethods: "GET,POST,PATCH,PUT,DELETE,OPTIONS",
	}))
	return app
}
