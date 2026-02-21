import api from "./api";

export type UserRole = "Manager" | "Dispatcher" | "SafetyOfficer" | "Analyst";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  email?: string;
}

export interface Vehicle {
  id: number;
  model: string;
  license_plate: string;
  max_capacity: number;
  odometer: number;
  status: "Available" | "OnTrip" | "InShop" | "Retired";
}

export interface Driver {
  id: number;
  name: string;
  license_type: string;
  license_expiry_date: string;
  safety_score: number;
  status: "OnDuty" | "OffDuty" | "Suspended";
}

export interface Trip {
  id: number;
  vehicle_id: number;
  driver_id: number;
  cargo_weight: number;
  origin: string;
  destination: string;
  status: "Draft" | "Dispatched" | "Completed" | "Cancelled";
  start_time?: string | null;
  end_time?: string | null;
  odometer_start?: number | null;
  odometer_end?: number | null;
}

export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  service_type: string;
  cost: number;
  service_date: string;
  notes?: string | null;
}

export interface FuelLog {
  id: number;
  trip_id: number;
  liters: number;
  cost: number;
  date: string;
}

export interface DashboardReport {
  active_fleet_count: number;
  vehicles_in_maintenance: number;
  fleet_utilization_rate: number;
  pending_trips: number;
  expired_licenses: number;
}

export interface VehicleCostReport {
  vehicle_id: number;
  total_fuel_cost: number;
  total_maintenance_cost: number;
  total_operational_cost: number;
}

export interface FuelEfficiencyReport {
  vehicle_id: number;
  total_distance: number;
  total_liters: number;
  distance_per_liter: number;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

function readError(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { error?: string } } };
  return responseError?.response?.data?.error || fallback;
}

export const authApi = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
    region?: string;
    hub_location?: string;
    certification_id?: string;
    finance_unit?: string;
  }) {
    const response = await api.post("/auth/register", data);
    return response.data.user as AuthUser;
  },

  async login(credentials: { email: string; password: string }) {
    const response = await api.post("/auth/login", credentials);
    const token = response.data.access_token as string;
    const user = response.data.user as AuthUser;

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return { user, token };
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  readError,
};

export const vehiclesApi = {
  list: async () => (await api.get("/vehicles")).data as Vehicle[],
  listAvailable: async () => (await api.get("/vehicles/available")).data as Vehicle[],
  create: async (payload: {
    model: string;
    license_plate: string;
    max_capacity: number;
    odometer?: number;
    status?: "Available" | "OnTrip" | "InShop" | "Retired";
  }) => (await api.post("/vehicles", payload)).data as Vehicle,
  updateStatus: async (id: number, status: Vehicle["status"]) =>
    (await api.put(`/vehicles/${id}/status`, { status })).data as Vehicle,
};

export const driversApi = {
  list: async () => (await api.get("/drivers")).data as Driver[],
  listEligible: async () => (await api.get("/drivers/eligible")).data as Driver[],
  create: async (payload: {
    name: string;
    license_type: string;
    license_expiry_date: string;
    safety_score?: number;
    status?: Driver["status"];
  }) => (await api.post("/drivers", payload)).data as Driver,
  updateStatus: async (id: number, status: Driver["status"]) =>
    (await api.put(`/drivers/${id}/status`, { status })).data as Driver,
};

export const tripsApi = {
  list: async () => (await api.get("/trips")).data as Trip[],
  dispatch: async (payload: {
    vehicle_id: number;
    driver_id: number;
    cargo_weight: number;
    origin: string;
    destination: string;
    odometer_start?: number;
  }) => (await api.post("/trips/dispatch", payload)).data as Trip,
  complete: async (id: number, odometer_end?: number) =>
    (await api.put(`/trips/${id}/complete`, { odometer_end })).data as Trip,
  cancel: async (id: number) => (await api.put(`/trips/${id}/cancel`)).data as Trip,
};

export const maintenanceApi = {
  list: async () => (await api.get("/maintenance")).data as MaintenanceLog[],
  create: async (payload: {
    vehicle_id: number;
    service_type: string;
    cost?: number;
    service_date?: string;
    notes?: string;
  }) => (await api.post("/maintenance", payload)).data as MaintenanceLog,
};

export const fuelApi = {
  create: async (payload: { trip_id: number; liters: number; cost: number; date?: string }) =>
    (await api.post("/fuel", payload)).data as FuelLog,
  listByVehicle: async (vehicleId: number) => (await api.get(`/fuel/vehicle/${vehicleId}`)).data as FuelLog[],
  listByTrip: async (tripId: number) => (await api.get(`/fuel/trip/${tripId}`)).data as FuelLog[],
};

export const reportsApi = {
  dashboard: async () => (await api.get("/reports/dashboard")).data as DashboardReport,
  vehicleCost: async (vehicleId: number) =>
    (await api.get(`/reports/vehicle-cost/${vehicleId}`)).data as VehicleCostReport,
  fuelEfficiency: async (vehicleId: number) =>
    (await api.get(`/reports/fuel-efficiency/${vehicleId}`)).data as FuelEfficiencyReport,
};

export { readError };
