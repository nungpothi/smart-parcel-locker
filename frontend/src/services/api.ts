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

export type Location = {
  location_id: string
  code: string
  name: string
  is_active: boolean
}

export type Locker = {
  locker_id: string
  locker_code: string
  location_id: string
  status: string
}

export type Compartment = {
  compartment_id: string
  compartment_no: number
  size: string
  status: string
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

export const fetchLocations = () => {
  return apiClient.get('/admin/locations')
}

export const createLocation = (payload: {
  code: string
  name: string
  address?: string
}) => {
  return apiClient.post('/admin/locations', payload)
}

export const fetchLockers = () => {
  return apiClient.get('/admin/lockers')
}

export const createLocker = (payload: {
  location_id: string
  locker_code: string
  name?: string
}) => {
  return apiClient.post('/admin/lockers', payload)
}

export const fetchCompartments = (lockerId: string) => {
  return apiClient.get(`/admin/lockers/${lockerId}/compartments`)
}

export const createCompartments = (
  lockerId: string,
  payload: { compartments: { compartment_no: number; size: string }[] },
) => {
  return apiClient.post(`/admin/lockers/${lockerId}/compartments`, payload)
}
