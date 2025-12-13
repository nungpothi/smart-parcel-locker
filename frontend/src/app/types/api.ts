export type APIBase = {
  success: boolean;
  error_code?: string;
  error?: string;
};

export type ParcelStatus =
  | "CREATED"
  | "RESERVED"
  | "STORED"
  | "PICKUP_READY"
  | "PICKED_UP"
  | "CANCELLED"
  | "EXPIRED";

export type ParcelCreateRequest = {
  locker_id: string;
  recipient_id: string;
  courier_id: string;
  size: string;
};

export type ParcelIDRequest = {
  parcel_id: string;
};

export type ParcelOTPRequest = {
  parcel_id?: string;
  recipient_id?: string;
};

export type OTPVerifyRequest = {
  parcel_id: string;
  otp: string;
};

export type PickupRequest = {
  parcel_id: string;
  otp: string;
};

export type ParcelCreateResponse = APIBase & {
  parcel_id: string;
  status: ParcelStatus;
};

export type ParcelReserveResponse = APIBase & {
  parcel_id: string;
  status: ParcelStatus;
};

export type ParcelStatusResponse = APIBase & {
  parcel_id: string;
  status: ParcelStatus;
};

export type ParcelPickupResponse = APIBase & {
  parcel_id: string;
  status: ParcelStatus;
};

export type ParcelDetailResponse = APIBase & {
  parcel: {
    parcel_id: string;
    locker_id: string;
    recipient_id: string;
    status: ParcelStatus;
    size?: string;
    weight?: number;
  };
};

export type ParcelByRecipientResponse = APIBase & {
  parcels: ParcelDetailResponse["parcel"][];
};

export type OTPCreateResponse = APIBase & {
  parcel_id: string;
};

export type OTPVerifyResponse = APIBase & {
  parcel_id: string;
  verified: boolean;
};

export type ExpireRunResponse = APIBase & {
  expired: number;
};

export type LocationCreateRequest = {
  code: string;
  name: string;
  address?: string;
  is_active?: boolean;
};

export type LocationResponse = APIBase & {
  location_id: string;
  code: string;
  name: string;
  address?: string;
  is_active?: boolean;
};

export type LocationListResponse = APIBase & {
  locations: {
    location_id: string;
    code: string;
    name: string;
    address?: string;
    is_active?: boolean;
  }[];
};

export type LockerCreateRequest = {
  location_id: string;
  locker_code: string;
  name?: string;
  status?: string;
};

export type LockerResponse = APIBase & {
  locker_id: string;
  location_id: string;
  locker_code: string;
  name?: string;
  location_name?: string;
  status?: string;
};

export type LockerListResponse = APIBase & {
  lockers: LockerResponse[];
};

export type LockerStatusUpdateRequest = {
  status: string;
};

export type LockerStatusResponse = APIBase & {
  locker_id: string;
  status: string;
};

export type CompartmentBatchCreateRequest = {
  compartments: {
    compartment_no: string;
    size?: string;
  }[];
};

export type CompartmentBatchCreateResponse = APIBase & {
  locker_id: string;
  created: number;
};

export type CompartmentListResponse = APIBase & {
  compartments: {
    compartment_id: string;
    compartment_no: number;
    size?: string;
    status?: string;
  }[];
};

export type AdminOverviewResponse = APIBase & {
  metrics: Record<string, number>;
};

export type LockerAvailableResponse = APIBase & {
  lockers: {
    locker_id: string;
    locker_code: string;
    location_name: string;
  }[];
};
