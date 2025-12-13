package parcel

import "github.com/gofiber/fiber/v2"

// RegisterRoutes wires parcel endpoints.
func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Post("/create", handler.Create)
	router.Post("/reserve", handler.Reserve)
	router.Post("/deposit", handler.Deposit)
	router.Post("/ready", handler.Ready)
	router.Get("/by-recipient/:recipient_id", handler.GetByRecipient)
	router.Get("/:parcel_id", handler.GetByID)
	router.Post("/otp/request", handler.RequestOTP)
	router.Post("/otp/verify", handler.VerifyOTP)
	router.Post("/pickup", handler.Pickup)
	router.Post("/expire/run", handler.RunExpire)
}
