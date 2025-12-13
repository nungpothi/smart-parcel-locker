package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/adapter/http"
	adminadapter "smart-parcel-locker/backend/adapter/http/admin"
	adminopsadapter "smart-parcel-locker/backend/adapter/http/adminops"
	authadapter "smart-parcel-locker/backend/adapter/http/auth"
	lockeradapter "smart-parcel-locker/backend/adapter/http/locker"
	parceladapter "smart-parcel-locker/backend/adapter/http/parcel"
	templateadapter "smart-parcel-locker/backend/adapter/http/template"
	"smart-parcel-locker/backend/domain/template"
	admininfra "smart-parcel-locker/backend/infrastructure/admin"
	compartmentinfra "smart-parcel-locker/backend/infrastructure/compartment"
	"smart-parcel-locker/backend/infrastructure/database"
	httpserver "smart-parcel-locker/backend/infrastructure/http"
	locationinfra "smart-parcel-locker/backend/infrastructure/location"
	lockerinfra "smart-parcel-locker/backend/infrastructure/locker"
	parcelinfra "smart-parcel-locker/backend/infrastructure/parcel"
	templatemodule "smart-parcel-locker/backend/infrastructure/template"
	userinfra "smart-parcel-locker/backend/infrastructure/user"
	"smart-parcel-locker/backend/pkg/auth"
	"smart-parcel-locker/backend/pkg/config"
	adminusecase "smart-parcel-locker/backend/usecase/admin"
	adminopsusecase "smart-parcel-locker/backend/usecase/adminops"
	authusecase "smart-parcel-locker/backend/usecase/auth"
	lockerqueryusecase "smart-parcel-locker/backend/usecase/lockerquery"
	parcelusecase "smart-parcel-locker/backend/usecase/parcel"
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
	if err := database.Prepare(db); err != nil {
		log.Fatalf("failed to prepare database: %v", err)
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
	txManager := database.NewTransactionManager(db)
	tokenManager := auth.NewTokenManager(24 * time.Hour)

	// Template module
	templateRepo := templatemodule.NewGormRepository(db)
	templateUC := templateusecase.NewUseCase(templateRepo, db, txManager, func(db *gorm.DB) template.Repository {
		return templatemodule.NewGormRepository(db)
	})
	templateHandler := templateadapter.NewHandler(templateUC)

	// Locker & parcel modules
	lockerRepo := lockerinfra.NewGormRepository(db)
	parcelRepo := parcelinfra.NewGormRepository(db)
	parcelUC := parcelusecase.NewUseCase(parcelRepo, lockerRepo, txManager)
	parcelHandler := parceladapter.NewHandler(parcelUC)

	// Admin module
	adminRepo := admininfra.NewGormRepository(db)
	adminUC := adminusecase.NewUseCase(adminRepo)
	adminHandler := adminadapter.NewHandler(adminUC)

	// Admin operations module
	locationRepo := locationinfra.NewGormRepository(db)
	compRepo := compartmentinfra.NewGormRepository(db)
	adminOpsUC := adminopsusecase.NewUseCase(locationRepo, lockerRepo, compRepo, parcelRepo, txManager)
	adminOpsHandler := adminopsadapter.NewHandler(adminOpsUC)

	// Locker query module
	lockerQueryUC := lockerqueryusecase.NewUseCase(lockerRepo, locationRepo)
	lockerHandler := lockeradapter.NewHandler(lockerQueryUC)

	// Auth module
	userRepo := userinfra.NewGormRepository(db)
	authUC := authusecase.NewUseCase(userRepo, tokenManager)
	authHandler := authadapter.NewHandler(authUC)

	http.Register(app, templateHandler, parcelHandler, adminHandler, adminOpsHandler, authHandler, lockerHandler)
}
