import { UserRole } from "./api-client";

export type PermissionAction =
  | "vehicles.read"
  | "vehicles.write"
  | "drivers.read"
  | "drivers.write"
  | "trips.read"
  | "trips.write"
  | "maintenance.read"
  | "maintenance.write"
  | "fuel.read"
  | "fuel.write"
  | "reports.dashboard"
  | "reports.advanced";

const rolePermissions: Record<UserRole, Set<PermissionAction>> = {
  Manager: new Set([
    "vehicles.read",
    "vehicles.write",
    "drivers.read",
    "drivers.write",
    "trips.read",
    "trips.write",
    "maintenance.read",
    "maintenance.write",
    "fuel.read",
    "fuel.write",
    "reports.dashboard",
    "reports.advanced",
  ]),
  Dispatcher: new Set([
    "vehicles.read",
    "vehicles.write",
    "drivers.read",
    "trips.read",
    "trips.write",
    "fuel.read",
    "fuel.write",
  ]),
  SafetyOfficer: new Set([
    "vehicles.read",
    "drivers.read",
    "drivers.write",
    "maintenance.read",
    "maintenance.write",
    "reports.dashboard",
  ]),
  Analyst: new Set([
    "vehicles.read",
    "drivers.read",
    "trips.read",
    "maintenance.read",
    "fuel.read",
    "reports.dashboard",
    "reports.advanced",
  ]),
};

export function canPerform(role: UserRole | null | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  return rolePermissions[role]?.has(action) ?? false;
}
