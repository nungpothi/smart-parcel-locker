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

export const createLocation = async (req: LocationCreateRequest) => {
  return request<LocationResponse>("POST", "/admin/locations", req);
};

export const listLocations = async () => {
  return request<LocationListResponse>("GET", "/admin/locations");
};

export const createLocker = async (req: LockerCreateRequest) => {
  return request<LockerResponse>("POST", "/admin/lockers", req);
};

export const listLockers = async () => {
  return request<LockerListResponse>("GET", "/admin/lockers");
};

export const updateLockerStatus = async (lockerId: string, req: LockerStatusUpdateRequest) => {
  return request<LockerStatusResponse>("PATCH", `/admin/lockers/${lockerId}/status`, req);
};

export const createCompartments = async (lockerId: string, req: CompartmentBatchCreateRequest) => {
  return request<CompartmentBatchCreateResponse>("POST", `/admin/lockers/${lockerId}/compartments`, req);
};

export const listCompartments = async (lockerId: string) => {
  return request<CompartmentListResponse>("GET", `/admin/lockers/${lockerId}/compartments`);
};

export const getOverview = async () => {
  return request<AdminOverviewResponse>("GET", "/admin/overview");
};
