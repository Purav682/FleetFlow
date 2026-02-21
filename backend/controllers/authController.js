import bcrypt from "bcrypt";

import { query } from "../config/db.js";
import { AppError } from "../middleware/errors.js";
import { signAccessToken } from "../middleware/auth.js";

const SALT_ROUNDS = 12;

export async function register(req, res) {
  const {
    name,
    email,
    password,
    role,
    department,
    region,
    hub_location,
    certification_id,
    finance_unit,
  } = req.body;

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount > 0) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (
      name,
      email,
      password_hash,
      role,
      department,
      region,
      hub_location,
      certification_id,
      finance_unit
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, email, role, department, region, hub_location, certification_id, finance_unit, created_at`,
    [
      name,
      email,
      passwordHash,
      role,
      department,
      region,
      hub_location,
      certification_id,
      finance_unit,
    ]
  );

  res.status(201).json({
    message: "User registered successfully",
    user: result.rows[0],
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const result = await query(
    `SELECT id, name, email, role, password_hash
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (result.rowCount === 0) {
    throw new AppError(401, "Invalid credentials");
  }

  const user = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new AppError(401, "Invalid credentials");
  }

  const accessToken = signAccessToken(user);

  return res.status(200).json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: process.env.JWT_EXPIRES_IN || "12h",
  });
}
