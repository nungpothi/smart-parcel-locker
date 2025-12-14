import { create } from "zustand";
import * as recipientApi from "../api/recipient.api";
import { request } from "../app/services/http";
import { unwrapApiResponse } from "../services/apiResponse";

type RecipientParcel = recipientApi.RecipientParcel;

type RecipientState = {
  parcel: RecipientParcel | null;
  otpRef: string | null;
  loading: boolean;
};

type RecipientActions = {
  fetchParcelByRecipient: (recipientId: string) => Promise<void>;
  requestOtp: () => Promise<string>;
  verifyOtp: (otpCode: string) => Promise<void>;
  pickupParcel: () => Promise<void>;
  reset: () => void;
};

const initialState: RecipientState = {
  parcel: null,
  otpRef: null,
  loading: false
};

export const useRecipientStore = create<RecipientState & RecipientActions>((set, get) => ({
  ...initialState,

  fetchParcelByRecipient: async (recipientId: string) => {
    set({ loading: true });
    try {
      const parcel = await recipientApi.getParcelByRecipient(recipientId);
      set({ parcel });
    } catch (error: any) {
      if (error?.status === 404) {
        set({ parcel: null });
        return;
      }
      set({ parcel: null });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  requestOtp: async () => {
    const { parcel } = get();
    if (!parcel) {
      throw new Error("NO_PARCEL");
    }
    set({ loading: true });
    try {
      const otpRef = await recipientApi.requestOtp({ parcel_id: parcel.parcel_id });
      set({ otpRef });
      return otpRef;
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (otpCode: string) => {
    const { otpRef } = get();
    if (!otpRef) {
      throw new Error("NO_OTP_REF");
    }
    set({ loading: true });
    try {
      await unwrapApiResponse<any>(await request("POST", "/parcels/otp/verify", { otp_ref: otpRef, otp_code: otpCode }));
    } finally {
      set({ loading: false });
    }
  },

  pickupParcel: async () => {
    const { parcel, otpRef } = get();
    if (!parcel || !otpRef) {
      throw new Error("INVALID_STATE");
    }
    set({ loading: true });
    try {
      await recipientApi.pickupParcel({ parcel_id: parcel.parcel_id, otp_ref: otpRef });
      set({ parcel: null, otpRef: null });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ ...initialState })
}));
