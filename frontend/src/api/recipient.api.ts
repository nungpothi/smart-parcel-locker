import { request } from "../app/services/http";
import { unwrapApiResponse } from "../services/apiResponse";

export type RecipientParcel = {
  parcel_id: string;
  parcel_code: string;
  locker_id: string;
  compartment_id: string | null;
  expires_at: string | null;
  status: string;
};

const normalizeParcel = (data: any): RecipientParcel => ({
  parcel_id: data?.parcel_id ?? data?.ParcelID ?? data?.ID ?? "",
  parcel_code: data?.parcel_code ?? data?.ParcelCode ?? "",
  locker_id: data?.locker_id ?? data?.LockerID ?? "",
  compartment_id: data?.compartment_id ?? data?.CompartmentID ?? null,
  expires_at: data?.expires_at ?? data?.ExpiresAt ?? null,
  status: data?.status ?? data?.Status ?? ""
});

export const getParcelByRecipient = async (recipientId: string): Promise<RecipientParcel> => {
  const res = await request<any>("GET", `/parcels/by-recipient/${recipientId}`);
  const data = unwrapApiResponse<any>(res);
  return normalizeParcel(data);
};

export const requestOtp = async (payload: { parcel_id?: string; recipient_id?: string }): Promise<string> => {
  const res = await request<any>("POST", "/parcels/otp/request", payload);
  const data = unwrapApiResponse<any>(res);
  return data?.otp_ref ?? data?.OTPRef ?? "";
};

export const pickupParcel = async (payload: { parcel_id: string; otp_ref: string }): Promise<RecipientParcel> => {
  const res = await request<any>("POST", "/parcels/pickup", payload);
  const data = unwrapApiResponse<any>(res);
  return normalizeParcel(data);
};
