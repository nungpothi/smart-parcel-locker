import { request } from "./http";

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
  return request<any>("POST", "/auth/login", payload);
};

export const register = async (payload: RegisterPayload) => {
  return request<any>("POST", "/auth/register", payload);
};
