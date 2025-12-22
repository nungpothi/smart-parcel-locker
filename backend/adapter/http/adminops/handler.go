package adminops

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/pkg/errorx"
	"smart-parcel-locker/backend/pkg/logger"
	"smart-parcel-locker/backend/pkg/response"
	adminopsusecase "smart-parcel-locker/backend/usecase/adminops"
)

// Handler exposes admin operational endpoints.
type Handler struct {
	uc *adminopsusecase.UseCase
}

func NewHandler(uc *adminopsusecase.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) CreateLocation(c *fiber.Ctx) error {
	var req struct {
		Code     string  `json:"code"`
		Name     string  `json:"name"`
		Address  *string `json:"address"`
		IsActive *bool   `json:"is_active"`
	}
	requestURL := c.OriginalURL()
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "admin location create invalid body", map[string]interface{}{
			"error": err.Error(),
		}, requestURL)
		return opsInvalidRequest(c, "invalid request body")
	}
	if req.Code == "" || req.Name == "" {
		logger.Warn(c.Context(), "admin location create missing fields", map[string]interface{}{
			"code": req.Code,
			"name": req.Name,
		}, requestURL)
		return opsInvalidRequest(c, "code and name are required")
	}
	logger.Info(c.Context(), "admin location create request received", map[string]interface{}{
		"locationCode": req.Code,
		"name":         req.Name,
	}, requestURL)
	result, err := h.uc.CreateLocation(c.Context(), adminopsusecase.CreateLocationInput{
		Code:     req.Code,
		Name:     req.Name,
		Address:  req.Address,
		IsActive: req.IsActive,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(c.Context(), "admin location create not found", map[string]interface{}{
				"locationCode": req.Code,
				"name":         req.Name,
				"error":        err.Error(),
			}, requestURL)
		} else {
			var appErr errorx.Error
			if errors.As(err, &appErr) || err.Error() == "invalid status" {
				logger.Warn(c.Context(), "admin location create rejected", map[string]interface{}{
					"locationCode": req.Code,
					"name":         req.Name,
					"error":        err.Error(),
				}, requestURL)
			} else {
				logger.Error(c.Context(), "admin location create failed unexpectedly", map[string]interface{}{
					"locationCode": req.Code,
					"name":         req.Name,
					"error":        err.Error(),
				}, requestURL)
			}
		}
		return handleError(c, err)
	}
	logger.Info(c.Context(), "admin location created", map[string]interface{}{
		"locationId":   result.ID,
		"locationCode": result.Code,
		"name":         result.Name,
		"status":       result.IsActive,
	}, requestURL)
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"location_id": result.ID,
			"code":        result.Code,
			"name":        result.Name,
			"is_active":   result.IsActive,
		},
	})
}

func (h *Handler) ListLocations(c *fiber.Ctx) error {
	requestURL := c.OriginalURL()
	logger.Info(c.Context(), "admin location list request received", map[string]interface{}{
		"action": "list_locations",
	}, requestURL)
	result, err := h.uc.ListLocations(c.Context())
	if err != nil {
		logger.Error(c.Context(), "admin location list failed unexpectedly", map[string]interface{}{
			"action": "list_locations",
			"error":  err.Error(),
		}, requestURL)
		return handleError(c, err)
	}
	locations := make([]map[string]interface{}, 0, len(result))
	for _, loc := range result {
		locations = append(locations, map[string]interface{}{
			"location_id": loc.ID,
			"code":        loc.Code,
			"name":        loc.Name,
			"is_active":   loc.IsActive,
		})
	}
	logger.Info(c.Context(), "admin location list succeeded", map[string]interface{}{
		"action": "list_locations",
		"count":  len(locations),
	}, requestURL)
	return c.JSON(response.APIResponse{Success: true, Data: locations})
}

func (h *Handler) CreateLocker(c *fiber.Ctx) error {
	var req struct {
		LocationID string `json:"location_id"`
		LockerCode string `json:"locker_code"`
		Name       string `json:"name"`
	}
	requestURL := c.OriginalURL()
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "locker create request invalid body", map[string]interface{}{
			"error": err.Error(),
		}, requestURL)
		return opsInvalidRequest(c, "invalid request body")
	}
	logger.Info(c.Context(), "locker create request received", map[string]interface{}{
		"locationId": req.LocationID,
		"lockerCode": req.LockerCode,
	}, requestURL)
	if req.LocationID == "" || req.LockerCode == "" {
		logger.Warn(c.Context(), "locker create request missing fields", map[string]interface{}{
			"locationId": req.LocationID,
			"lockerCode": req.LockerCode,
		}, requestURL)
		return opsInvalidRequest(c, "location_id and locker_code are required")
	}
	locationID, err := uuid.Parse(req.LocationID)
	if err != nil {
		logger.Warn(c.Context(), "locker create request invalid location_id", map[string]interface{}{
			"locationId": req.LocationID,
			"error":      err.Error(),
		}, requestURL)
		return opsInvalidUUID(c, "location_id")
	}
	result, err := h.uc.CreateLocker(c.Context(), adminopsusecase.CreateLockerInput{
		LocationID: locationID,
		LockerCode: req.LockerCode,
		Name:       req.Name,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(c.Context(), "locker create location not found", map[string]interface{}{
				"locationId": req.LocationID,
				"lockerCode": req.LockerCode,
				"error":      err.Error(),
			}, requestURL)
		} else {
			var appErr errorx.Error
			if errors.As(err, &appErr) || err.Error() == "invalid status" {
				logger.Warn(c.Context(), "locker create rejected", map[string]interface{}{
					"locationId": req.LocationID,
					"lockerCode": req.LockerCode,
					"error":      err.Error(),
				}, requestURL)
			} else {
				logger.Error(c.Context(), "locker create failed unexpectedly", map[string]interface{}{
					"locationId": req.LocationID,
					"lockerCode": req.LockerCode,
					"error":      err.Error(),
				}, requestURL)
			}
		}
		return handleError(c, err)
	}
	logger.Info(c.Context(), "locker created", map[string]interface{}{
		"lockerId":   result.ID,
		"lockerCode": result.LockerCode,
		"locationId": req.LocationID,
		"status":     result.Status,
	}, requestURL)
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"locker_id":   result.ID,
			"locker_code": result.LockerCode,
			"status":      result.Status,
		},
	})
}

func (h *Handler) ListLockers(c *fiber.Ctx) error {
	requestURL := c.OriginalURL()
	logger.Info(c.Context(), "locker list request received", map[string]interface{}{
		"endpoint": "list_lockers",
	}, requestURL)
	result, err := h.uc.ListLockers(c.Context())
	if err != nil {
		logger.Error(c.Context(), "locker list failed unexpectedly", map[string]interface{}{
			"endpoint": "list_lockers",
			"error":    err.Error(),
		}, requestURL)
		return handleError(c, err)
	}
	lockers := make([]map[string]interface{}, 0, len(result))
	for _, l := range result {
		lockers = append(lockers, map[string]interface{}{
			"locker_id":   l.ID,
			"locker_code": l.LockerCode,
			"location_id": l.LocationID,
			"status":      l.Status,
		})
	}
	logger.Info(c.Context(), "locker list succeeded", map[string]interface{}{
		"endpoint": "list_lockers",
		"count":    len(lockers),
	}, requestURL)
	return c.JSON(response.APIResponse{Success: true, Data: lockers})
}

func (h *Handler) UpdateLockerStatus(c *fiber.Ctx) error {
	lockerIDStr := c.Params("locker_id")
	requestURL := c.OriginalURL()
	logger.Info(c.Context(), "locker status update request received", map[string]interface{}{
		"lockerId": lockerIDStr,
	}, requestURL)
	lockerID, err := uuid.Parse(lockerIDStr)
	if err != nil {
		logger.Warn(c.Context(), "locker status update invalid locker_id", map[string]interface{}{
			"lockerId": lockerIDStr,
			"error":    err.Error(),
		}, requestURL)
		return opsInvalidUUID(c, "locker_id")
	}
	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "locker status update invalid body", map[string]interface{}{
			"lockerId": lockerIDStr,
			"error":    err.Error(),
		}, requestURL)
		return opsInvalidRequest(c, "invalid request body")
	}
	if req.Status == "" {
		logger.Warn(c.Context(), "locker status update missing status", map[string]interface{}{
			"lockerId": lockerIDStr,
		}, requestURL)
		return opsInvalidRequest(c, "status is required")
	}
	result, err := h.uc.UpdateLockerStatus(c.Context(), adminopsusecase.UpdateLockerStatusInput{
		LockerID: lockerID,
		Status:   req.Status,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(c.Context(), "locker status update not found", map[string]interface{}{
				"lockerId": lockerIDStr,
				"status":   req.Status,
				"error":    err.Error(),
			}, requestURL)
		} else {
			var appErr errorx.Error
			if errors.As(err, &appErr) || err.Error() == "invalid status" {
				logger.Warn(c.Context(), "locker status update rejected", map[string]interface{}{
					"lockerId": lockerIDStr,
					"status":   req.Status,
					"error":    err.Error(),
				}, requestURL)
			} else {
				logger.Error(c.Context(), "locker status update failed unexpectedly", map[string]interface{}{
					"lockerId": lockerIDStr,
					"status":   req.Status,
					"error":    err.Error(),
				}, requestURL)
			}
		}
		return handleError(c, err)
	}
	logger.Info(c.Context(), "locker status updated", map[string]interface{}{
		"lockerId": result.ID,
		"status":   result.Status,
	}, requestURL)
	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"locker_id": result.ID,
			"status":    result.Status,
		},
	})
}

func (h *Handler) CreateCompartments(c *fiber.Ctx) error {
	lockerIDStr := c.Params("locker_id")
	requestURL := c.OriginalURL()
	lockerID, err := uuid.Parse(lockerIDStr)
	if err != nil {
		logger.Warn(c.Context(), "admin compartment create invalid locker_id", map[string]interface{}{
			"lockerId": lockerIDStr,
			"error":    err.Error(),
		}, requestURL)
		return opsInvalidUUID(c, "locker_id")
	}
	var req struct {
		Compartments []struct {
			CompartmentNo    int    `json:"compartment_no"`
			Size             string `json:"size"`
			OverdueFeePerDay *int   `json:"overdue_fee_per_day"`
		} `json:"compartments"`
	}
	if err := c.BodyParser(&req); err != nil {
		logger.Warn(c.Context(), "admin compartment create invalid body", map[string]interface{}{
			"lockerId": lockerIDStr,
			"error":    err.Error(),
		}, requestURL)
		return opsInvalidRequest(c, "invalid request body")
	}
	if len(req.Compartments) == 0 {
		logger.Warn(c.Context(), "admin compartment create missing compartments", map[string]interface{}{
			"lockerId": lockerIDStr,
		}, requestURL)
		return opsInvalidRequest(c, "compartments are required")
	}
	specs := make([]adminopsusecase.CompartmentSpec, 0, len(req.Compartments))
	overdueFees := make([]int, 0, len(req.Compartments))
	for _, cpt := range req.Compartments {
		if cpt.CompartmentNo <= 0 {
			logger.Warn(c.Context(), "admin compartment create invalid compartment_no", map[string]interface{}{
				"lockerId":      lockerIDStr,
				"compartmentNo": cpt.CompartmentNo,
			}, requestURL)
			return opsInvalidInput(c, "compartment_no must be greater than 0")
		}
		if cpt.Size != "S" && cpt.Size != "M" && cpt.Size != "L" {
			logger.Warn(c.Context(), "admin compartment create invalid size", map[string]interface{}{
				"lockerId":      lockerIDStr,
				"compartmentNo": cpt.CompartmentNo,
				"size":          cpt.Size,
			}, requestURL)
			return opsInvalidInput(c, "size must be one of S, M, L")
		}
		overdueFeePerDay := 0
		if cpt.OverdueFeePerDay != nil {
			overdueFeePerDay = *cpt.OverdueFeePerDay
		}
		if overdueFeePerDay < 0 {
			logger.Warn(c.Context(), "admin compartment create invalid overdue_fee_per_day", map[string]interface{}{
				"lockerId":         lockerIDStr,
				"compartmentNo":    cpt.CompartmentNo,
				"overdueFeePerDay": overdueFeePerDay,
			}, requestURL)
			return opsInvalidInput(c, "overdue_fee_per_day must be greater than or equal to 0")
		}
		specs = append(specs, adminopsusecase.CompartmentSpec{
			CompartmentNo:    cpt.CompartmentNo,
			Size:             cpt.Size,
			OverdueFeePerDay: overdueFeePerDay,
		})
		overdueFees = append(overdueFees, overdueFeePerDay)
	}
	logger.Info(c.Context(), "admin compartment create request received", map[string]interface{}{
		"lockerId":         lockerIDStr,
		"count":            len(specs),
		"overdueFeePerDay": overdueFees,
	}, requestURL)
	createdCount, err := h.uc.CreateCompartments(c.Context(), adminopsusecase.CreateCompartmentsInput{
		LockerID:     lockerID,
		Compartments: specs,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(c.Context(), "admin compartment create locker not found", map[string]interface{}{
				"lockerId": lockerIDStr,
				"error":    err.Error(),
			}, requestURL)
		} else {
			var appErr errorx.Error
			if errors.As(err, &appErr) || err.Error() == "invalid status" {
				logger.Warn(c.Context(), "admin compartment create rejected", map[string]interface{}{
					"lockerId": lockerIDStr,
					"error":    err.Error(),
				}, requestURL)
			} else {
				logger.Error(c.Context(), "admin compartment create failed unexpectedly", map[string]interface{}{
					"lockerId": lockerIDStr,
					"error":    err.Error(),
				}, requestURL)
			}
		}
		return handleError(c, err)
	}
	logger.Info(c.Context(), "admin compartment created", map[string]interface{}{
		"lockerId":         lockerIDStr,
		"createdCount":     createdCount,
		"overdueFeePerDay": overdueFees,
	}, requestURL)
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"created_count": createdCount,
		},
	})
}

func (h *Handler) ListCompartments(c *fiber.Ctx) error {
	lockerIDStr := c.Params("locker_id")
	requestURL := c.OriginalURL()
	lockerID, err := uuid.Parse(lockerIDStr)
	if err != nil {
		logger.Warn(c.Context(), "admin compartment list invalid locker_id", map[string]interface{}{
			"lockerId": lockerIDStr,
			"error":    err.Error(),
		}, requestURL)
		return opsInvalidUUID(c, "locker_id")
	}
	logger.Info(c.Context(), "admin compartment list request received", map[string]interface{}{
		"lockerId": lockerIDStr,
	}, requestURL)
	result, err := h.uc.ListCompartments(c.Context(), lockerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Warn(c.Context(), "admin compartment list not found", map[string]interface{}{
				"lockerId": lockerIDStr,
				"error":    err.Error(),
			}, requestURL)
		} else {
			logger.Error(c.Context(), "admin compartment list failed unexpectedly", map[string]interface{}{
				"lockerId": lockerIDStr,
				"error":    err.Error(),
			}, requestURL)
		}
		return handleError(c, err)
	}
	comps := make([]map[string]interface{}, 0, len(result))
	for _, comp := range result {
		comps = append(comps, map[string]interface{}{
			"compartment_id": comp.ID,
			"compartment_no": comp.CompartmentNo,
			"size":           comp.Size,
			"status":         comp.Status,
		})
	}
	logger.Info(c.Context(), "admin compartment list succeeded", map[string]interface{}{
		"lockerId": lockerIDStr,
		"count":    len(comps),
	}, requestURL)
	return c.JSON(response.APIResponse{Success: true, Data: comps})
}

func (h *Handler) Overview(c *fiber.Ctx) error {
	requestURL := c.OriginalURL()
	logger.Info(c.Context(), "admin overview request received", map[string]interface{}{
		"action": "overview",
	}, requestURL)
	result, err := h.uc.Overview(c.Context())
	if err != nil {
		logger.Error(c.Context(), "admin overview failed unexpectedly", map[string]interface{}{
			"action": "overview",
			"error":  err.Error(),
		}, requestURL)
		return handleError(c, err)
	}
	logger.Info(c.Context(), "admin overview succeeded", map[string]interface{}{
		"action": "overview",
	}, requestURL)
	return c.JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"total_locations":        result.TotalLocations,
			"total_lockers":          result.TotalLockers,
			"total_compartments":     result.TotalCompartments,
			"compartments_available": result.CompartmentsAvailable,
			"parcels_active":         result.ParcelsActive,
			"parcels_expired":        result.ParcelsExpired,
		},
	})
}

func handleError(c *fiber.Ctx, err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return opsError(c, fiber.StatusNotFound, "NOT_FOUND", "not found")
	}
	var appErr errorx.Error
	if errors.As(err, &appErr) {
		return opsError(c, statusFromCode(appErr.Code), appErr.Code, appErr.Message)
	}
	if err.Error() == "invalid status" {
		return opsInvalidInput(c, err.Error())
	}
	return opsError(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
}

func statusFromCode(code string) int {
	switch code {
	case "INVALID_REQUEST", "INVALID_UUID", "INVALID_INPUT":
		return fiber.StatusBadRequest
	case "NO_AVAILABLE_COMPARTMENT", "INVALID_STATUS_TRANSITION", "LOCKER_INACTIVE":
		return fiber.StatusConflict
	default:
		return fiber.StatusInternalServerError
	}
}

func opsError(c *fiber.Ctx, status int, code, msg string) error {
	return c.Status(status).JSON(response.Error(code, msg))
}

func opsInvalidRequest(c *fiber.Ctx, msg string) error {
	return opsError(c, fiber.StatusBadRequest, "INVALID_REQUEST", msg)
}

func opsInvalidInput(c *fiber.Ctx, msg string) error {
	return opsError(c, fiber.StatusBadRequest, "INVALID_INPUT", msg)
}

func opsInvalidUUID(c *fiber.Ctx, field string) error {
	return opsError(c, fiber.StatusBadRequest, "INVALID_UUID", "invalid "+field)
}
