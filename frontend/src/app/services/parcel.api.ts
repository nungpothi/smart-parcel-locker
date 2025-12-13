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

export const createParcel = async (req: ParcelCreateRequest) => {
  return request<ParcelCreateResponse>("POST", "/parcels", req);
};

export const reserveParcel = async (req: ParcelIDRequest) => {
  const { parcel_id } = req;
  return request<ParcelReserveResponse>("POST", `/parcels/${parcel_id}/reserve`, req);
};

export const depositParcel = async (req: ParcelIDRequest) => {
  const { parcel_id } = req;
  return request<ParcelStatusResponse>("POST", `/parcels/${parcel_id}/deposit`, req);
};

export const readyParcel = async (req: ParcelIDRequest) => {
  const { parcel_id } = req;
  return request<ParcelStatusResponse>("POST", `/parcels/${parcel_id}/ready`, req);
};

export const getParcelById = async (parcelId: string) => {
  return request<ParcelDetailResponse>("GET", `/parcels/${parcelId}`);
};

export const getParcelByRecipient = async (recipientId: string) => {
  return request<ParcelByRecipientResponse>("GET", `/parcels/recipient/${recipientId}`);
};

export const requestOtp = async (req: ParcelOTPRequest) => {
  return request<OTPCreateResponse>("POST", "/otp/request", req);
};

export const verifyOtp = async (req: OTPVerifyRequest) => {
  return request<OTPVerifyResponse>("POST", "/otp/verify", req);
};

export const pickupParcel = async (req: PickupRequest) => {
  return request<ParcelPickupResponse>("POST", "/parcels/pickup", req);
};

export const runExpireJob = async () => {
  return request<ExpireRunResponse>("POST", "/parcels/expire");
};
