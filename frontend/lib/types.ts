export type VehicleStatus = 'available' | 'on_trip' | 'in_shop' | 'maintenance';
export type DriverStatus = 'on_duty' | 'off_duty' | 'suspended';
export type TripStatus = 'draft' | 'dispatched' | 'completed' | 'cancelled';
export type LicenseType = 'Class A' | 'Class B' | 'Class C';

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  capacity: number; // kg
  odometer: number; // km
  status: VehicleStatus;
  lastMaintenance: Date;
  nextMaintenance: Date;
  driver?: string; // driver ID
}

export interface Driver {
  id: string;
  name: string;
  licenseType: LicenseType;
  licenseExpiry: Date;
  status: DriverStatus;
  phone: string;
  totalTrips: number;
  rating: number; // 0-5
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number; // kg
  destination: string;
  pickupLocation: string;
  status: TripStatus;
  createdAt: Date;
  completedAt?: Date;
}

export interface Activity {
  id: string;
  type: 'trip_started' | 'trip_completed' | 'vehicle_maintenance' | 'driver_warning';
  description: string;
  timestamp: Date;
  relatedId?: string; // trip ID, vehicle ID, or driver ID
}
