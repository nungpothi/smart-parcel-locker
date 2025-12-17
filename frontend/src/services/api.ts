import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export type DepositPayload = {
  primaryPhone: string
  secondaryPhone?: string
  size: 'small' | 'medium' | 'large'
}

export type PickupOtpRequest = {
  phone: string
}

export type VerifyOtpPayload = {
  phone: string
  otp: string
}

export type ConfirmPickupPayload = {
  token: string
}

export const depositParcel = (payload: DepositPayload) => {
  return apiClient.post('/deposit', payload)
}

export const requestOtp = (payload: PickupOtpRequest) => {
  return apiClient.post('/pickup/request-otp', payload)
}

export const verifyOtp = (payload: VerifyOtpPayload) => {
  return apiClient.post('/pickup/verify-otp', payload)
}

export const fetchPickupParcels = (token: string) => {
  return apiClient.get(`/pickup/parcels/${token}`)
}

export const confirmPickup = (payload: ConfirmPickupPayload) => {
  return apiClient.post('/pickup/confirm', payload)
}
