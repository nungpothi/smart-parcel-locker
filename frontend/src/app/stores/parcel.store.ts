import { create } from "zustand";
import {
  ParcelStatus,
  ParcelCreateRequest,
  ParcelIDRequest,
  ParcelOTPRequest,
  PickupRequest
} from "../types/api";
import * as parcelApi from "../services/parcel.api";

type ParcelState = {
  parcelId: string | null;
  status: ParcelStatus | null;
  compartmentId: string | null;
  expiresAt: string | null;
};

type ParcelActions = {
  createParcel: (payload: ParcelCreateRequest) => Promise<void>;
  reserveParcel: () => Promise<void>;
  depositParcel: () => Promise<void>;
  readyParcel: () => Promise<void>;
  fetchParcelById: (parcelId: string) => Promise<void>;
  fetchParcelByRecipient: (recipientId: string) => Promise<void>;
  requestOtp: (parcelId?: string, recipientId?: string) => Promise<void>;
  verifyOtp: (otpRef: string, otpCode: string) => Promise<void>;
  pickupParcel: (parcelId: string, otpRef: string) => Promise<void>;
  resetParcel: () => void;
};

const initialState: ParcelState = {
  parcelId: null,
  status: null,
  compartmentId: null,
  expiresAt: null
};

export const useParcelStore = create<ParcelState & ParcelActions>((set, get) => ({
  ...initialState,

  createParcel: async (payload) => {
    const res = await parcelApi.createParcel(payload);
    set({
      parcelId: res.parcel_id ?? null,
      status: res.status ?? null
    });
  },

  reserveParcel: async () => {
    const parcelId = get().parcelId;
    if (!parcelId) throw new Error("No parcel to reserve");
    const res = await parcelApi.reserveParcel({ parcel_id: parcelId });
    const anyRes = res as any;
    set({
      status: res.status ?? null,
      compartmentId: anyRes?.compartment_id ?? null,
      expiresAt: anyRes?.expires_at ?? null
    });
  },

  depositParcel: async () => {
    const parcelId = get().parcelId;
    if (!parcelId) throw new Error("No parcel to deposit");
    const res = await parcelApi.depositParcel({ parcel_id: parcelId } as ParcelIDRequest);
    const anyRes = res as any;
    set({
      status: res.status ?? null,
      compartmentId: anyRes?.compartment_id ?? get().compartmentId,
      expiresAt: anyRes?.expires_at ?? get().expiresAt
    });
  },

  readyParcel: async () => {
    const parcelId = get().parcelId;
    if (!parcelId) throw new Error("No parcel to mark ready");
    const res = await parcelApi.readyParcel({ parcel_id: parcelId });
    set({ status: res.status ?? null });
  },

  fetchParcelById: async (parcelId) => {
    const res = await parcelApi.getParcelById(parcelId);
    const parcel = res.parcel;
    set({
      parcelId: parcel.parcel_id,
      status: parcel.status ?? null,
      compartmentId: (parcel as any).compartment_id ?? null,
      expiresAt: (parcel as any).expires_at ?? null
    });
  },

  fetchParcelByRecipient: async (recipientId) => {
    const res = await parcelApi.getParcelByRecipient(recipientId);
    const first = res.parcels?.[0];
    if (first) {
      set({
        parcelId: first.parcel_id,
        status: first.status ?? null,
        compartmentId: (first as any).compartment_id ?? null,
        expiresAt: (first as any).expires_at ?? null
      });
    }
  },

  requestOtp: async (parcelId, recipientId) => {
    const payload: ParcelOTPRequest = {};
    if (parcelId) payload.parcel_id = parcelId;
    if (recipientId) payload.recipient_id = recipientId;
    const res = await parcelApi.requestOtp(payload);
    set({ parcelId: res.parcel_id ?? get().parcelId });
  },

  verifyOtp: async (otpRef, otpCode) => {
    await parcelApi.verifyOtp({ parcel_id: otpRef, otp: otpCode });
  },

  pickupParcel: async (parcelId, otpRef) => {
    const res = await parcelApi.pickupParcel({ parcel_id: parcelId, otp: otpRef } as PickupRequest);
    set({ status: res.status ?? null });
  },

  resetParcel: () => set({ ...initialState })
}));
