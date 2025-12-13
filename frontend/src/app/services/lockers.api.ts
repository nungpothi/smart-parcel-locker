import { LockerAvailableResponse } from "../types/api";
import { request } from "./http";

export const listAvailableLockers = async () => {
  return request<LockerAvailableResponse>("GET", "/lockers/available");
};
