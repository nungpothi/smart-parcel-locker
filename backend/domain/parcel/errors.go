package parcel

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrInvalidStatusTransition = errorx.Error{Code: "INVALID_STATUS_TRANSITION", Message: "invalid parcel status for action"}
	ErrOTPInvalid              = errorx.Error{Code: "INVALID_INPUT", Message: "invalid otp"}
	ErrOTPExpired              = errorx.Error{Code: "OTP_EXPIRED", Message: "otp expired"}
	ErrOTPAlreadyUsed          = errorx.Error{Code: "OTP_ALREADY_USED", Message: "otp already used"}
	ErrOTPNotFound             = errorx.Error{Code: "OTP_NOT_FOUND", Message: "otp not found"}
	ErrParcelExpired           = errorx.Error{Code: "PARCEL_EXPIRED", Message: "parcel expired"}
	ErrParcelNotFound          = errorx.Error{Code: "PARCEL_NOT_FOUND", Message: "parcel not found"}
	ErrInvalidRequest          = errorx.Error{Code: "INVALID_REQUEST", Message: "invalid request"}
)
