import { query } from "../config/db.js";

export async function getDashboardReport(_req, res) {
  const result = await query(
    `SELECT
      (SELECT COUNT(*) FROM vehicles WHERE status = 'OnTrip')::INT AS active_fleet_count,
      (SELECT COUNT(*) FROM vehicles WHERE status = 'InShop')::INT AS vehicles_in_maintenance,
      (SELECT ROUND(
          CASE WHEN COUNT(*) = 0 THEN 0
               ELSE (COUNT(*) FILTER (WHERE status = 'OnTrip')::NUMERIC / COUNT(*)::NUMERIC) * 100
          END,
          2
        )
       FROM vehicles) AS fleet_utilization_rate,
      (SELECT COUNT(*) FROM trips WHERE status IN ('Draft', 'Dispatched'))::INT AS pending_trips,
      (SELECT COUNT(*) FROM drivers WHERE license_expiry_date < CURRENT_DATE)::INT AS expired_licenses`
  );

  res.status(200).json(result.rows[0]);
}

export async function getVehicleCostReport(req, res) {
  const { id } = req.params;

  const result = await query(
    `WITH fuel_cost AS (
       SELECT COALESCE(SUM(fl.cost), 0) AS total_fuel_cost
       FROM fuel_logs fl
       JOIN trips t ON t.id = fl.trip_id
       WHERE t.vehicle_id = $1
     ),
     maintenance_cost AS (
       SELECT COALESCE(SUM(cost), 0) AS total_maintenance_cost
       FROM maintenance_logs
       WHERE vehicle_id = $1
     )
     SELECT
       (SELECT total_fuel_cost FROM fuel_cost) AS total_fuel_cost,
       (SELECT total_maintenance_cost FROM maintenance_cost) AS total_maintenance_cost,
       (SELECT total_fuel_cost FROM fuel_cost) + (SELECT total_maintenance_cost FROM maintenance_cost) AS total_operational_cost`,
    [id]
  );

  res.status(200).json({ vehicle_id: Number(id), ...result.rows[0] });
}

export async function getFuelEfficiencyReport(req, res) {
  const { vehicleId } = req.params;

  const result = await query(
    `WITH trip_fuel AS (
       SELECT t.id,
              t.vehicle_id,
              t.odometer_start,
              t.odometer_end,
              COALESCE(SUM(fl.liters), 0) AS liters_used,
              CASE
                WHEN t.odometer_start IS NOT NULL AND t.odometer_end IS NOT NULL
                THEN (t.odometer_end - t.odometer_start)
                ELSE 0
              END AS distance
       FROM trips t
       LEFT JOIN fuel_logs fl ON fl.trip_id = t.id
       WHERE t.vehicle_id = $1
       GROUP BY t.id
     )
     SELECT
       COALESCE(SUM(distance), 0) AS total_distance,
       COALESCE(SUM(liters_used), 0) AS total_liters,
       ROUND(
         CASE WHEN COALESCE(SUM(liters_used), 0) = 0 THEN 0
              ELSE COALESCE(SUM(distance), 0) / COALESCE(SUM(liters_used), 0)
         END,
         3
       ) AS distance_per_liter
     FROM trip_fuel`,
    [vehicleId]
  );

  res.status(200).json({ vehicle_id: Number(vehicleId), ...result.rows[0] });
}
