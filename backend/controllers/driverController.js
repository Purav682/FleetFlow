import { query } from "../config/db.js";
import { AppError } from "../middleware/errors.js";

export async function listDrivers(_req, res) {
  const result = await query("SELECT * FROM drivers ORDER BY id ASC");
  res.status(200).json(result.rows);
}

export async function createDriver(req, res) {
  const { name, license_type, license_expiry_date, safety_score, status } = req.body;

  const result = await query(
    `INSERT INTO drivers (name, license_type, license_expiry_date, safety_score, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, license_type, license_expiry_date, safety_score, status]
  );

  res.status(201).json(result.rows[0]);
}

export async function updateDriverStatus(req, res) {
  const result = await query(
    `UPDATE drivers
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [req.body.status, req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError(404, "Driver not found");
  }

  res.status(200).json(result.rows[0]);
}

export async function listEligibleDrivers(_req, res) {
  const result = await query(
    `SELECT *
     FROM drivers
     WHERE license_expiry_date >= CURRENT_DATE
       AND status <> 'Suspended'
     ORDER BY id ASC`
  );

  res.status(200).json(result.rows);
}
