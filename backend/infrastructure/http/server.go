package http

import (
	"fmt"

	"github.com/gofiber/fiber/v2"

	"smart-parcel-locker/backend/pkg/config"
)

// NewFiberApp configures the Fiber application.
func NewFiberApp(cfg *config.Config) *fiber.App {
	return fiber.New(fiber.Config{
		AppName: fmt.Sprintf("%s-%s", cfg.App.Name, cfg.App.Env),
	})
}
