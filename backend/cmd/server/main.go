package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/adapter/http"
	templateadapter "smart-parcel-locker/backend/adapter/http/template"
	"smart-parcel-locker/backend/infrastructure/database"
	httpserver "smart-parcel-locker/backend/infrastructure/http"
	templatemodule "smart-parcel-locker/backend/infrastructure/template"
	"smart-parcel-locker/backend/pkg/config"
	templateusecase "smart-parcel-locker/backend/usecase/template"
)

func main() {
	cfg, err := config.Load(".env")
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.NewPostgres(cfg.Database)
	if err != nil {
		log.Fatalf("failed to init database: %v", err)
	}

	app := httpserver.NewFiberApp(cfg)
	wireModules(app, db)

	addr := fmt.Sprintf(":%d", cfg.HTTP.Port)
	log.Printf("starting server on %s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}

func wireModules(app *fiber.App, db *gorm.DB) {
	templateRepo := templatemodule.NewGormRepository(db)
	templateUC := templateusecase.NewUseCase(templateRepo)
	templateHandler := templateadapter.NewHandler(templateUC)

	http.Register(app, templateHandler)
}
