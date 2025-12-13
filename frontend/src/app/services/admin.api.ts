import {
  CompartmentBatchCreateRequest,
  CompartmentBatchCreateResponse,
  CompartmentListResponse,
  LockerCreateRequest,
  LockerListResponse,
  LockerResponse,
  LockerStatusResponse,
  LockerStatusUpdateRequest,
  LocationCreateRequest,
  LocationListResponse,
  LocationResponse,
  AdminOverviewResponse
} from "../types/api";
import { request } from "./http";
import { unwrapApiResponse } from "../../services/apiResponse";

export const createLocation = async (req: LocationCreateRequest) => {
  const res = await request<LocationResponse>("POST", "/admin/locations", req);
  return unwrapApiResponse<LocationResponse>(res);
};

export const listLocations = async () => {
  const res = await request<any>("GET", "/admin/locations");
  return unwrapApiResponse<LocationListResponse["locations"]>(res);
};

export const createLocker = async (req: LockerCreateRequest) => {
  const res = await request<LockerResponse>("POST", "/admin/lockers", req);
  return unwrapApiResponse<LockerResponse>(res);
};

export const listLockers = async () => {
  const res = await request<any>("GET", "/admin/lockers");
  return unwrapApiResponse<LockerResponse[]>(res);
};

export const updateLockerStatus = async (lockerId: string, req: LockerStatusUpdateRequest) => {
  const res = await request<LockerStatusResponse>("PATCH", `/admin/lockers/${lockerId}/status`, req);
  return unwrapApiResponse<LockerStatusResponse>(res);
};

export const createCompartments = async (lockerId: string, req: CompartmentBatchCreateRequest) => {
  const res = await request<CompartmentBatchCreateResponse>("POST", `/admin/lockers/${lockerId}/compartments`, req);
  return unwrapApiResponse<CompartmentBatchCreateResponse>(res);
};

export const listCompartments = async (lockerId: string) => {
  const res = await request<any>("GET", `/admin/lockers/${lockerId}/compartments`);
  return unwrapApiResponse<CompartmentListResponse["compartments"]>(res);
};

export const getOverview = async () => {
  const res = await request<AdminOverviewResponse>("GET", "/admin/overview");
  return unwrapApiResponse<AdminOverviewResponse>(res);
};
