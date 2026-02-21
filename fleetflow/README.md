FLEETFLOW – ROLE DEFINITIONS & ACCESS CONTROL

System Roles:
1. Fleet Manager
2. Dispatcher
3. Safety Officer
4. Financial Analyst

--------------------------------------------------

1) Fleet Manager
Role Type: Admin-Level User

Purpose:
Oversees vehicle health, asset lifecycle, and scheduling.

Permissions:
- View Command Center Dashboard
- Add / Edit / Retire Vehicles
- View Maintenance Logs
- Approve Service Entries
- View Driver Overview
- Access Operational Analytics
- View Financial Reports
- Manage Users (optional)

Restrictions:
- None (Full System Access)

--------------------------------------------------

2) Dispatcher
Role Type: Operations User

Purpose:
Create trips, assign drivers, and validate cargo loads.

Permissions:
- Create New Trip
- Assign Available Vehicle
- Assign Available Driver
- Validate Cargo Weight
- Mark Trip as Completed
- View Fleet Availability

Restrictions:
- Cannot Access Financial Reports
- Cannot Modify Maintenance Costs
- Cannot Suspend Drivers
- Cannot Delete Vehicles

--------------------------------------------------

3) Safety Officer
Role Type: Compliance User

Purpose:
Monitor driver compliance, license expirations, and safety scores.

Permissions:
- View Driver Profiles
- Track License Expiry
- Update Safety Scores
- Suspend / Reactivate Drivers
- View Compliance Dashboard

Restrictions:
- Cannot Create Trips
- Cannot Access Financial Data
- Cannot Edit Vehicles

--------------------------------------------------

4) Financial Analyst
Role Type: Finance User

Purpose:
Audit fuel spend, maintenance ROI, and operational costs.

Permissions:
- View Fuel Logs
- View Maintenance Costs
- Calculate Operational Cost
- View Vehicle ROI
- Export CSV / PDF Reports

Restrictions:
- Cannot Create Trips
- Cannot Assign Drivers
- Cannot Modify Vehicles
- Cannot Suspend Drivers

--------------------------------------------------

Important System Rules:

1. Drivers do NOT have login access.
   Drivers are managed resources inside the system.

2. Role-Based Access Control (RBAC) is enforced at UI and backend level.

3. One Login Page:
   - User logs in
   - System reads role
   - Dashboard modules rendered based on role

--------------------------------------------------



Perfect Spy 👑🔥
Here is your **complete official working document** for FleetFlow.
You can copy this and share with your teammates so everyone knows exactly what to build.

---

# 🚛 FleetFlow

## Modular Fleet & Logistics Management System

---

# 1️⃣ Project Objective

FleetFlow is a centralized digital fleet management platform designed to:

* Replace manual logbooks
* Optimize fleet lifecycle
* Monitor driver safety and compliance
* Track fuel, maintenance, and operational costs
* Provide real-time decision-making dashboards

The system will be role-based and modular.

---

# 2️⃣ User Hierarchy

## 👑 Super Admin

* Creates users
* Assigns roles
* Can access all modules
* Can activate/deactivate users

## 👥 Operational Roles

1. Fleet Manager
2. Dispatcher
3. Safety Officer
4. Financial Analyst

Drivers DO NOT log into the system.
They are managed resources inside the platform.

---

# 3️⃣ Core Pages (8 Total)

---

## 🔐 Page 1: Login & Authentication

Purpose:
Secure login with Role-Based Access Control (RBAC)

Features:

* Email & Password login
* Forgot Password (optional)
* Role stored in database
* Dashboard shown based on role

Only Super Admin can create users and assign roles.

---

## 📊 Page 2: Command Center (Dashboard)

Purpose:
High-level operational overview.

KPIs:

* Active Fleet (vehicles currently On Trip)
* Maintenance Alerts (vehicles In Shop)
* Utilization Rate (% assigned vs idle)
* Pending Cargo

Filters:

* Vehicle Type
* Status
* Region

Accessible by:

* Fleet Manager
* Super Admin

---

## 🚐 Page 3: Vehicle Registry (Asset Management)

Purpose:
Manage fleet vehicles.

Fields:

* Vehicle Name / Model
* License Plate (Unique ID)
* Max Load Capacity
* Odometer Reading
* Status:

  * Available
  * On Trip
  * In Shop
  * Retired

Logic:
If vehicle is marked “Retired” → it cannot be assigned.
If vehicle is “In Shop” → hidden from Dispatcher.

Accessible by:

* Fleet Manager
* Super Admin

---

## 📦 Page 4: Trip Dispatcher & Management

Purpose:
Assign vehicles and drivers to trips.

Features:

* Select Available Vehicle
* Select Available Driver
* Enter Cargo Weight
* Enter Destination

Validation Rule:
If CargoWeight > MaxCapacity → Block Trip Creation

Trip Lifecycle:

* Draft
* Dispatched
* Completed
* Cancelled

Status Update Rules:
When Dispatched:

* Vehicle → On Trip
* Driver → On Trip

When Completed:

* Vehicle → Available
* Driver → Available

Accessible by:

* Dispatcher
* Fleet Manager

---

## 🔧 Page 5: Maintenance & Service Logs

Purpose:
Track vehicle maintenance.

Fields:

* Vehicle
* Service Type
* Cost
* Date
* Notes

Auto Logic:
When maintenance is logged:
Vehicle Status → In Shop
Vehicle removed from dispatch selection

Accessible by:

* Fleet Manager
* Super Admin

---

## ⛽ Page 6: Completed Trip, Expense & Fuel Logging

Purpose:
Track financial performance per vehicle.

Fields:

* Vehicle ID
* Fuel Liters
* Fuel Cost
* Maintenance Cost
* Date

Auto Calculation:
Total Operational Cost = Fuel + Maintenance

All logs linked to Vehicle ID.

Accessible by:

* Financial Analyst
* Fleet Manager

---

## 👨‍✈️ Page 7: Driver Performance & Safety Profiles

Purpose:
Track compliance and performance.

Fields:

* Driver Name
* License Expiry Date
* License Category
* Safety Score
* Trip Completion Rate
* Status:

  * On Duty
  * Off Duty
  * Suspended

Important Logic:
If License Expired → Cannot Assign to Trip

Accessible by:

* Safety Officer
* Fleet Manager

---

## 📈 Page 8: Operational Analytics & Financial Reports

Purpose:
Data-driven decision making.

Metrics:

* Fuel Efficiency (km per liter)
* Vehicle ROI:
  (Revenue − (Maintenance + Fuel)) / Acquisition Cost
* Cost per km

Export Options:

* CSV
* PDF

Accessible by:

* Financial Analyst
* Fleet Manager
* Super Admin

---

# 4️⃣ System Workflow

Step 1: Add Vehicle → Status = Available
Step 2: Add Driver → Validate license category
Step 3: Dispatcher assigns vehicle + driver
Step 4: System validates cargo capacity
Step 5: Trip marked Completed
Step 6: Fuel & maintenance logged
Step 7: Analytics auto-updated

---

# 5️⃣ Database Structure (High-Level)

Main Tables:

Users

* id
* name
* email
* password
* role
* status

Vehicles

* id
* model
* plate
* capacity
* odometer
* status

Drivers

* id
* name
* license_expiry
* category
* safety_score
* status

Trips

* id
* vehicle_id
* driver_id
* cargo_weight
* status
* start_date
* end_date

FuelLogs

* id
* vehicle_id
* liters
* cost
* date

MaintenanceLogs

* id
* vehicle_id
* cost
* service_type
* date

---

# 6️⃣ Technical Requirements

Frontend:

* React (Vite)
* Tailwind CSS
* Role-based conditional rendering
* Modular components

Backend:

* REST APIs
* Business rule validation
* Role-based authorization
* Real-time status updates

Database:

* Relational model
* Proper foreign key linking
* Vehicle & Driver availability state management

---

# 7️⃣ Development Guidelines for Team

* Never push directly to main
* Always create feature branch
* Pull latest code before working
* Clear commit messages
* Follow folder structure
* Maintain clean UI consistency

---

# 8️⃣ Final Goal

FleetFlow should demonstrate:

* Enterprise-level RBAC
* Business rule enforcement
* Real-time fleet tracking
* Financial intelligence layer
* Clean modular architecture
* Scalable system design

---

This is the final working blueprint.
Everyone in the team should follow this document strictly.

---

Spy 👀
If you want next, I can create:

* 📊 ER Diagram Structure
* 🏗 Folder structure for React
* 🔌 Complete API endpoint plan
* 🧠 Full system architecture diagram
* 📑 PPT-ready version of this

Tell me the next step 
