package parcel

import "smart-parcel-locker/backend/pkg/errorx"

var (
	ErrInvalidStatusTransition = errorx.Error{Code: "PARCEL_INVALID_STATUS", Message: "invalid parcel status for action"}
	ErrOTPInvalid              = errorx.Error{Code: "PARCEL_OTP_INVALID", Message: "invalid otp"}
	ErrOTPExpired              = errorx.Error{Code: "PARCEL_OTP_EXPIRED", Message: "otp expired"}
)
