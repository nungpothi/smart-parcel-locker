import { request } from "./http";
import { unwrapApiResponse } from "../../services/apiResponse";

type LoginPayload = {
  phone: string;
  password: string;
};

type RegisterPayload = {
  phone: string;
  password: string;
  role: "ADMIN" | "COURIER" | "RECIPIENT";
};

export const login = async (payload: LoginPayload) => {
  const res = await request<any>("POST", "/auth/login", payload);
  return unwrapApiResponse<any>(res);
};

export const register = async (payload: RegisterPayload) => {
  const res = await request<any>("POST", "/auth/register", payload);
  return unwrapApiResponse<any>(res);
};

export const me = async () => {
  const res = await request<any>("GET", "/auth/me");
  return unwrapApiResponse<any>(res);
};

export const logout = async () => {
  const res = await request<any>("POST", "/auth/logout");
  return unwrapApiResponse<any>(res);
};
