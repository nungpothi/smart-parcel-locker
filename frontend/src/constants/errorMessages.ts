export const errorMessages: Record<string, string> = {
  INVALID_REQUEST: "Something went wrong. Please try again.",
  UNAUTHORIZED: "You need to sign in to continue.",
  FORBIDDEN: "You do not have permission for this action.",
  NOT_FOUND: "We could not find what you are looking for.",
  INTERNAL_ERROR: "Server error. Please try again later.",

  INVALID_CREDENTIALS: "Invalid phone or password.",
  TOKEN_EXPIRED: "Your session expired. Please sign in again.",
  TOKEN_INVALID: "Session is not valid. Please sign in again.",

  PARCEL_NOT_FOUND: "Parcel was not found.",
  PARCEL_NOT_READY: "Parcel is not ready for pickup yet.",
  PARCEL_EXPIRED: "Parcel pickup window expired.",
  PARCEL_ALREADY_PICKED: "Parcel has already been picked up.",
  NO_AVAILABLE_COMPARTMENT: "No compartments are available right now.",

  OTP_EXPIRED: "The code has expired. Request a new one.",
  OTP_INVALID: "The code you entered is incorrect.",
  OTP_ALREADY_USED: "The code has already been used.",

  DEFAULT_ERROR: "Unexpected error. Please try again."
};

export default errorMessages;
