import { request } from "../app/services/http";
import { unwrapApiResponse } from "../services/apiResponse";
import { LockerAvailable } from "../app/types/domain";

type ParcelCreatePayload = {
  locker_id: string;
  size: string;
  courier_id: string;
  recipient_id: string;
};

type ParcelIdPayload = {
  parcel_id: string;
};

export type ParcelFlowResult = {
  parcelId: string;
  lockerId: string;
  compartmentId: string | null;
  status: string | null;
};

const normalizeParcel = (data: any): ParcelFlowResult => ({
  parcelId: data?.ID ?? data?.parcel_id ?? "",
  lockerId: data?.LockerID ?? data?.locker_id ?? "",
  compartmentId: data?.CompartmentID ?? data?.compartment_id ?? null,
  status: data?.Status ?? data?.status ?? null
});

export const fetchAvailableLockers = async (): Promise<LockerAvailable[]> => {
  const res = await request<any>("GET", "/lockers/available");
  const data = unwrapApiResponse<any>(res);
  if (Array.isArray(data)) return data as LockerAvailable[];
  return (data?.lockers as LockerAvailable[]) ?? [];
};

export const createParcel = async (payload: ParcelCreatePayload): Promise<ParcelFlowResult> => {
  const res = await request<any>("POST", "/parcels/create", payload);
  const data = unwrapApiResponse<any>(res);
  return normalizeParcel(data);
};

export const reserveParcel = async (payload: ParcelIdPayload): Promise<ParcelFlowResult> => {
  const res = await request<any>("POST", "/parcels/reserve", payload);
  const data = unwrapApiResponse<any>(res);
  return normalizeParcel(data);
};

export const depositParcel = async (payload: ParcelIdPayload): Promise<ParcelFlowResult> => {
  const res = await request<any>("POST", "/parcels/deposit", payload);
  const data = unwrapApiResponse<any>(res);
  return normalizeParcel(data);
};
