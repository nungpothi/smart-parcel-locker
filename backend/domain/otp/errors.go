package otp

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrInvalidRequest = errorx.Error{Code: "INVALID_REQUEST", Message: "invalid request"}
	ErrNotFound       = errorx.Error{Code: "OTP_NOT_FOUND", Message: "otp not found"}
	ErrExpired        = errorx.Error{Code: "OTP_EXPIRED", Message: "otp expired"}
	ErrAlreadyUsed    = errorx.Error{Code: "OTP_ALREADY_USED", Message: "otp already used"}
	ErrInvalidOTP     = errorx.Error{Code: "INVALID_OTP", Message: "invalid otp"}
)
