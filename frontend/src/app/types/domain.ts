export type Role = "ADMIN" | "COURIER" | "RECIPIENT";

export type User = {
  userId: string;
  role: Role;
  phone?: string;
};

export type LockerAvailable = {
  locker_id: string;
  locker_code: string;
  location_name: string;
};

export type ParcelDetail = {
  parcel_id: string;
  locker_id: string;
  recipient_id: string;
  status: string;
  size?: string;
  weight?: number;
};
