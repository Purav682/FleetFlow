import { query } from "../config/db.js";
import { AppError } from "../middleware/errors.js";

export async function createFuelLog(req, res) {
  const { trip_id, liters, cost, date } = req.body;

  const trip = await query("SELECT id FROM trips WHERE id = $1", [trip_id]);
  if (trip.rowCount === 0) {
    throw new AppError(404, "Trip not found");
  }

  const result = await query(
    `INSERT INTO fuel_logs (trip_id, liters, cost, date)
     VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
     RETURNING *`,
    [trip_id, liters, cost, date]
  );

  res.status(201).json(result.rows[0]);
}

export async function getFuelLogsByVehicle(req, res) {
  const result = await query(
    `SELECT fl.*, t.vehicle_id
     FROM fuel_logs fl
     JOIN trips t ON t.id = fl.trip_id
     WHERE t.vehicle_id = $1
     ORDER BY fl.date DESC, fl.id DESC`,
    [req.params.id]
  );

  res.status(200).json(result.rows);
}

export async function getFuelLogsByTrip(req, res) {
  const result = await query(
    `SELECT *
     FROM fuel_logs
     WHERE trip_id = $1
     ORDER BY date DESC, id DESC`,
    [req.params.id]
  );

  res.status(200).json(result.rows);
}
