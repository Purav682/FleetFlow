SET client_min_messages TO warning;
SET search_path TO public;

-- FleetFlow initial schema migration (non-destructive)

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(100) NOT NULL CHECK (btrim(name) <> ''),
    email         VARCHAR(150) NOT NULL UNIQUE CHECK (btrim(email) <> ''),
    password_hash TEXT NOT NULL CHECK (btrim(password_hash) <> ''),
    role          VARCHAR(20) NOT NULL CHECK (role IN ('Manager', 'Dispatcher', 'SafetyOfficer', 'Analyst')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    model         VARCHAR(100) NOT NULL CHECK (btrim(model) <> ''),
    license_plate VARCHAR(20) NOT NULL UNIQUE CHECK (btrim(license_plate) <> ''),
    max_capacity  NUMERIC(12,2) NOT NULL CHECK (max_capacity > 0),
    odometer      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (odometer >= 0),
    status        VARCHAR(20) NOT NULL DEFAULT 'Available'
                  CHECK (status IN ('Available', 'OnTrip', 'InShop', 'Retired')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                VARCHAR(100) NOT NULL CHECK (btrim(name) <> ''),
    license_type        VARCHAR(50) NOT NULL CHECK (btrim(license_type) <> ''),
    license_expiry_date DATE NOT NULL,
    safety_score        INTEGER NOT NULL DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
    status              VARCHAR(20) NOT NULL DEFAULT 'OnDuty'
                        CHECK (status IN ('OnDuty', 'OffDuty', 'Suspended')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_id     INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id      INTEGER NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    cargo_weight   NUMERIC(12,2) NOT NULL CHECK (cargo_weight >= 0),
    origin         TEXT NOT NULL CHECK (btrim(origin) <> ''),
    destination    TEXT NOT NULL CHECK (btrim(destination) <> ''),
    status         VARCHAR(20) NOT NULL DEFAULT 'Draft'
                   CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
    odometer_start NUMERIC(12,2) CHECK (odometer_start IS NULL OR odometer_start >= 0),
    odometer_end   NUMERIC(12,2) CHECK (odometer_end IS NULL OR odometer_end >= 0),
    start_time     TIMESTAMPTZ,
    end_time       TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_trip_time_window CHECK (
        start_time IS NULL OR end_time IS NULL OR end_time >= start_time
    ),
    CONSTRAINT chk_trip_odometer_range CHECK (
        odometer_start IS NULL OR odometer_end IS NULL OR odometer_end >= odometer_start
    )
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_id   INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (btrim(service_type) <> ''),
    cost         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes        TEXT
);

CREATE TABLE IF NOT EXISTS fuel_logs (
    id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    liters  NUMERIC(12,3) NOT NULL CHECK (liters > 0),
    cost    NUMERIC(12,2) NOT NULL CHECK (cost >= 0),
    date    DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE OR REPLACE FUNCTION fn_trips_enforce_business_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_vehicle_status vehicles.status%TYPE;
    v_vehicle_capacity vehicles.max_capacity%TYPE;
    v_driver_license_expiry DATE;
BEGIN
    IF NEW.status = 'Dispatched' THEN
        SELECT status, max_capacity
          INTO v_vehicle_status, v_vehicle_capacity
          FROM vehicles
         WHERE id = NEW.vehicle_id
         FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Dispatch blocked: vehicle % does not exist.', NEW.vehicle_id;
        END IF;

        SELECT license_expiry_date
          INTO v_driver_license_expiry
          FROM drivers
         WHERE id = NEW.driver_id
         FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Dispatch blocked: driver % does not exist.', NEW.driver_id;
        END IF;

        IF v_vehicle_status <> 'Available' THEN
            RAISE EXCEPTION 'Dispatch blocked: vehicle % is % (must be Available).', NEW.vehicle_id, v_vehicle_status;
        END IF;

        IF NEW.cargo_weight > v_vehicle_capacity THEN
            RAISE EXCEPTION
                'Dispatch blocked: cargo_weight %.2f exceeds vehicle % max_capacity %.2f.',
                NEW.cargo_weight, NEW.vehicle_id, v_vehicle_capacity;
        END IF;

        IF v_driver_license_expiry < CURRENT_DATE THEN
            RAISE EXCEPTION
                'Dispatch blocked: driver % license expired on %.',
                NEW.driver_id, v_driver_license_expiry;
        END IF;

        IF NEW.start_time IS NULL THEN
            NEW.start_time := NOW();
        END IF;

        IF TG_OP = 'UPDATE' THEN
            IF OLD.status NOT IN ('Draft', 'Dispatched') THEN
                RAISE EXCEPTION
                    'Invalid transition: cannot move trip % from % to Dispatched.',
                    NEW.id, OLD.status;
            END IF;
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'Completed' AND NEW.status <> 'Completed' THEN
            RAISE EXCEPTION 'Invalid transition: completed trip % cannot revert to %.', NEW.id, NEW.status;
        END IF;

        IF OLD.status = 'Cancelled' AND NEW.status <> 'Cancelled' THEN
            RAISE EXCEPTION 'Invalid transition: cancelled trip % cannot revert to %.', NEW.id, NEW.status;
        END IF;

        IF NEW.status = 'Completed' AND NEW.end_time IS NULL THEN
            NEW.end_time := NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trips_sync_resource_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'Dispatched' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
        UPDATE vehicles
           SET status = 'OnTrip'
         WHERE id = NEW.vehicle_id;

        UPDATE drivers
           SET status = 'OnDuty'
         WHERE id = NEW.driver_id;
    ELSIF NEW.status = 'Completed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
        UPDATE vehicles
           SET status = 'Available',
               odometer = COALESCE(NEW.odometer_end, odometer)
         WHERE id = NEW.vehicle_id;

        UPDATE drivers
           SET status = 'OffDuty'
         WHERE id = NEW.driver_id;
    ELSIF NEW.status = 'Cancelled' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
        UPDATE vehicles
           SET status = 'Available'
         WHERE id = NEW.vehicle_id
           AND status = 'OnTrip';

        UPDATE drivers
           SET status = 'OffDuty'
         WHERE id = NEW.driver_id
           AND status = 'OnDuty';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_maintenance_mark_vehicle_inshop()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE vehicles
       SET status = 'InShop'
     WHERE id = NEW.vehicle_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trips_enforce_business_rules ON trips;
CREATE TRIGGER trg_trips_enforce_business_rules
BEFORE INSERT OR UPDATE ON trips
FOR EACH ROW
EXECUTE FUNCTION fn_trips_enforce_business_rules();

DROP TRIGGER IF EXISTS trg_trips_sync_resource_status ON trips;
CREATE TRIGGER trg_trips_sync_resource_status
AFTER INSERT OR UPDATE OF status ON trips
FOR EACH ROW
EXECUTE FUNCTION fn_trips_sync_resource_status();

DROP TRIGGER IF EXISTS trg_maintenance_mark_vehicle_inshop ON maintenance_logs;
CREATE TRIGGER trg_maintenance_mark_vehicle_inshop
AFTER INSERT ON maintenance_logs
FOR EACH ROW
EXECUTE FUNCTION fn_maintenance_mark_vehicle_inshop();

CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_trip_id ON fuel_logs(trip_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_vehicle_id ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_start_time ON trips(start_time);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_service_date ON maintenance_logs(service_date);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_date ON fuel_logs(date);

COMMENT ON TABLE users IS 'Application users with role-based access for FleetFlow.';
COMMENT ON COLUMN users.password_hash IS 'Password hash (never plaintext passwords).';
COMMENT ON TABLE trips IS 'Trip lifecycle records used for dispatch, operations, and analytics.';
COMMENT ON COLUMN trips.odometer_start IS 'Vehicle odometer at trip dispatch/start.';
COMMENT ON COLUMN trips.odometer_end IS 'Vehicle odometer at trip completion.';
COMMENT ON FUNCTION fn_trips_enforce_business_rules() IS 'Blocks invalid trip dispatch operations based on vehicle capacity, vehicle status, and driver license expiry.';
COMMENT ON FUNCTION fn_trips_sync_resource_status() IS 'Synchronizes vehicle and driver statuses when trip status changes.';
COMMENT ON FUNCTION fn_maintenance_mark_vehicle_inshop() IS 'Moves vehicle to InShop when a maintenance record is inserted.';

CREATE OR REPLACE VIEW q_total_operational_cost_per_vehicle AS
WITH fuel_per_vehicle AS (
    SELECT t.vehicle_id, COALESCE(SUM(f.cost), 0) AS total_fuel_cost
    FROM trips t
    LEFT JOIN fuel_logs f ON f.trip_id = t.id
    GROUP BY t.vehicle_id
),
maintenance_per_vehicle AS (
    SELECT m.vehicle_id, COALESCE(SUM(m.cost), 0) AS total_maintenance_cost
    FROM maintenance_logs m
    GROUP BY m.vehicle_id
)
SELECT
    v.id AS vehicle_id,
    v.license_plate,
    COALESCE(fpv.total_fuel_cost, 0) AS total_fuel_cost,
    COALESCE(mpv.total_maintenance_cost, 0) AS total_maintenance_cost,
    COALESCE(fpv.total_fuel_cost, 0) + COALESCE(mpv.total_maintenance_cost, 0) AS total_operational_cost
FROM vehicles v
LEFT JOIN fuel_per_vehicle fpv ON fpv.vehicle_id = v.id
LEFT JOIN maintenance_per_vehicle mpv ON mpv.vehicle_id = v.id;

CREATE OR REPLACE VIEW q_fleet_utilization_rate AS
SELECT
    COUNT(*)::INTEGER AS total_vehicles,
    COUNT(*) FILTER (WHERE status = 'OnTrip')::INTEGER AS on_trip_vehicles,
    ROUND(
        CASE WHEN COUNT(*) = 0 THEN 0
             ELSE (COUNT(*) FILTER (WHERE status = 'OnTrip')::NUMERIC / COUNT(*)::NUMERIC) * 100
        END,
        2
    ) AS utilization_rate_percent
FROM vehicles;

CREATE OR REPLACE VIEW q_fuel_efficiency_distance_per_liter AS
WITH fuel_per_trip AS (
    SELECT trip_id, SUM(liters) AS liters_total
    FROM fuel_logs
    GROUP BY trip_id
)
SELECT
    t.id AS trip_id,
    t.vehicle_id,
    t.driver_id,
    t.odometer_start,
    t.odometer_end,
    (t.odometer_end - t.odometer_start) AS distance_travelled,
    fpt.liters_total,
    ROUND(
        CASE
            WHEN fpt.liters_total IS NULL OR fpt.liters_total = 0
                 OR t.odometer_start IS NULL OR t.odometer_end IS NULL
            THEN NULL
            ELSE (t.odometer_end - t.odometer_start) / fpt.liters_total
        END,
        3
    ) AS distance_per_liter
FROM trips t
LEFT JOIN fuel_per_trip fpt ON fpt.trip_id = t.id;

CREATE OR REPLACE VIEW q_vehicles_currently_in_maintenance AS
SELECT
    v.id AS vehicle_id,
    v.license_plate,
    v.model,
    v.status,
    ml.id AS latest_maintenance_log_id,
    ml.service_type,
    ml.service_date,
    ml.cost,
    ml.notes
FROM vehicles v
LEFT JOIN LATERAL (
    SELECT m.id, m.service_type, m.service_date, m.cost, m.notes
    FROM maintenance_logs m
    WHERE m.vehicle_id = v.id
    ORDER BY m.service_date DESC, m.id DESC
    LIMIT 1
) ml ON TRUE
WHERE v.status = 'InShop';

CREATE OR REPLACE VIEW q_drivers_with_expired_licenses AS
SELECT
    d.id AS driver_id,
    d.name,
    d.license_type,
    d.license_expiry_date,
    d.status
FROM drivers d
WHERE d.license_expiry_date < CURRENT_DATE;

CREATE OR REPLACE VIEW q_cost_per_trip AS
WITH fuel_per_trip AS (
    SELECT trip_id, COALESCE(SUM(cost), 0) AS fuel_cost
    FROM fuel_logs
    GROUP BY trip_id
),
vehicle_maintenance AS (
    SELECT vehicle_id, COALESCE(SUM(cost), 0) AS maintenance_cost_vehicle_total
    FROM maintenance_logs
    GROUP BY vehicle_id
)
SELECT
    t.id AS trip_id,
    t.vehicle_id,
    t.driver_id,
    t.status,
    COALESCE(fpt.fuel_cost, 0) AS fuel_cost,
    COALESCE(vm.maintenance_cost_vehicle_total, 0) AS maintenance_cost_vehicle_total,
    COALESCE(fpt.fuel_cost, 0) AS direct_trip_cost
FROM trips t
LEFT JOIN fuel_per_trip fpt ON fpt.trip_id = t.id
LEFT JOIN vehicle_maintenance vm ON vm.vehicle_id = t.vehicle_id;

CREATE OR REPLACE VIEW q_monthly_fuel_expense_summary AS
SELECT
    DATE_TRUNC('month', f.date::timestamp)::date AS month,
    COUNT(*)::INTEGER AS fuel_fill_events,
    ROUND(COALESCE(SUM(f.liters), 0), 3) AS total_liters,
    ROUND(COALESCE(SUM(f.cost), 0), 2) AS total_fuel_cost
FROM fuel_logs f
GROUP BY DATE_TRUNC('month', f.date::timestamp)
ORDER BY month;
