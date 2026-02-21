import { pool, query } from "../database/client.js";
import { AppError } from "../middleware/errors.js";

export async function createMaintenanceLog(req, res) {
  const client = await pool.connect();

  try {
    const { vehicle_id, service_type, cost, service_date, notes } = req.body;
    await client.query("BEGIN");

    const vehicle = await client.query("SELECT id FROM vehicles WHERE id = $1 FOR UPDATE", [vehicle_id]);
    if (vehicle.rowCount === 0) {
      throw new AppError(404, "Vehicle not found");
    }

    const logResult = await client.query(
      `INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date, notes)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5)
       RETURNING *`,
      [vehicle_id, service_type, cost, service_date, notes]
    );

    await client.query(`UPDATE vehicles SET status = 'InShop' WHERE id = $1`, [vehicle_id]);

    await client.query("COMMIT");
    res.status(201).json(logResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listMaintenanceLogs(_req, res) {
  const result = await query(
    `SELECT ml.*, v.license_plate, v.model
     FROM maintenance_logs ml
     JOIN vehicles v ON v.id = ml.vehicle_id
     ORDER BY ml.service_date DESC, ml.id DESC`
  );

  res.status(200).json(result.rows);
}
