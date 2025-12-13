import { errorMessages } from "../constants/errorMessages";

export const mapErrorToMessage = (error: any): string => {
  const code = (error as any)?.code;
  if (code && typeof code === "string") {
    return errorMessages[code] || errorMessages.DEFAULT_ERROR;
  }
  return errorMessages.DEFAULT_ERROR;
};

export default mapErrorToMessage;
