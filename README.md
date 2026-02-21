# FleetFlow - Fleet Management System

<div align="center">
  
  **A comprehensive fleet management solution for logistics operations**
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express_5.2-green?logo=node.js)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue?logo=postgresql)](https://www.postgresql.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**FleetFlow** is a modern, full-stack fleet management system designed to streamline logistics operations for transportation businesses. It provides comprehensive tools for managing vehicles, drivers, trips, fuel consumption, and maintenance scheduling while offering real-time analytics and reporting capabilities.

The MVP focuses on core fleet operations with role-based access control, ensuring that managers, dispatchers, safety officers, and analysts have the appropriate tools and permissions for their responsibilities.

### 📌 Project Status

**Current State:** The project has a complete backend API structure with all routes, controllers, validators, and database schema defined. The frontend includes a modern Next.js interface with mock data.

**⚠️ Important Note:** API routes are defined but **not yet registered** in `server.js`. See the [Getting Started](#-getting-started) section for instructions on registering routes to make the API functional.

### Key Objectives

- **Operational Efficiency**: Streamline dispatch operations and resource allocation
- **Cost Management**: Track fuel consumption, maintenance costs, and operational expenses
- **Safety Compliance**: Monitor driver licenses, safety scores, and vehicle maintenance
- **Data-Driven Insights**: Provide analytics for fleet utilization, fuel efficiency, and cost optimization
- **Real-Time Tracking**: Monitor active trips and vehicle status in real-time

---

## ✨ Features

### 🚚 Vehicle Management

- Complete vehicle fleet inventory
- Real-time vehicle status tracking (Available, OnTrip, InShop, Retired)
- Vehicle capacity and odometer management
- Maintenance history and scheduling
- Vehicle utilization analytics

### 👨‍✈️ Driver Management

- Driver profiles with license information
- License expiry tracking and alerts
- Safety score monitoring
- Driver status management (OnDuty, OffDuty, Suspended)
- Performance analytics

### 📦 Dispatch & Trip Management

- Create and manage trip assignments
- Real-time trip status tracking (Draft, Dispatched, Completed, Cancelled)
- Cargo weight and capacity validation
- Automated vehicle and driver availability checks
- Origin and destination tracking
- Odometer readings for distance calculation

### ⛽ Fuel Management

- Fuel consumption logging per trip
- Cost tracking and analysis
- Fuel efficiency metrics (distance per liter)
- Monthly fuel expense summaries
- Vehicle-wise fuel consumption reports

### 🔧 Maintenance Management

- Maintenance log tracking
- Service type and cost recording
- Automated vehicle status updates during maintenance
- Preventive maintenance scheduling
- Cost analysis by vehicle

### 📊 Analytics & Reporting

- Real-time dashboard with key metrics
- Fleet utilization rates
- Cost per trip analysis
- Fuel efficiency reports
- Monthly operational cost summaries
- Driver performance metrics
- Vehicles in maintenance overview

### 🔐 Authentication & Authorization

- Secure JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected API endpoints
- Session management

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 16.1.6](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.2.4](https://reactjs.org/)
- **Language**: [TypeScript 5.7.3](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.2.0](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Component Library**: [Radix UI](https://www.radix-ui.com/) (Complete set of accessible primitives)
- **Icons**: [Lucide React 0.564.0](https://lucide.dev/)
- **Forms**: [React Hook Form 7.54.1](https://react-hook-form.com/) + [Zod 3.24.1](https://zod.dev/)
- **HTTP Client**: [Axios 1.6.5](https://axios-http.com/)
- **Date Handling**: [date-fns 4.1.0](https://date-fns.org/)
- **Charts**: [Recharts 2.15.0](https://recharts.org/)
- **Notifications**: [Sonner 1.7.1](https://sonner.emilkowal.ski/)
- **Theme**: [next-themes 0.4.6](https://github.com/pacocoursey/next-themes) for dark mode
- **State Management**: React Context API + Local State

### Backend

- **Runtime**: [Node.js](https://nodejs.org/) (v18+ recommended)
- **Framework**: [Express 5.2.1](https://expressjs.com/)
- **Language**: JavaScript (ES Modules)
- **Database**: [PostgreSQL 13+](https://www.postgresql.org/)
- **Database Driver**: [node-postgres (pg) 8.18.0](https://node-postgres.com/)
- **Authentication**: [JWT (jsonwebtoken) 9.0.3](https://github.com/auth0/node-jsonwebtoken)
- **Password Hashing**: [bcrypt 6.0.0](https://github.com/kelektiv/node.bcrypt.js)
- **Environment Variables**: [dotenv 17.3.1](https://github.com/motdotla/dotenv)

### Database

- **RDBMS**: PostgreSQL 13+
- **Migration System**: Custom SQL-based migrations
- **Schema Management**: Versioned SQL scripts
- **Triggers & Functions**: PL/pgSQL for business logic enforcement

---

## 📁 Project Structure

```
FleetFlow/
│
├── backend/                          # Backend API Server
│   ├── .env.example                  # Environment variables template
│   ├── config/                       # Configuration files
│   │   └── db.js                     # Database configuration
│   │
│   ├── controllers/                  # Route controllers
│   │   ├── authController.js         # Authentication logic
│   │   ├── driverController.js       # Driver management
│   │   ├── fuelController.js         # Fuel logging
│   │   ├── maintenanceController.js  # Maintenance operations
│   │   ├── reportController.js       # Analytics & reporting
│   │   ├── tripController.js         # Trip/dispatch management
│   │   └── vehicleController.js      # Vehicle management
│   │
│   ├── database/                     # Database management
│   │   ├── client.js                 # PostgreSQL connection pool
│   │   ├── init.js                   # Database initialization
│   │   ├── migrate.js                # Migration runner
│   │   ├── schema.sql                # Base schema definition
│   │   └── migrations/               # Versioned migrations
│   │       ├── 001_initial_schema.sql
│   │       └── 002_add_user_profile_fields.sql
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # JWT authentication & authorization
│   │   ├── errors.js                 # Error handling
│   │   └── validate.js               # Request validation
│   │
│   ├── routes/                       # API route definitions
│   │   ├── auth.js                   # Auth endpoints
│   │   ├── drivers.js                # Driver endpoints
│   │   ├── fuel.js                   # Fuel endpoints
│   │   ├── maintenance.js            # Maintenance endpoints
│   │   ├── reports.js                # Report endpoints
│   │   ├── trips.js                  # Trip endpoints
│   │   └── vehicles.js               # Vehicle endpoints
│   │
│   ├── validators/                   # Request validators
│   │   ├── authValidators.js
│   │   ├── driverValidators.js
│   │   ├── fuelValidators.js
│   │   ├── maintenanceValidators.js
│   │   ├── reportValidators.js
│   │   ├── tripValidators.js
│   │   └── vehicleValidators.js
│   │
│   ├── package.json                  # Backend dependencies
│   ├── package-lock.json             # Dependency lock file
│   └── server.js                     # Express server entry point
│
├── frontend/                         # Next.js Frontend
│   ├── .env.example                  # Environment variables template
│   ├── app/                          # Next.js App Router
│   │   ├── auth/                     # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dispatch/                 # Dispatch management
│   │   │   └── page.tsx
│   │   ├── drivers/                  # Driver management
│   │   │   └── page.tsx
│   │   ├── vehicles/                 # Vehicle management
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Dashboard page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── cards/                    # Card components
│   │   │   ├── ActivityItem.tsx
│   │   │   └── MetricCard.tsx
│   │   ├── dialogs/                  # Modal dialogs
│   │   │   ├── AddDriverModal.tsx
│   │   │   └── AddVehicleModal.tsx
│   │   ├── forms/                    # Form components
│   │   │   ├── AddDriverForm.tsx
│   │   │   ├── AddVehicleForm.tsx
│   │   │   └── DispatchForm.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── providers/                # Context providers
│   │   │   └── AuthProvider.tsx
│   │   ├── tables/                   # Table components
│   │   │   ├── DriversTable.tsx
│   │   │   ├── TripsTable.tsx
│   │   │   └── VehiclesTable.tsx
│   │   ├── ui/                       # shadcn/ui components (60+ components)
│   │   │   ├── button.tsx, card.tsx, dialog.tsx, etc.
│   │   └── theme-provider.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── api-client.ts             # API client configuration
│   │   ├── api.ts                    # API service functions
│   │   ├── mock-data.ts              # Mock data for development
│   │   ├── types.ts                  # TypeScript type definitions
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── public/                       # Static assets
│   ├── styles/                       # Additional styles
│   │   └── globals.css
│   ├── components.json               # shadcn/ui configuration
│   ├── next.config.mjs               # Next.js configuration
│   ├── next-env.d.ts                 # Next.js TypeScript definitions
│   ├── package.json                  # Frontend dependencies
│   ├── pnpm-lock.yaml                # pnpm lock file
│   ├── postcss.config.mjs            # PostCSS configuration
│   └── tsconfig.json                 # TypeScript configuration
│
└── README.md                         # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** or **pnpm** (v8.x or higher)
- **PostgreSQL** (v13.x or higher)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/fleetflow.git
cd FleetFlow
```

2. **Set up the Backend**

```bash
cd backend
npm install
```

3. **Set up the Frontend**

```bash
cd ../frontend
pnpm install
# or npm install
```

4. **Configure Environment Variables**

Create `.env` files in both `backend` and `frontend` directories (see [Environment Variables](#-environment-variables) section).

5. **Set up the Database**

```bash
# Create a PostgreSQL database
createdb fleetflow

# Run migrations from the backend directory
cd backend
npm run migrate
```

6. **Important: Register Routes in Backend**

⚠️ **Current State:** The API routes are defined but not yet registered in `server.js`. You need to import and register them.

Add these imports at the top of `backend/server.js`:

```javascript
import authRoutes from "./routes/auth.js";
import vehiclesRoutes from "./routes/vehicles.js";
import driversRoutes from "./routes/drivers.js";
import tripsRoutes from "./routes/trips.js";
import fuelRoutes from "./routes/fuel.js";
import maintenanceRoutes from "./routes/maintenance.js";
import reportsRoutes from "./routes/reports.js";
```

Then register the routes after `app.use(express.json())`:

```javascript
// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/reports", reportsRoutes);
```

7. **Start the Development Servers**

**Backend** (Terminal 1):

```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):

```bash
cd frontend
pnpm dev
# or: npm run dev
```

8. **Access the Application**

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend Health Check: [http://localhost:4000/health](http://localhost:4000/health)
- API Base: [http://localhost:4000/api](http://localhost:4000/api) (after registering routes)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Server Configuration
PORT=4000
HOST=0.0.0.0

# Database Configuration (Option 1: Individual parameters)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=fleetflow
DB_SSL=false

# JWT Authentication
JWT_SECRET=replace-with-strong-secret-key
JWT_EXPIRES_IN=12h

# Database Lifecycle
# Safe defaults: run versioned migrations on startup
DB_RUN_MIGRATIONS_ON_STARTUP=true

# WARNING: Dangerous reset - runs destructive bootstrap from database/schema.sql
DB_BOOTSTRAP_ON_STARTUP=false
```

**Important Notes:**

- Change `JWT_SECRET` to a strong random string in production
- Set `DB_BOOTSTRAP_ON_STARTUP=false` in production (it drops all tables!)
- The backend runs on port 4000 by default

### Frontend (`frontend/.env.local`)

Create a `.env.local` file in the `frontend/` directory based on `.env.example`:

```env
# API Configuration
# Note: Update this if your backend runs on a different port or has an /api prefix
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**Important Notes:**

- The `.env.example` file references port 5000, but the backend defaults to port 4000
- Adjust the `NEXT_PUBLIC_API_URL` to match your backend configuration
- Add `/api` prefix if your routes are mounted under that path

---

## 🗄 Database Setup

### Schema Overview

The database schema includes the following core tables:

- **users** - User accounts with role-based access
- **vehicles** - Fleet vehicle inventory
- **drivers** - Driver information and licenses
- **trips** - Trip/dispatch records
- **maintenance_logs** - Vehicle maintenance history
- **fuel_logs** - Fuel consumption records

### Database Views

Pre-built views for analytics:

- `q_fleet_utilization_rate`
- `q_fuel_efficiency_distance_per_liter`
- `q_vehicles_currently_in_maintenance`
- `q_drivers_with_expired_licenses`
- `q_cost_per_trip`
- `q_monthly_fuel_expense_summary`
- `q_total_operational_cost_per_vehicle`

### Database Triggers

Automated business logic enforcement:

- Vehicle status synchronization during trips
- Automatic vehicle marking when entering maintenance
- Business rule validation on dispatch

### Running Migrations

```bash
cd backend
npm run migrate
```

### Bootstrap Database (Destructive)

⚠️ **Warning**: This will drop all existing data!

```bash
# Set environment variable
DB_BOOTSTRAP_ON_STARTUP=true

# Restart server
npm run dev
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:4000/api
```

**Note:** Routes must be registered in `server.js` with the `/api` prefix for this to work.

### Authentication

All protected endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### API Response Format

Successful responses return JSON with appropriate status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Endpoints

#### Authentication

| Method | Endpoint         | Description         | Public |
| ------ | ---------------- | ------------------- | ------ |
| POST   | `/auth/register` | Register a new user | ✅     |
| POST   | `/auth/login`    | Login user          | ✅     |

#### Vehicles

| Method | Endpoint               | Description             | Roles                                       |
| ------ | ---------------------- | ----------------------- | ------------------------------------------- |
| GET    | `/vehicles`            | List all vehicles       | Manager, Dispatcher, SafetyOfficer, Analyst |
| POST   | `/vehicles`            | Create vehicle          | Manager, Dispatcher                         |
| PUT    | `/vehicles/:id/status` | Update vehicle status   | Manager, Dispatcher                         |
| GET    | `/vehicles/available`  | List available vehicles | Manager, Dispatcher                         |

#### Drivers

| Method | Endpoint              | Description           | Roles                                       |
| ------ | --------------------- | --------------------- | ------------------------------------------- |
| GET    | `/drivers`            | List all drivers      | Manager, Dispatcher, SafetyOfficer, Analyst |
| POST   | `/drivers`            | Create driver         | Manager, SafetyOfficer                      |
| PUT    | `/drivers/:id/status` | Update driver status  | Manager, SafetyOfficer                      |
| GET    | `/drivers/eligible`   | List eligible drivers | Manager, Dispatcher, SafetyOfficer          |

#### Trips

| Method | Endpoint              | Description          | Roles                        |
| ------ | --------------------- | -------------------- | ---------------------------- |
| GET    | `/trips`              | List all trips       | Manager, Dispatcher, Analyst |
| POST   | `/trips/dispatch`     | Create/dispatch trip | Manager, Dispatcher          |
| PUT    | `/trips/:id/complete` | Complete trip        | Manager, Dispatcher          |
| PUT    | `/trips/:id/cancel`   | Cancel trip          | Manager, Dispatcher          |

#### Fuel

| Method | Endpoint            | Description              | Roles                        |
| ------ | ------------------- | ------------------------ | ---------------------------- |
| POST   | `/fuel`             | Log fuel consumption     | Manager, Dispatcher          |
| GET    | `/fuel/vehicle/:id` | Get fuel logs by vehicle | Manager, Dispatcher, Analyst |
| GET    | `/fuel/trip/:id`    | Get fuel logs by trip    | Manager, Dispatcher, Analyst |

#### Maintenance

| Method | Endpoint       | Description           | Roles                           |
| ------ | -------------- | --------------------- | ------------------------------- |
| POST   | `/maintenance` | Log maintenance       | Manager, SafetyOfficer          |
| GET    | `/maintenance` | List maintenance logs | Manager, SafetyOfficer, Analyst |

#### Reports

| Method | Endpoint                              | Description                 | Roles                           |
| ------ | ------------------------------------- | --------------------------- | ------------------------------- |
| GET    | `/reports/dashboard`                  | Dashboard metrics           | Manager, Analyst, SafetyOfficer |
| GET    | `/reports/vehicle-cost/:id`           | Cost analysis by vehicle    | Manager, Analyst                |
| GET    | `/reports/fuel-efficiency/:vehicleId` | Fuel efficiency for vehicle | Manager, Analyst                |

---

## 👥 User Roles & Permissions

FleetFlow implements a role-based access control system with four distinct roles:

### Manager

**Full system access** - Can perform all operations

- Manage vehicles and drivers
- Dispatch and manage trips
- Log fuel and maintenance
- View all reports and analytics
- User administration

### Dispatcher

**Operations focus** - Handles day-to-day dispatch operations

- View vehicles and drivers
- Create and manage trips
- Dispatch vehicles
- Log fuel consumption
- View operational reports

### SafetyOfficer

**Compliance focus** - Ensures safety and regulatory compliance

- Manage driver information
- Update safety scores
- Log and view maintenance
- View safety-related reports
- Monitor license expiration

### Analyst

**Read-only analytics** - Data analysis and reporting

- View all vehicles, drivers, and trips
- Access all reports and analytics
- Generate insights
- No write permissions

---

## 💻 Development

### Backend Development

```bash
cd backend

# Development with auto-reload
npm run dev

# Production mode
npm start

# Run migrations
npm run migrate
```

### Frontend Development

```bash
cd frontend

# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Code Style

- **Backend**: JavaScript with ES Modules
- **Frontend**: TypeScript with strict mode
- **Formatting**: Follow existing patterns
- **Naming Conventions**:
  - camelCase for variables and functions
  - PascalCase for React components
  - UPPER_CASE for constants

### Database Development

```bash
# Create a new migration
cd backend/database/migrations
# Create file: XXX_description.sql

# Run migrations
npm run migrate
```

---

## 🚢 Deployment

### Prerequisites

⚠️ **Before Deployment:** Ensure API routes are registered in `server.js`. See the [Getting Started](#-getting-started) section for details.

### Backend Deployment

1. **Environment Setup**
   - Set all required environment variables
   - Use `DB_RUN_MIGRATIONS_ON_STARTUP=true` to auto-migrate
   - Set `JWT_SECRET` to a strong random string
   - **Important**: Set `DB_BOOTSTRAP_ON_STARTUP=false` (destructive in production)

2. **Database**
   - Provision PostgreSQL 13+ instance
   - Run migrations on first deploy
   - Configure connection pooling
   - Ensure database credentials are secure

3. **Register API Routes**
   - Import and register all route modules in `server.js`
   - Mount routes under `/api` prefix

4. **Server**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

### Frontend Deployment

1. **Environment Setup**
   - Set `NEXT_PUBLIC_API_URL` to your backend API URL
   - Include `/api` prefix if routes are mounted under that path

#### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

#### Docker (Alternative)

```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Write clear, self-documenting code
- Add comments for complex logic
- Follow existing code style
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues, questions, or contributions, please:

- Open an issue on GitHub
- Contact the development team
- Check existing documentation

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Express](https://expressjs.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

<div align="center">
  
  **Made with ❤️ by the FleetFlow Team**
  
  *Streamlining fleet operations, one vehicle at a time*

</div>
