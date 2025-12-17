import { create } from 'zustand'

export type PickupParcel = {
  parcel_id: string
  parcel_code: string
  locker_id: string
  compartment_id?: string | null
  size: 'S' | 'M' | 'L'
  expires_at?: string | null
}

type PickupState = {
  phone: string
  otpRef: string | null
  otpCode: string
  pickupCode: string | null
  pickupToken: string | null
  pickupTokenExpiresAt: string | null
  isSubmitting: boolean
  isLoadingParcels: boolean
  isConfirming: boolean
  errorMessage: string | null
  parcels: PickupParcel[]
  selectedParcelId: string | null
  setPhone: (phone: string) => void
  setOtpRef: (otpRef: string | null) => void
  setOtpCode: (otpCode: string) => void
  setPickupCode: (pickupCode: string | null) => void
  setPickupToken: (pickupToken: string | null, expiresAt: string | null) => void
  setLoadingParcels: (isLoadingParcels: boolean) => void
  setConfirming: (isConfirming: boolean) => void
  setSubmitting: (isSubmitting: boolean) => void
  setError: (message: string | null) => void
  setParcels: (parcels: PickupParcel[]) => void
  selectParcel: (parcelId: string | null) => void
  resetPickup: () => void
}

export const usePickupStore = create<PickupState>((set) => ({
  phone: '',
  otpRef: null,
  otpCode: '',
  pickupCode: null,
  pickupToken: null,
  pickupTokenExpiresAt: null,
  isSubmitting: false,
  isLoadingParcels: false,
  isConfirming: false,
  errorMessage: null,
  parcels: [],
  selectedParcelId: null,
  setPhone: (phone) => set({ phone }),
  setOtpRef: (otpRef) => set({ otpRef }),
  setOtpCode: (otpCode) => set({ otpCode }),
  setPickupCode: (pickupCode) => set({ pickupCode }),
  setPickupToken: (pickupToken, pickupTokenExpiresAt) =>
    set({ pickupToken, pickupTokenExpiresAt }),
  setLoadingParcels: (isLoadingParcels) => set({ isLoadingParcels }),
  setConfirming: (isConfirming) => set({ isConfirming }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (errorMessage) => set({ errorMessage }),
  setParcels: (parcels) => set({ parcels }),
  selectParcel: (selectedParcelId) => set({ selectedParcelId }),
  resetPickup: () =>
    set({
      phone: '',
      otpRef: null,
      otpCode: '',
      pickupCode: null,
      pickupToken: null,
      pickupTokenExpiresAt: null,
      isSubmitting: false,
      isLoadingParcels: false,
      isConfirming: false,
      errorMessage: null,
      parcels: [],
      selectedParcelId: null,
    }),
}))
