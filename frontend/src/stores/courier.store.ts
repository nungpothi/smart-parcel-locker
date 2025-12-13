import { create } from "zustand";
import { LockerAvailable } from "../app/types/domain";
import * as courierApi from "../api/courier.api";

type WizardStep = 1 | 2 | 3 | 4;

type CompletionSummary = {
  parcelId: string;
  compartmentId: string | null;
  status: string | null;
};

type CourierState = {
  step: WizardStep;
  lockers: LockerAvailable[];
  lockerId: string;
  size: "S" | "M" | "L" | "";
  useSelfRecipient: boolean;
  recipientId: string;
  parcelId: string | null;
  compartmentId: string | null;
  status: string | null;
  loadingLockers: boolean;
  submitting: boolean;
  summary: CompletionSummary | null;
};

type CourierActions = {
  loadLockers: () => Promise<void>;
  setLockerId: (lockerId: string) => void;
  setSize: (size: "S" | "M" | "L" | "") => void;
  setUseSelfRecipient: (value: boolean) => void;
  setRecipientId: (value: string) => void;
  setStep: (step: WizardStep) => void;
  resetWizard: () => void;
  completeDeposit: (courierId: string, recipientId: string) => Promise<CompletionSummary>;
};

const initialState: CourierState = {
  step: 1,
  lockers: [],
  lockerId: "",
  size: "",
  useSelfRecipient: true,
  recipientId: "",
  parcelId: null,
  compartmentId: null,
  status: null,
  loadingLockers: false,
  submitting: false,
  summary: null
};

export const useCourierStore = create<CourierState & CourierActions>((set, get) => ({
  ...initialState,

  loadLockers: async () => {
    if (get().loadingLockers) return;
    set({ loadingLockers: true });
    try {
      const lockers = await courierApi.fetchAvailableLockers();
      set({ lockers });
    } finally {
      set({ loadingLockers: false });
    }
  },

  setLockerId: (lockerId) => set({ lockerId }),

  setSize: (size) => set({ size }),

  setUseSelfRecipient: (value) => set({ useSelfRecipient: value }),

  setRecipientId: (value) => set({ recipientId: value }),

  setStep: (step) => set({ step }),

  resetWizard: () => set({ ...initialState }),

  completeDeposit: async (courierId, recipientId) => {
    const { lockerId, size } = get();
    if (!lockerId || !size || !courierId || !recipientId) {
      throw new Error("INVALID_STATE");
    }
    set({ submitting: true });
    try {
      const created = await courierApi.createParcel({
        locker_id: lockerId,
        size,
        courier_id: courierId,
        recipient_id: recipientId
      });
      const parcelId = created.parcelId;
      const reserved = await courierApi.reserveParcel({ parcel_id: parcelId });
      const deposited = await courierApi.depositParcel({ parcel_id: parcelId });

      const summary = {
        parcelId: deposited.parcelId || reserved.parcelId || parcelId,
        compartmentId: deposited.compartmentId ?? reserved.compartmentId ?? null,
        status: deposited.status ?? reserved.status ?? created.status ?? null
      };

      set({
        parcelId: summary.parcelId,
        compartmentId: summary.compartmentId,
        status: summary.status,
        lockerId: "",
        size: "",
        recipientId: "",
        useSelfRecipient: true,
        summary,
        step: 4
      });

      return summary;
    } finally {
      set({ submitting: false });
    }
  }
}));
