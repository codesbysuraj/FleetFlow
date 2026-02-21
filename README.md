# FleetFlow — Fleet Management System

A full-stack fleet management application with **role-based access control (RBAC)**, real-time dashboards, trip dispatching, vehicle registry, maintenance tracking, expense management, driver performance monitoring, and analytics with pie charts.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [RBAC — Roles & Permissions](#rbac--roles--permissions)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Frontend Pages](#frontend-pages)
- [License](#license)

---

## Features

- **Login & Authentication** — JWT-based auth with 6-hour token expiry, bcrypt password hashing
- **Role-Based Access Control** — 4 user roles with distinct permissions enforced at UI + API level
- **Admin User Management** — Admin/Manager can add, view, and delete system users with role assignment
- **Vehicle Registry** — Add, edit, search, delete, import/export fleet vehicles
- **Trip Dispatcher** — Create trips with cargo weight validation against vehicle capacity, track trip lifecycle (Draft → Dispatched → Completed/Cancelled)
- **Maintenance & Service Logs** — Log vehicle repairs, auto-hide vehicles from dispatch while "In Shop"
- **Trip & Expense Tracking** — Track fuel costs, miscellaneous expenses per trip
- **Driver Performance** — Monitor driver metrics, license expiry, safety scores, complaints
- **Analytics Dashboard** — Pie charts for trip status, vehicle status, cost distribution, fleet overview
- **Shared Navigation** — Consistent blue navbar with hamburger sidebar across all pages, role-aware menu items

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19.2, Vite 7.3, Plain CSS |
| **Backend** | Python, Flask, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS |
| **Database** | MySQL 8.0 (mysql-connector-python) |
| **Auth** | JWT tokens (6h expiry), bcrypt hashing |
| **API Style** | RESTful, 8 Blueprint groups |

---

## Project Structure

```
FleetFlow/
├── package.json
└── fleetflow/
    ├── fleetflow.sql              # Database schema (7 tables)
    │
    ├── Backend/
    │   ├── run.py                 # Flask entry point (port 5000)
    │   └── app/
    │       ├── __init__.py        # App factory, CORS, JWT, blueprint registration
    │       ├── config.py          # Secret keys
    │       ├── db.py              # MySQL connection
    │       └── routes/
    │           ├── auth.py        # Login (POST /auth/login)
    │           ├── users.py       # User CRUD (GET/POST/DELETE /users/)
    │           ├── vehicle_Reg.py # Vehicle CRUD (/vehicles/)
    │           ├── trips.py       # Trip management (/trips/)
    │           ├── drivers.py     # Driver management (/drivers/)
    │           ├── maintenance.py # Service logs (/maintenance/)
    │           ├── expense.py     # Expense tracking (/expenses/)
    │           └── analytics.py   # Dashboard KPIs (/analytics/)
    │
    └── Frontend/
        ├── index.html
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── main.jsx              # React entry
            ├── App.jsx               # Root component + RBAC routing
            ├── Layout.jsx            # Shared navbar + sidebar
            ├── login.jsx             # Login page
            ├── AdminDashboard.jsx    # Dashboard with summary cards
            ├── VehicleRegistry.jsx   # Vehicle CRUD page
            ├── TripDispatcher.jsx    # Trip creation + management
            ├── Maintenance.jsx       # Service logs page
            ├── Expenses.jsx          # Expense tracking page
            ├── Performance.jsx       # Driver performance table
            ├── Analytics.jsx         # Pie chart analytics
            └── AddUser.jsx           # User management (admin)
```

---

## Prerequisites

- **Node.js** (v18+) & **npm**
- **Python** (3.10+)
- **MySQL 8.0** Server
- **pip** (Python package manager)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/codesbysuraj/FleetFlow.git
cd FleetFlow
```

### 2. Set Up the Database

Make sure MySQL is running, then import the schema:

```bash
mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS fleetflow;"
mysql -u root -p123456 fleetflow < fleetflow/fleetflow.sql
```

> **Note:** If your MySQL password is different from `123456`, update it in `fleetflow/Backend/app/db.py`.

### 3. Install Backend Dependencies

```bash
cd fleetflow/Backend
pip install flask flask-cors flask-bcrypt flask-jwt-extended mysql-connector-python
```

### 4. Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

---

## Running the Application

### Start the Backend (Terminal 1)

```bash
cd fleetflow/Backend
python run.py
```

Backend runs at **http://127.0.0.1:5000**

### Start the Frontend (Terminal 2)

```bash
cd fleetflow/Frontend
npm run dev
```

Frontend runs at **http://localhost:5173** (or next available port)

---

## Default Credentials

| User | Email | Password | Role |
|---|---|---|---|
| **System Admin** | `admin@fleetflow.com` | `admin123` | admin (full access) |

> The admin account is hardcoded. Use the **Manage Users** page to create additional users with specific roles.

---

## RBAC — Roles & Permissions

| Feature | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Vehicle Registry | ✅ | ❌ | ❌ | ❌ |
| Trip Dispatcher | ✅ | ✅ | ❌ | ❌ |
| Maintenance Logs | ✅ | ❌ | ❌ | ❌ |
| Trip & Expense | ✅ | ❌ | ❌ | ✅ |
| Performance | ✅ | ❌ | ✅ | ❌ |
| Analytics | ✅ | ❌ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |

- **Fleet Manager** (`manager`) — Full system access
- **Dispatcher** (`dispatcher`) — Create & manage trips, assign vehicles/drivers, validate cargo
- **Safety Officer** (`safety`) — Monitor driver compliance, view safety scores
- **Financial Analyst** (`analyst`) — View expenses, fuel logs, maintenance costs, analytics
- **Drivers** — Managed as resources (no login access)

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login with email & password, returns JWT |

### Users (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/` | List all users |
| POST | `/users/` | Create user (name, email, password, role) |
| DELETE | `/users/<id>` | Delete a user |

### Vehicles

| Method | Endpoint | Description |
|---|---|---|
| GET | `/vehicles/` | List all vehicles |
| POST | `/vehicles/` | Register a new vehicle |
| PUT | `/vehicles/<id>` | Update vehicle details |
| DELETE | `/vehicles/<id>` | Remove a vehicle |

### Trips

| Method | Endpoint | Description |
|---|---|---|
| GET | `/trips/` | List all trips |
| POST | `/trips/` | Create a new trip (validates cargo weight) |
| PUT | `/trips/<id>` | Update trip status |

### Drivers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/drivers/available` | List available drivers |
| POST | `/drivers/` | Add a new driver |
| PUT | `/drivers/<id>` | Update driver info |
| DELETE | `/drivers/<id>` | Remove a driver |

### Maintenance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/maintenance/` | List maintenance logs |
| POST | `/maintenance/` | Create service entry |
| PUT | `/maintenance/<id>/complete` | Mark service as complete |

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses/` | List fuel & expense logs |
| POST | `/expenses/` | Add expense entry |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/dashboard` | Get dashboard KPIs |
| GET | `/analytics/vehicle-roi` | Get vehicle ROI data |

> All endpoints except `/auth/login` require a `Bearer <token>` in the `Authorization` header.

---

## Database Schema

**7 Tables** — MySQL 8.0 with foreign keys and CHECK constraints:

```
┌──────────────────┐     ┌──────────────────┐
│      users       │     │     vehicles      │
├──────────────────┤     ├──────────────────┤
│ id (PK)          │     │ id (PK)          │
│ name             │     │ model_name       │
│ email (UNIQUE)   │     │ license_plate    │
│ password_hash    │     │ vehicle_type     │
│ role             │     │ max_capacity_kg  │
│ created_at       │     │ odometer_reading │
└──────────────────┘     │ status           │
                         │ acquisition_cost │
┌──────────────────┐     └────────┬─────────┘
│     drivers      │              │
├──────────────────┤     ┌────────┴─────────┐
│ id (PK)          │     │      trips       │
│ name             │     ├──────────────────┤
│ license_number   │◄────┤ driver_id (FK)   │
│ license_category │     │ vehicle_id (FK)  │
│ license_expiry   │     │ cargo_weight     │
│ status           │     │ origin           │
│ safety_score     │     │ destination      │
└──────────────────┘     │ status           │
                         └────────┬─────────┘
┌──────────────────┐              │
│   fuel_logs      │◄─────────────┘
├──────────────────┤
│ vehicle_id (FK)  │     ┌──────────────────┐
│ trip_id (FK)     │     │ maintenance_logs  │
│ liters, cost     │     ├──────────────────┤
└──────────────────┘     │ vehicle_id (FK)  │
                         │ service_type     │
┌──────────────────┐     │ cost             │
│   audit_logs     │     │ service_date     │
├──────────────────┤     └──────────────────┘
│ user_id (FK)     │
│ action           │
│ entity_type      │
└──────────────────┘
```

---

## Frontend Pages

| Page | Component | Description |
|---|---|---|
| **Login** | `login.jsx` | Email/password login with error handling and loading states |
| **Dashboard** | `AdminDashboard.jsx` | Summary cards (Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo), trip table |
| **Vehicle Registry** | `VehicleRegistry.jsx` | Add/edit/delete vehicles, search, import/export CSV |
| **Trip Dispatcher** | `TripDispatcher.jsx` | Create trips with vehicle/driver selection, cargo weight validation, status tracking |
| **Maintenance** | `Maintenance.jsx` | Service log table, create new service entries, vehicle auto-hide when In Shop |
| **Trip & Expense** | `Expenses.jsx` | Expense tracking per trip with fuel and misc costs |
| **Performance** | `Performance.jsx` | Driver metrics table — license, completion rate, safety score, complaints |
| **Analytics** | `Analytics.jsx` | 4 KPI cards + 4 SVG donut pie charts (Trip Status, Vehicle Status, Cost Distribution, Fleet Overview) |
| **Manage Users** | `AddUser.jsx` | Add users with role selection, user table with role badges, delete users |

All pages share a consistent **blue gradient navbar** with a **hamburger menu sidebar** via the `Layout.jsx` component.

---

## License

This project is for educational purposes.
