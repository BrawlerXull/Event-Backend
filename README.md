# Evently 🎟️

Evently is a scalable backend system for managing large-scale event
bookings.\
It ensures **concurrent ticket booking without overselling**, provides
**analytics for admins**, and scales seamlessly during peak traffic.

------------------------------------------------------------------------

## 🚀 Tech Stack

-   **Backend Framework**: Node.js + Express (for REST APIs)
-   **Database**: PostgreSQL (for relational integrity of users, events,
    bookings)
-   **ORM**: Prisma (schema management + migrations)
-   **Cache & Queue**: Redis + BullMQ (for job queues, rate limiting,
    caching)
-   **Concurrency Control**: Redlock (distributed locking to avoid
    overselling seats)
-   **Auth**: JWT-based authentication
-   **Validation**: Zod (runtime request validation)
-   **Containerization**: Docker + Docker Compose (for easy deployment)
-   **Logging**: Winston (structured logging)

------------------------------------------------------------------------

## 🏗️ Architecture

``` plaintext
  Users/Admins
       |
       | HTTP REST API
       v
  ┌─────────────────────────┐
  |    Express Controller   |  <- Handles validation & auth
  └─────────┬───────────────┘
            |
            v
   ┌─────────────────────┐
   | Redis Queue (BullMQ) |  <- Queues booking requests
   └─────────┬───────────┘
             |
             v
      ┌─────────────┐
      | Booking     |  <- Worker processes jobs sequentially
      | Worker      |
      └─────┬───────┘
            |
            v
   ┌────────────────────┐
   | Booking Service    |  <- Handles booking/cancellation logic
   | - Transactions     |
   | - Capacity checks  |
   | - Seat-level locks |
   └─────────┬─────────┘
             |
             v
       ┌─────────────┐
       | PostgreSQL   |  <- Stores users, events, bookings
       └─────────────┘
```

------------------------------------------------------------------------

## 📌 Features

### User

-   Browse events (name, venue, time, capacity)
-   Book tickets (safe from overselling)
-   Cancel tickets
-   View booking history

### Admin

-   Create/update/manage events
-   View booking analytics (popular events, utilization)

### System

-   Concurrency-safe booking (via Redis + Redlock)
-   Scalable with workers & queues
-   Fault tolerant & modular

------------------------------------------------------------------------

## ⚡ Quickstart

### Prerequisites

-   Node.js (v18+)
-   Docker + Docker Compose
-   PostgreSQL + Redis (via Docker)

### Setup

``` bash
# Clone repo & setup env
cp .env.example .env

# Start dependencies
docker-compose up --build

# Install dependencies
npm install

# Run in dev mode
npm run dev
```

### Database Migrations

``` bash
npx prisma migrate dev
```

### Run Tests

``` bash
npm test
```

### Run Worker

``` bash
npm run worker
# or
node dist/queue/booking.processor.js
```

------------------------------------------------------------------------

## 🔗 API Endpoints

### 🔑 Auth (`/api/auth`)

-   **POST** `/signup` → User signup (`email`, `password`, `name?`)
-   **POST** `/login` → User login (`email`, `password`)
-   **POST** `/refresh` → Refresh access token (`refreshToken`)

### 📅 Events (`/api/events`)

-   **POST** `/` → Create new event *(auth required)*
-   **GET** `/` → List events (supports filters: `page`, `limit`,
    `from`, `to`, `q`)
-   **GET** `/:eventId` → Get single event details

### 🎟️ Bookings

-   **POST** `/events/:eventId/book` → Book tickets *(auth required,
    idempotency supported)*
-   **POST** `/bookings/:bookingId/cancel` → Cancel booking *(auth
    required)*

### 💺 Seats (`/api/events/:eventId/seats`)

-   **GET** `/` → List seats for an event
-   **POST** `/hold` → Hold seats *(auth required)*
-   **POST** `/confirm` → Confirm held seats *(auth required)*

### 🕒 Waitlist (`/api/events/:eventId/waitlist`)

-   **POST** `/` → Join waitlist *(auth required)*
-   **DELETE** `/` → Leave waitlist *(auth required)*
-   **GET** `/` → View waitlist *(auth required --- organizer/admin)*

### 🛠️ Admin (`/api/admin`)

-   **POST** `/events` → Create event *(auth + admin only)*
-   **PUT** `/events/:eventId` → Update event *(auth + admin only)*
-   **DELETE** `/events/:eventId` → Delete event *(auth + admin only)*
-   **GET** `/analytics` → Fetch analytics *(auth + admin only)*

### 📊 Analytics (`/api/analytics`)

-   **GET** `/events` → Event statistics *(admin only)*
-   **GET** `/top-events` → Top booked events *(admin only)*

### 🏥 Health

-   **GET** `/health` → Liveness check
-   **GET** `/ready` → Readiness check (DB + Redis connectivity)

------------------------------------------------------------------------

## 📑 OpenAPI Spec

A minimal **OpenAPI 3.0 spec** is available at `openapi.yaml`.\
Use Swagger UI, Postman, or Redoc to explore.

------------------------------------------------------------------------

## 📊 How It Works

1.  User sends booking request → API validates & enqueues job in **Redis
    Queue (BullMQ)**.\
2.  Worker consumes jobs sequentially → Calls **BookingService**.\
3.  BookingService uses:
    -   **Redlock** (distributed lock) → Prevents overselling seats.
    -   **PostgreSQL transaction** → Ensures booking + seat update
        consistency.\
4.  Success/failure logged → Booking confirmed or rejected.

------------------------------------------------------------------------

## ☁️ Deployment

-   Easily deployable on **Render, Railway, or Heroku**.
-   Uses Docker for containerization.
-   Scale workers horizontally for high throughput.

------------------------------------------------------------------------

## 📌 Evaluation Highlights

-   **System Design**: Handles concurrency via queues + locks.\
-   **API Quality**: RESTful, validated, documented with OpenAPI.\
-   **Code Quality**: Modular services, logging, error handling.\
-   **Performance**: Queue + worker model scales under load.\
-   **Creativity**: Supports waitlists, seat-level booking, analytics.

------------------------------------------------------------------------

✨ Evently showcases how to design a **scalable, fault-tolerant event
booking backend** with correctness and performance in mind.
