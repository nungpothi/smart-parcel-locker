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
};

type AdminActions = {
  loadOverview: () => Promise<void>;
  loadLocations: () => Promise<void>;
  createLocation: (payload: LocationCreateRequest) => Promise<void>;
  loadLockers: () => Promise<void>;
  createLocker: (payload: LockerCreateRequest) => Promise<void>;
  updateLockerStatus: (lockerId: string, status: string) => Promise<void>;
  loadCompartments: (lockerId: string) => Promise<void>;
  createCompartments: (lockerId: string, payload: CompartmentBatchCreateRequest) => Promise<void>;
};

const initialState: AdminState = {
  overview: null,
  locations: [],
  lockers: [],
  compartments: []
};

export const useAdminStore = create<AdminState & AdminActions>((set, get) => ({
  ...initialState,

  loadOverview: async () => {
    const res = await adminApi.getOverview();
    set({ overview: res.metrics ?? null });
  },

  loadLocations: async () => {
    const res = await adminApi.listLocations();
    set({ locations: res.locations ?? [] });
  },

  createLocation: async (payload) => {
    const res = await adminApi.createLocation(payload);
    const locations = get().locations ?? [];
    set({ locations: [...locations, { location_id: res.location_id, name: res.name, address: res.address }] });
  },

  loadLockers: async () => {
    const res = await adminApi.listLockers();
    set({ lockers: res.lockers ?? [] });
  },

  createLocker: async (payload) => {
    const res = await adminApi.createLocker(payload);
    const lockers = get().lockers ?? [];
    set({ lockers: [...lockers, res] });
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
    set({ compartments: res.compartments ?? [] });
  },

  createCompartments: async (lockerId, payload) => {
    await adminApi.createCompartments(lockerId, payload);
    const refreshed = await adminApi.listCompartments(lockerId);
    set({ compartments: refreshed.compartments ?? [] });
  }
}));
