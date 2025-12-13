import { LockerAvailableResponse } from "../types/api";
import { request } from "./http";
import { unwrapApiResponse } from "../../services/apiResponse";

export const listAvailableLockers = async () => {
  const res = await request<LockerAvailableResponse>("GET", "/lockers/available");
  return unwrapApiResponse<LockerAvailableResponse>(res);
};
