export class APIError extends Error {
  status: number;
  errorCode?: string;

  constructor(status: number, message: string, errorCode?: string) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

let baseUrl = "http://localhost:8080/api/v1";

const buildUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export const setBaseUrl = (url: string) => {
  baseUrl = url;
};

export const request = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  const success = data?.success ?? response.ok;
  const errorCode = data?.error_code;
  const message = data?.error || response.statusText || "Request failed";

  if (!response.ok || success === false) {
    throw new APIError(response.status, message, errorCode);
  }

  return data as T;
};

export default request;
