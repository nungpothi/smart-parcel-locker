import { create } from "zustand";
import {
  AdminOverviewResponse,
  CompartmentBatchCreateRequest,
  CompartmentListResponse,
  LockerCreateRequest,
  LockerListResponse,
  LockerStatusUpdateRequest,
  LocationCreateRequest,
  LocationListResponse
} from "../types/api";
import * as adminApi from "../services/admin.api";

type AdminOverview = AdminOverviewResponse["metrics"];
type Location = LocationListResponse["locations"][number];
type Locker = LockerListResponse["lockers"][number];
type Compartment = CompartmentListResponse["compartments"][number];

type AdminState = {
  overview: AdminOverview | null;
  locations: Location[];
  lockers: Locker[];
  compartments: Compartment[];
  lastLocationId: string | null;
  lastLockerId: string | null;
};

type AdminActions = {
  loadOverview: () => Promise<void>;
  fetchOverview: () => Promise<void>;
  loadLocations: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  createLocation: (payload: LocationCreateRequest) => Promise<void>;
  loadLockers: () => Promise<void>;
  fetchLockers: () => Promise<void>;
  createLocker: (payload: LockerCreateRequest) => Promise<void>;
  updateLockerStatus: (lockerId: string, status: string) => Promise<void>;
  loadCompartments: (lockerId: string) => Promise<void>;
  fetchCompartments: (lockerId: string) => Promise<void>;
  createCompartments: (lockerId: string, payload: CompartmentBatchCreateRequest) => Promise<CompartmentBatchCreateResponse | void>;
};

const initialState: AdminState = {
  overview: null,
  locations: [],
  lockers: [],
  compartments: [],
  lastLocationId: null,
  lastLockerId: null
};

export const useAdminStore = create<AdminState & AdminActions>((set, get) => ({
  ...initialState,

  loadOverview: async () => {
    const res = await adminApi.getOverview();
    set({ overview: res.metrics ?? null });
  },

  fetchOverview: async () => {
    const res = await adminApi.getOverview();
    set({ overview: res.metrics ?? null });
  },

  loadLocations: async () => {
    const res = await adminApi.listLocations();
    set({ locations: res ?? [] });
  },

  fetchLocations: async () => {
    const res = await adminApi.listLocations();
    set({ locations: res ?? [] });
  },

  createLocation: async (payload) => {
    const res = await adminApi.createLocation(payload);
    const locations = get().locations ?? [];
    set({
      locations: [
        ...locations,
        { location_id: res.location_id, name: res.name, address: res.address, code: res.code, is_active: res.is_active }
      ],
      lastLocationId: res.location_id ?? null
    });
  },

  loadLockers: async () => {
    const res = await adminApi.listLockers();
    set({ lockers: res ?? [] });
  },

  fetchLockers: async () => {
    const res = await adminApi.listLockers();
    set({ lockers: res ?? [] });
  },

  createLocker: async (payload) => {
    const res = await adminApi.createLocker(payload);
    const lockers = get().lockers ?? [];
    set({ lockers: [...lockers, res], lastLockerId: res.locker_id ?? null });
  },

  updateLockerStatus: async (lockerId, status) => {
    const res = await adminApi.updateLockerStatus(lockerId, { status } as LockerStatusUpdateRequest);
    const lockers = get().lockers.map((locker) =>
      locker.locker_id === lockerId ? { ...locker, status: res.status } : locker
    );
    set({ lockers });
  },

  loadCompartments: async (lockerId) => {
    const res = await adminApi.listCompartments(lockerId);
    set({ compartments: res ?? [] });
  },

  fetchCompartments: async (lockerId) => {
    const res = await adminApi.listCompartments(lockerId);
    set({ compartments: res ?? [] });
  },

  createCompartments: async (lockerId, payload) => {
    const created = await adminApi.createCompartments(lockerId, payload);
    const refreshed = await adminApi.listCompartments(lockerId);
    set({ compartments: refreshed.compartments ?? [] });
    return created;
  }
}));
