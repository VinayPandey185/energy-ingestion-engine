# High-Scale Energy Ingestion Engine

## Overview
This project implements a backend ingestion and analytics service for a fleet platform managing
Smart Meters and Electric Vehicles (EVs). The system ingests high-frequency telemetry data,
stores it efficiently, and provides analytical insights into energy efficiency and vehicle performance.

The design focuses on scalability, correctness, and performance for write-heavy workloads.

---

## Tech Stack
- Node.js
- NestJS (TypeScript)
- PostgreSQL
- Prisma ORM
- Docker & Docker Compose

---

## Problem Context

### Smart Meter (Grid Side)
- Measures AC (Alternating Current) energy consumed from the grid
- Reports:
  - meterId
  - kwhConsumedAc
  - voltage
  - timestamp

### EV & Charger (Vehicle Side)
- Converts AC to DC for battery charging
- Reports:
  - vehicleId
  - soc (State of Charge)
  - kwhDeliveredDc
  - batteryTemp
  - timestamp

In real-world systems, AC energy consumed is always higher than DC energy delivered due to
conversion losses. Efficiency is calculated as:

 Efficiency = DC Delivered / AC Consumed


A drop in efficiency may indicate hardware faults or energy leakage.

---

## System Design

### Polymorphic Ingestion
A single endpoint handles both telemetry streams:

POST /v1/ingest

The payload structure determines whether the incoming data belongs to a Smart Meter
or a Vehicle. DTO-based validation ensures schema correctness and data integrity.

---

### Hot vs Cold Data Strategy

#### Cold Store (Historical Data)
- Append-only storage
- Stores every telemetry event
- Used for analytics and long-term reporting

Tables:
- meter_readings_history
- vehicle_readings_history

#### Hot Store (Operational Data)
- Stores only the latest state per device
- Updated using UPSERT
- Optimized for fast dashboard access

Tables:
- meter_live_status
- vehicle_live_status

---

### Persistence Logic
- Historical data: INSERT only (audit trail)
- Live operational data: UPSERT (atomic update)

This approach prevents expensive scans when querying current device status.

---

## Analytics Endpoint

GET /v1/analytics/performance/:vehicleId


Returns a 24-hour summary:
- Total AC energy consumed
- Total DC energy delivered
- Efficiency ratio (DC / AC)
- Average battery temperature

Time-based filtering and indexed queries ensure that analytics do not perform
full table scans on historical data.

**Assumption:**  
For simplicity, a 1:1 mapping between `vehicleId` and `meterId` is assumed.
In a production system, this relationship would be handled using a mapping table.

---

## Scaling Considerations

With 10,000 devices sending two telemetry streams every minute:

-> 10,000 × 2 × 60 × 24 ≈ 14.4 million records per day


Design choices supporting scalability:
- Append-only writes for high ingestion throughput
- Indexed timestamp-based queries for analytics
- Separation of operational (hot) and analytical (cold) data paths

---

## Running the Project

### Prerequisites
- Node.js
- Docker

### Start Database
```bash
docker compose up -d

Install Dependencies & Start Application

npm install
npm run start:dev

### Testing

- POST ingestion endpoints tested using Postman

- GET analytics endpoint tested via browser/Postman

 Prisma Studio used to verify hot vs cold data behavior

Conclusion

This project demonstrates a scalable backend architecture for high-frequency telemetry
ingestion and analytics using NestJS and PostgreSQL, following industry-standard
design patterns for performance and data integrity.





