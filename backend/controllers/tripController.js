import { pool, query } from "../database/client.js";
import { AppError } from "../middleware/errors.js";

export async function listTrips(_req, res) {
  const result = await query("SELECT * FROM trips ORDER BY id DESC");
  res.status(200).json(result.rows);
}

export async function dispatchTrip(req, res) {
  const client = await pool.connect();

  try {
    const { vehicle_id, driver_id, cargo_weight, origin, destination, odometer_start } = req.body;
    await client.query("BEGIN");

    const vehicleResult = await client.query(
      `SELECT id, status, max_capacity
       FROM vehicles
       WHERE id = $1
       FOR UPDATE`,
      [vehicle_id]
    );

    if (vehicleResult.rowCount === 0) {
      throw new AppError(404, "Vehicle not found");
    }

    const vehicle = vehicleResult.rows[0];
    if (vehicle.status !== "Available") {
      throw new AppError(409, "Vehicle is not available for dispatch");
    }

    if (Number(cargo_weight) > Number(vehicle.max_capacity)) {
      throw new AppError(400, "cargo_weight exceeds vehicle max_capacity");
    }

    const driverResult = await client.query(
      `SELECT id, status, license_expiry_date
       FROM drivers
       WHERE id = $1
       FOR UPDATE`,
      [driver_id]
    );

    if (driverResult.rowCount === 0) {
      throw new AppError(404, "Driver not found");
    }

    const driver = driverResult.rows[0];
    if (driver.status === "Suspended") {
      throw new AppError(409, "Driver is suspended and not eligible for dispatch");
    }

    if (new Date(driver.license_expiry_date) < new Date(new Date().toDateString())) {
      throw new AppError(400, "Driver license is expired");
    }

    const tripResult = await client.query(
      `INSERT INTO trips (vehicle_id, driver_id, cargo_weight, origin, destination, status, start_time, odometer_start)
       VALUES ($1, $2, $3, $4, $5, 'Dispatched', NOW(), $6)
       RETURNING *`,
      [vehicle_id, driver_id, cargo_weight, origin, destination, odometer_start]
    );

    await client.query(`UPDATE vehicles SET status = 'OnTrip' WHERE id = $1`, [vehicle_id]);
    await client.query(`UPDATE drivers SET status = 'OnDuty' WHERE id = $1`, [driver_id]);

    await client.query("COMMIT");
    res.status(201).json(tripResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function completeTrip(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { odometer_end } = req.body;

    await client.query("BEGIN");

    const currentTrip = await client.query(
      `SELECT id, vehicle_id, status
       FROM trips
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (currentTrip.rowCount === 0) {
      throw new AppError(404, "Trip not found");
    }

    const trip = currentTrip.rows[0];
    if (trip.status !== "Dispatched") {
      throw new AppError(409, "Only dispatched trips can be completed");
    }

    const updatedTrip = await client.query(
      `UPDATE trips
       SET status = 'Completed', end_time = NOW(), odometer_end = COALESCE($2, odometer_end)
       WHERE id = $1
       RETURNING *`,
      [id, odometer_end]
    );

    await client.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [trip.vehicle_id]);
    await client.query("COMMIT");

    res.status(200).json(updatedTrip.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function cancelTrip(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    await client.query("BEGIN");

    const currentTrip = await client.query(
      `SELECT id, vehicle_id, status
       FROM trips
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (currentTrip.rowCount === 0) {
      throw new AppError(404, "Trip not found");
    }

    const trip = currentTrip.rows[0];
    if (trip.status === "Completed" || trip.status === "Cancelled") {
      throw new AppError(409, "Completed or cancelled trip cannot be cancelled again");
    }

    const updatedTrip = await client.query(
      `UPDATE trips
       SET status = 'Cancelled'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    await client.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [trip.vehicle_id]);
    await client.query("COMMIT");

    res.status(200).json(updatedTrip.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
