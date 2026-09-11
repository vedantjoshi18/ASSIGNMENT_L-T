# Hotel Booking System — API Demo Guide

## Overview

A REST API for managing hotel reservations with role-based access control, dynamic pricing, and a full booking lifecycle.

**Base URL:** `http://localhost:5000`

---

## Roles


| Role      | Permissions                                                                            |
| --------- | -------------------------------------------------------------------------------------- |
| **guest** | Search hotels, make bookings, view/cancel own reservations                             |
| **staff** | All guest actions + confirm/check-in/check-out bookings, manage rooms and housekeeping |
| **admin** | Everything — create hotels, room types, pricing rules, view occupancy reports          |


---

## Authentication

All protected endpoints require a JWT in the header:

```
Authorization: Bearer <token>
```

Tokens are obtained via `/api/auth/register` and `/api/auth/login`. They expire after 24 hours.

---

## Demo Data (after running `bun run seed`)


| Role  | Email                                     | Password |
| ----- | ----------------------------------------- | -------- |
| Admin | [admin@hotel.com](mailto:admin@hotel.com) | admin123 |
| Staff | [staff@hotel.com](mailto:staff@hotel.com) | staff123 |
| Guest | [guest@hotel.com](mailto:guest@hotel.com) | guest123 |
| Guest | [priya@hotel.com](mailto:priya@hotel.com) | priya123 |


Seeded data includes 3 hotels, 8 room types, 63 rooms, 24 pricing rules, and 7 bookings across all lifecycle stages.

---

## Endpoints

### Auth — `/api/auth`


| Method | Path        | Access | Body                              |
| ------ | ----------- | ------ | --------------------------------- |
| POST   | `/register` | Public | `{ name, email, password, role }` |
| POST   | `/login`    | Public | `{ email, password }`             |


### Hotels — `/api/hotels`


| Method | Path                                       | Access        | Notes                |
| ------ | ------------------------------------------ | ------------- | -------------------- |
| GET    | `/`                                        | Authenticated | List all hotels      |
| GET    | `/:id`                                     | Authenticated | Get hotel by ID      |
| GET    | `/search?checkIn=&checkOut=&guests=&city=` | Authenticated | Find available rooms |
| POST   | `/`                                        | Admin         | Create hotel         |
| PUT    | `/:id`                                     | Admin         | Update hotel         |
| DELETE | `/:id`                                     | Admin         | Delete hotel         |


### Room Types — `/api/room-types`


| Method | Path         | Access        | Notes                                                |
| ------ | ------------ | ------------- | ---------------------------------------------------- |
| GET    | `/?hotelId=` | Authenticated | List room types (filter by hotel)                    |
| GET    | `/:id`       | Authenticated | Get room type                                        |
| POST   | `/`          | Admin         | `{ hotelId, name, basePrice, totalRooms, capacity }` |
| PUT    | `/:id`       | Admin         | Update room type                                     |
| DELETE | `/:id`       | Admin         | Delete room type                                     |


### Rooms — `/api/rooms`


| Method | Path                | Access      | Notes                                                       |
| ------ | ------------------- | ----------- | ----------------------------------------------------------- |
| GET    | `/?roomTypeId=`     | Staff/Admin | List rooms (filter by type)                                 |
| GET    | `/:id`              | Staff/Admin | Get room                                                    |
| POST   | `/`                 | Admin       | `{ roomTypeId, roomNumber, housekeepingStatus }`            |
| PUT    | `/:id`              | Admin       | Update room                                                 |
| PUT    | `/:id/housekeeping` | Staff/Admin | `{ housekeepingStatus: "CLEAN" | "DIRTY" | "MAINTENANCE" }` |
| DELETE | `/:id`              | Admin       | Delete room                                                 |


### Bookings — `/api/bookings`


| Method | Path            | Access            | Notes                                                |
| ------ | --------------- | ----------------- | ---------------------------------------------------- |
| POST   | `/`             | Authenticated     | `{ hotelId, roomTypeId, checkIn, checkOut, guests }` |
| GET    | `/:id`          | Owner/Staff/Admin | Get booking details                                  |
| PUT    | `/:id/confirm`  | Staff/Admin       | Confirm reservation                                  |
| PUT    | `/:id/checkin`  | Staff/Admin       | Check in guest                                       |
| PUT    | `/:id/checkout` | Staff/Admin       | Check out guest (marks room DIRTY)                   |
| PUT    | `/:id/cancel`   | Owner/Staff/Admin | Cancel with refund calculation                       |
| GET    | `/:id/invoice`  | Owner/Staff/Admin | Get invoice                                          |


### Pricing Rules — `/api/pricing-rules`


| Method | Path            | Access      | Notes                                                    |
| ------ | --------------- | ----------- | -------------------------------------------------------- |
| GET    | `/?roomTypeId=` | Staff/Admin | List rules (filter by room type)                         |
| POST   | `/`             | Admin       | `{ roomTypeId, season, startDate, endDate, multiplier }` |
| PUT    | `/:id`          | Admin       | Update rule                                              |
| DELETE | `/:id`          | Admin       | Delete rule                                              |


### Guest History — `/api/guests`


| Method | Path            | Access      | Notes                                          |
| ------ | --------------- | ----------- | ---------------------------------------------- |
| GET    | `/:id/bookings` | Owner/Admin | Returns upcoming, past, and cancelled bookings |


### Reports — `/api/admin/reports`


| Method | Path                  | Access | Notes                                    |
| ------ | --------------------- | ------ | ---------------------------------------- |
| GET    | `/occupancy?hotelId=` | Admin  | System-wide occupancy and revenue report |


### Health Check


| Method | Path          | Access |
| ------ | ------------- | ------ |
| GET    | `/api/health` | Public |


---

## Booking Lifecycle

```
RESERVED → CONFIRMED → CHECKED_IN → CHECKED_OUT
    ↓           ↓
 CANCELLED   CANCELLED
```

- Only valid transitions are allowed
- Checking out a guest automatically sets room status to DIRTY
- A cancelled booking cannot be reactivated

---

## Dynamic Pricing

When a booking is created, the server calculates the total by:

1. Iterating each night of the stay
2. Finding all `PricingRule` records that overlap that night
3. Applying the highest multiplier per night (e.g., 1.5x peak season, 1.25x weekend)
4. Adding 18% GST on top

Example: A 3-night stay during peak season with a base price of ₹5,000/night:


| Night        | Base   | Multiplier | Price       |
| ------------ | ------ | ---------- | ----------- |
| Night 1      | ₹5,000 | 1.5x       | ₹7,500      |
| Night 2      | ₹5,000 | 1.5x       | ₹7,500      |
| Night 3      | ₹5,000 | 1.5x       | ₹7,500      |
| **Subtotal** |        |            | **₹22,500** |
| GST (18%)    |        |            | ₹4,050      |
| **Total**    |        |            | **₹26,550** |


---

## Refund Policy

Cancellation refund depends on time before check-in:


| Timing             | Refund |
| ------------------ | ------ |
| More than 48 hours | 100%   |
| 24 to 48 hours     | 50%    |
| Less than 24 hours | 0%     |


---

## Response Format

**Success:**

```json
{
  "success": true,
  "message": "Hotels retrieved successfully",
  "data": [ ... ],
  "count": 3
}
```

**Error:**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "INVALID_CREDENTIALS"
}
```

---

## Error Codes


| Code                        | Meaning                                               |
| --------------------------- | ----------------------------------------------------- |
| `INVALID_CREDENTIALS`       | Wrong email or password                               |
| `DUPLICATE_EMAIL`           | Email already registered                              |
| `NO_TOKEN`                  | Missing Authorization header                          |
| `INVALID_TOKEN`             | Malformed JWT                                         |
| `TOKEN_EXPIRED`             | Token older than 24 hours                             |
| `USER_NOT_FOUND`            | User ID in token no longer exists                     |
| `FORBIDDEN`                 | Authenticated but not authorized                      |
| `ROUTE_NOT_FOUND`           | Wrong URL or method                                   |
| `HOTEL_NOT_FOUND`           | Hotel ID doesn't exist                                |
| `ROOM_TYPE_NOT_FOUND`       | Room type ID doesn't exist or belongs to wrong hotel  |
| `ROOM_NOT_FOUND`            | Room ID doesn't exist                                 |
| `ROOM_UNAVAILABLE`          | No rooms free for the requested dates                 |
| `ROOM_LIMIT_EXCEEDED`       | Room type already has max rooms created               |
| `CAPACITY_EXCEEDED`         | Guest count exceeds room capacity                     |
| `BOOKING_NOT_FOUND`         | Booking ID doesn't exist                              |
| `INVALID_STATUS_TRANSITION` | Can't move booking to that status from current status |
| `ALREADY_CANCELLED`         | Booking is already cancelled                          |
| `INVALID_CANCELLATION`      | Only RESERVED or CONFIRMED bookings can be cancelled  |
| `INVALID_DATE`              | Check-in date is in the past                          |
| `PRICING_RULE_NOT_FOUND`    | Pricing rule ID doesn't exist                         |


---

## Running the Demo

### 1. Start the server

```bash
cd "L and T CIA 3"
bun run dev
```

### 2. Seed the database

```bash
bun run seed
```

### 3. Open the frontend

```bash
open frontend/index.html
```

### 4. Or use Postman

Import `Hotel_Booking_System.postman_collection.json` and run requests in order. Tokens and IDs auto-save via test scripts.

---

## Sample Workflow (10 minutes)

1. **Health check** — `GET /api/health`
2. **Login as admin** — `POST /api/auth/login` with admin credentials
3. **Create a hotel** — `POST /api/hotels`
4. **Create a room type** — `POST /api/room-types` with the hotel ID
5. **Create a room** — `POST /api/rooms` with the room type ID
6. **Login as guest** — `POST /api/auth/login` with guest credentials
7. **Search availability** — `GET /api/hotels/search` with dates
8. **Create a booking** — `POST /api/bookings`
9. **Switch to staff** — confirm, check in, check out the booking
10. **View invoice** — `GET /api/bookings/:id/invoice`
11. **View report** — `GET /api/admin/reports/occupancy` (admin)

