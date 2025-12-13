export const unwrapApiResponse = <T>(response: any): T => {
  if (response?.success === true) {
    if (typeof response.data === "undefined") {
      throw new Error("INVALID_API_RESPONSE");
    }
    return response.data as T;
  }

  if (response?.success === false) {
    const err: any = new Error(response.error);
    err.code = response.error_code;
    throw err;
  }

  throw new Error("INVALID_API_CONTRACT");
};

export default unwrapApiResponse;
