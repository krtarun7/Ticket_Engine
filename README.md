# Ticket Engine

An enterprise-grade, high-concurrency event ticketing and seat booking platform built with a FastAPI asynchronous backend, PostgreSQL, Redis for concurrency control, and a React frontend integrated with Razorpay payments.

## 🚀 Key Architectural Highlights

* **Concurrency Control & Race Condition Prevention:** Utilizes atomic Redis locks (`SET NX` with expiration) during seat selection to manage high-traffic pressure and completely eliminate double-booking edge cases.
* **Secure Two-Step Payment Pipeline:** Integrates Razorpay checkout flow with server-side cryptographic signature verification (`/verify` endpoint) before committing booking confirmations and seat allocations to the database.
* **Asynchronous Backend Architecture:** Built with **FastAPI** and **Async SQLAlchemy** for high-performance, non-blocking database queries and operations.
* **Strict Type Safety & Data Integrity:** Employs rigorous Pydantic schemas and UUID routing to handle relational flows safely across Events, Seats, Bookings, and Payments.

---

## 🛠️ Tech Stack

* **Backend:** FastAPI, Python, SQLAlchemy (Async), Pydantic, Redis (Asyncio)
* **Database:** PostgreSQL
* **Frontend:** React, React Router, Axios, Vite
* **Payments:** Razorpay API & Signature Verification

---

## ⚙️ Core System Workflows

1. **Seat Locking:** When a user selects a seat, a temporary atomic lock is acquired in Redis (10-second expiry) to prevent simultaneous bookings.
2. **Pending Booking Creation:** A pending booking record is created in PostgreSQL with an expiration timestamp.
3. **Checkout & Order Generation:** The backend calls Razorpay to initialize an order mapped to the transaction amount.
4. **Verification & Fulfillment:** Upon successful frontend payment execution, Razorpay returns a cryptographic signature. The backend validates this signature, updates the booking status to `CONFIRMED`, marks the seat as `BOOKED`, and releases the Redis lock.

---

## 📂 Project Structure

```text
ticket_engine/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/       # FastAPI routers (bookings, events, payments, etc.)
│   ├── core/                    # Core configs, security, Redis, and Razorpay helpers
│   ├── db/                      # Database session management
│   ├── models/                  # SQLAlchemy ORM models (User, Event, Seat, Booking)
│   └── schemas/                 # Pydantic data validation models
├── ticket-frontend/             # React single-page application
└── main.py                      # FastAPI application entry point
