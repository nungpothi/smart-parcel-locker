import {
  ParcelByRecipientResponse,
  ParcelCreateRequest,
  ParcelCreateResponse,
  ParcelDetailResponse,
  ParcelIDRequest,
  ParcelOTPRequest,
  ParcelPickupResponse,
  ParcelReserveResponse,
  ParcelStatusResponse,
  PickupRequest,
  OTPVerifyRequest,
  OTPCreateResponse,
  OTPVerifyResponse,
  ExpireRunResponse
} from "../types/api";
import { request } from "./http";
import { unwrapApiResponse } from "../../services/apiResponse";

export const createParcel = async (req: ParcelCreateRequest) => {
  const res = await request<ParcelCreateResponse>("POST", "/parcels", req);
  return unwrapApiResponse<ParcelCreateResponse>(res);
};

export const reserveParcel = async (req: ParcelIDRequest) => {
  const { parcel_id } = req;
  const res = await request<ParcelReserveResponse>("POST", `/parcels/${parcel_id}/reserve`, req);
  return unwrapApiResponse<ParcelReserveResponse>(res);
};

export const depositParcel = async (req: ParcelIDRequest) => {
  const { parcel_id } = req;
  const res = await request<ParcelStatusResponse>("POST", `/parcels/${parcel_id}/deposit`, req);
  return unwrapApiResponse<ParcelStatusResponse>(res);
};

export const readyParcel = async (req: ParcelIDRequest) => {
  const { parcel_id } = req;
  const res = await request<ParcelStatusResponse>("POST", `/parcels/${parcel_id}/ready`, req);
  return unwrapApiResponse<ParcelStatusResponse>(res);
};

export const getParcelById = async (parcelId: string) => {
  const res = await request<ParcelDetailResponse>("GET", `/parcels/${parcelId}`);
  return unwrapApiResponse<ParcelDetailResponse>(res);
};

export const getParcelByRecipient = async (recipientId: string) => {
  const res = await request<ParcelByRecipientResponse>("GET", `/parcels/recipient/${recipientId}`);
  return unwrapApiResponse<ParcelByRecipientResponse>(res);
};

export const requestOtp = async (req: ParcelOTPRequest) => {
  const res = await request<OTPCreateResponse>("POST", "/otp/request", req);
  return unwrapApiResponse<OTPCreateResponse>(res);
};

export const verifyOtp = async (req: OTPVerifyRequest) => {
  const res = await request<OTPVerifyResponse>("POST", "/otp/verify", req);
  return unwrapApiResponse<OTPVerifyResponse>(res);
};

export const pickupParcel = async (req: PickupRequest) => {
  const res = await request<ParcelPickupResponse>("POST", "/parcels/pickup", req);
  return unwrapApiResponse<ParcelPickupResponse>(res);
};

export const runExpireJob = async () => {
  const res = await request<ExpireRunResponse>("POST", "/parcels/expire");
  return unwrapApiResponse<ExpireRunResponse>(res);
};
