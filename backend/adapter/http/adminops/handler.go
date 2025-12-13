package adminops

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"smart-parcel-locker/backend/domain/locker"
	"smart-parcel-locker/backend/pkg/errorx"
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
	if err := c.BodyParser(&req); err != nil {
		return opsInvalidRequest(c, "invalid request body")
	}
	if req.Code == "" || req.Name == "" {
		return opsInvalidRequest(c, "code and name are required")
	}
	result, err := h.uc.CreateLocation(c.Context(), adminopsusecase.CreateLocationInput{
		Code:     req.Code,
		Name:     req.Name,
		Address:  req.Address,
		IsActive: req.IsActive,
	})
	if err != nil {
		return handleError(c, err)
	}
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
	result, err := h.uc.ListLocations(c.Context())
	if err != nil {
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
	return c.JSON(response.APIResponse{Success: true, Data: locations})
}

func (h *Handler) CreateLocker(c *fiber.Ctx) error {
	var req struct {
		LocationID string `json:"location_id"`
		LockerCode string `json:"locker_code"`
		Name       string `json:"name"`
	}
	if err := c.BodyParser(&req); err != nil {
		return opsInvalidRequest(c, "invalid request body")
	}
	if req.LocationID == "" || req.LockerCode == "" {
		return opsInvalidRequest(c, "location_id and locker_code are required")
	}
	locationID, err := uuid.Parse(req.LocationID)
	if err != nil {
		return opsInvalidUUID(c, "location_id")
	}
	result, err := h.uc.CreateLocker(c.Context(), adminopsusecase.CreateLockerInput{
		LocationID: locationID,
		LockerCode: req.LockerCode,
		Name:       req.Name,
	})
	if err != nil {
		return handleError(c, err)
	}
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
	result, err := h.uc.ListLockers(c.Context())
	if err != nil {
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
	return c.JSON(response.APIResponse{Success: true, Data: lockers})
}

func (h *Handler) UpdateLockerStatus(c *fiber.Ctx) error {
	lockerIDStr := c.Params("locker_id")
	lockerID, err := uuid.Parse(lockerIDStr)
	if err != nil {
		return opsInvalidUUID(c, "locker_id")
	}
	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return opsInvalidRequest(c, "invalid request body")
	}
	if req.Status == "" {
		return opsInvalidRequest(c, "status is required")
	}
	result, err := h.uc.UpdateLockerStatus(c.Context(), adminopsusecase.UpdateLockerStatusInput{
		LockerID: lockerID,
		Status:   req.Status,
	})
	if err != nil {
		return handleError(c, err)
	}
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
	lockerID, err := uuid.Parse(lockerIDStr)
	if err != nil {
		return opsInvalidUUID(c, "locker_id")
	}
	var req struct {
		Compartments []struct {
			CompartmentNo int    `json:"compartment_no"`
			Size          string `json:"size"`
		} `json:"compartments"`
	}
	if err := c.BodyParser(&req); err != nil {
		return opsInvalidRequest(c, "invalid request body")
	}
	if len(req.Compartments) == 0 {
		return opsInvalidRequest(c, "compartments are required")
	}
	specs := make([]adminopsusecase.CompartmentSpec, 0, len(req.Compartments))
	for _, cpt := range req.Compartments {
		if cpt.CompartmentNo <= 0 {
			return opsInvalidInput(c, "compartment_no must be greater than 0")
		}
		if cpt.Size != "S" && cpt.Size != "M" && cpt.Size != "L" {
			return opsInvalidInput(c, "size must be one of S, M, L")
		}
		specs = append(specs, adminopsusecase.CompartmentSpec{
			CompartmentNo: cpt.CompartmentNo,
			Size:          cpt.Size,
		})
	}
	createdCount, err := h.uc.CreateCompartments(c.Context(), adminopsusecase.CreateCompartmentsInput{
		LockerID:     lockerID,
		Compartments: specs,
	})
	if err != nil {
		return handleError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(response.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"created_count": createdCount,
		},
	})
}

func (h *Handler) ListCompartments(c *fiber.Ctx) error {
	lockerIDStr := c.Params("locker_id")
	lockerID, err := uuid.Parse(lockerIDStr)
	if err != nil {
		return opsInvalidUUID(c, "locker_id")
	}
	result, err := h.uc.ListCompartments(c.Context(), lockerID)
	if err != nil {
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
	return c.JSON(response.APIResponse{Success: true, Data: comps})
}

func (h *Handler) Overview(c *fiber.Ctx) error {
	result, err := h.uc.Overview(c.Context())
	if err != nil {
		return handleError(c, err)
	}
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
