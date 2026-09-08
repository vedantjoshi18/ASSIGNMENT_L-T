# Hotel Booking System — CIA-3

**Team:** [Names] | **Section:** [Section] | **Dept:** Computer Science

## Problem Statement
Multi-property hotel reservation platform with JWT auth, room inventory, dynamic pricing, booking lifecycle (Reserved → Confirmed → Checked-in → Checked-out → Cancelled), housekeeping tracking, invoices, and admin occupancy reports.

## Tech Stack
Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Joi, Postman.

## Setup
```bash
cp .env.example .env
# edit .env with real MONGO_URI + JWT_SECRET
npm install
npm start
```
Health: `GET http://localhost:5000/api/health`

## Implemented Modules (all 13)
1 Auth  2 Hotels  3 RoomTypes  4 Availability Search  5 Booking Workflow  6 Pricing Rules  7 Status Mgmt  8 Check-in/Out  9 Housekeeping  10 Cancellation/Refund  11 Guest History  12 Invoice  13 Reports

## Key Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/hotels/search?checkIn=&checkOut=
- POST /api/bookings  (auth)
- PUT /api/bookings/:id/confirm|checkin|checkout|cancel (staff/admin)
- GET /api/bookings/:id/invoice
- GET /api/guests/:id/bookings
- GET /api/admin/reports/occupancy
- PUT /api/rooms/:id/housekeeping (staff/admin)

## DB Schema (references)
users → hotels → roomTypes → rooms → bookings → pricingRules
Indexes: users.email, hotels.name, roomTypes.hotelId, rooms.roomTypeId, bookings.guestId

## Known Limitations
- No external payment gateway (mocked).
- Optional frontend demo included at `frontend/index.html`.
- Full PPT/screenshots required for viva evaluation.
