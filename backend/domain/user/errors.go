package user

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrInvalidCredentials = errorx.Error{Code: "INVALID_CREDENTIALS", Message: "invalid credentials"}
	ErrPhoneExists        = errorx.Error{Code: "PHONE_ALREADY_EXISTS", Message: "phone already exists"}
	ErrInvalidToken       = errorx.Error{Code: "INVALID_TOKEN", Message: "invalid token"}
	ErrUnauthorized       = errorx.Error{Code: "UNAUTHORIZED", Message: "unauthorized"}
)
