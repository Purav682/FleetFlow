import { query } from "../config/db.js";
import { AppError } from "../middleware/errors.js";

export async function listVehicles(_req, res) {
  const result = await query("SELECT * FROM vehicles ORDER BY id ASC");
  res.status(200).json(result.rows);
}

export async function createVehicle(req, res) {
  const { model, license_plate, max_capacity, odometer, status } = req.body;

  const result = await query(
    `INSERT INTO vehicles (model, license_plate, max_capacity, odometer, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [model, license_plate, max_capacity, odometer, status]
  );

  res.status(201).json(result.rows[0]);
}

export async function updateVehicleStatus(req, res) {
  const result = await query(
    `UPDATE vehicles
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [req.body.status, req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError(404, "Vehicle not found");
  }

  res.status(200).json(result.rows[0]);
}

export async function listAvailableVehicles(_req, res) {
  const result = await query(
    `SELECT *
     FROM vehicles
     WHERE status = 'Available'
     ORDER BY id ASC`
  );

  res.status(200).json(result.rows);
}
