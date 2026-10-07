# LIBRIXA — Smart Library Management System

> **Tagline:** Smart Library Management  
> **Platform:** Full-Stack Academic SaaS & Intelligent Campus Library Platform  
> **Author:** Shivanand K  

---

## 1. Project Overview

**LIBRIXA** is a modern, enterprise-grade Smart Library Management System engineered to digitize and streamline university library workflows. Designed as a SaaS solution rather than a conventional CRUD utility, LIBRIXA provides an intuitive, high-performance interface for students, researchers, and library administrators.

From real-time book discovery, automated checkouts, dynamic fine calculation, and waitlist reservations to circulation metrics and event scheduling, LIBRIXA delivers a cohesive academic experience.

---

## 2. Key Features

### 🎓 Student & Academic Experience
- **Split-Screen Authentication:** Modern JWT-based sign-in with quick-switch demo profiles, student registration by department, and simulated password resets.
- **Smart Dashboard:** Live account status, 4 KPI cards (Books Borrowed, Currently Reading, Due This Week, Outstanding Fines), reading progress tracking with reader notes, upcoming return reminders, and monthly circulation analytics.
- **Catalog Search & Filtering:** Instant keyword query across Title, Author, ISBN, and Category slugs with multi-category filter pills and sorting (Popularity, Recent, Title A-Z).
- **14-Day Automated Circulation:** One-click book borrowing with automated loan calculations and instantaneous inventory decrement.
- **Dynamic Fine Engine:** Real-time overdue detection calculating late fees at ₹5 per overdue day with simulated digital fine settlement and receipt ledger.
- **Reservation Waitlist Queue:** Waitlist placement for unavailable resources with live queue ranking (`#1 in Queue`) and automated availability notices.
- **Academic Calendar (October 2026):** Unified view highlighting personal book due dates, orientation tours, workshops, and campus book fairs.
- **Real-Time Notification Hub:** Dynamic alerts for checkouts, returns, waitlist advancements, and general campus library news.
- **Profile & Credential Management:** Student ID and department updates with digital library barcode card simulation.
- **Settings & Preferences:** Customizable notifications, display density, and security toggles.

### 📚 Administration & Librarian Command Center
- **Executive Metrics:** Real-time summary of Total Books, Available Copies, Active Loans, Overdue Items, Registered Students, and Ledger Fines.
- **Inventory Management:** Full CRUD catalog management (Add Title, Update Copies, Edit Metadata, Delete).
- **Circulation Ledger:** Comprehensive university-wide loan ledger with one-click return verification ("Check In") and loan extension ("+14 Days").

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Bundler:** Vite 6
- **Routing:** React Router v6
- **Styling:** Custom CSS3 Design System (Indigo `#4F46E5`, Navy `#0F172A`, Slate backgrounds, 8px spatial grid)
- **Icons:** Lucide React
- **Typography:** Plus Jakarta Sans & JetBrains Mono

### Backend
- **Runtime:** Node.js (v22+)
- **Server:** Express.js + TypeScript (`tsx`)
- **Database:** SQLite with native high-performance engine (`DatabaseSync`)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **Middleware:** CORS, custom authentication guard, role-based authorization, centralized error handler

---

## 4. Application Architecture

```
                  React Frontend (Port 5173)
                             │
                  REST API Client (Axios / Fetch)
                             │
                             ▼
                 Express Backend (Port 5000)
                             │
      ┌──────────────────────┼──────────────────────┐
      ▼                      ▼                      ▼
 Auth Middleware       Route Handlers        Business Logic
 (JWT & bcryptjs)   (Books, Borrowings,   (Fines, Queue, Stats)
                     Reservations, Admin)
                             │
                             ▼
                 SQLite Database Engine
                  (backend/database/librixa.db)
```

---

## 5. Database Design

```sql
users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT UNIQUE, student_id TEXT,
  department TEXT, password_hash TEXT,
  role TEXT ('student', 'librarian', 'admin'), created_at TEXT
);

categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE, slug TEXT UNIQUE, description TEXT
);

books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT, author TEXT, isbn TEXT UNIQUE, category_id INTEGER,
  publisher TEXT, publication_year INTEGER, pages INTEGER,
  language TEXT, description TEXT, total_copies INTEGER,
  available_copies INTEGER, rating REAL, cover_url TEXT, created_at TEXT
);

borrowings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, book_id INTEGER,
  borrowed_at TEXT, due_at TEXT, returned_at TEXT,
  status TEXT ('borrowed', 'returned', 'overdue'), fine_amount REAL
);

reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, book_id INTEGER,
  reserved_at TEXT, status TEXT ('active', 'fulfilled', 'cancelled')
);

fines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, borrowing_id INTEGER,
  amount REAL, status TEXT ('pending', 'paid'), created_at TEXT, paid_at TEXT
);

notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, title TEXT, message TEXT, is_read INTEGER, created_at TEXT
);

library_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT, description TEXT, event_date TEXT, location TEXT, category TEXT
);
```

---

## 6. REST API Documentation

### Health Check
- `GET /api/health` — System status and build metadata

### Authentication
- `POST /api/auth/register` — Create student library account
- `POST /api/auth/login` — Sign in and issue JWT
- `GET /api/auth/me` — Retrieve active authenticated session
- `POST /api/auth/logout` — Terminate session
- `POST /api/auth/forgot-password` — Password reset link simulation

### Catalog & Categories
- `GET /api/books` — Search books (`?search=`, `?category=`, `?sort=`)
- `GET /api/books/:id` — Single book details and copy availability
- `GET /api/books/categories` — Categories with catalog volume count
- `POST /api/books` — [Admin] Create new catalog record
- `PATCH /api/books/:id` — [Admin] Update book details
- `DELETE /api/books/:id` — [Admin] Remove catalog book

### Circulation & Borrowing
- `GET /api/borrowings/my` — Current user's active and past loans
- `POST /api/borrowings` — Borrow available book (14-day loan)
- `PATCH /api/borrowings/:id/return` — Check in book and calculate late fee
- `PATCH /api/borrowings/:id/renew` — Extend loan deadline (+14 days)

### Reservations
- `GET /api/reservations/my` — Current user's waitlist requests
- `POST /api/reservations` — Place waitlist reservation
- `DELETE /api/reservations/:id` — Cancel waitlist request

### Fines Ledger
- `GET /api/fines/my` — User fine summary (Outstanding, Paid, Total)
- `POST /api/fines/:id/pay` — Digital settlement simulation

### Notification Center
- `GET /api/notifications` — Retrieve all user notifications
- `PATCH /api/notifications/:id/read` — Mark single notification read
- `PATCH /api/notifications/read-all` — Mark all notifications read

### Profile & Calendar
- `GET /api/profile` — Student profile and statistics
- `PATCH /api/profile` — Update name, department, student ID
- `GET /api/dashboard` — Dashboard metrics and reading items
- `GET /api/calendar` — October 2026 events and user due dates

### Staff & Administration
- `GET /api/admin/dashboard` — Library-wide operational metrics
- `GET /api/admin/books` — Full catalog inventory
- `GET /api/admin/borrowings` — Circulation records with student details
- `PATCH /api/admin/borrowings/:id/return` — Librarian check-in
- `PATCH /api/admin/borrowings/:id/extend` — Staff deadline extension

---

## 7. Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Student (Demo)** | `student@librixa.edu` | `student123` |
| **Librarian / Staff** | `librarian@librixa.edu` | `library123` |
| **System Admin** | `admin@librixa.edu` | `admin123` |

*Note: Quick-login shortcuts are available on the login page for instantaneous evaluation.*

---

## 8. Installation & Setup

### Prerequisites
- Node.js (v20+ or v22+)
- npm (v9+)

### Installation
```bash
# Clone or navigate to the project directory
cd Librixa

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Database Seeding
Populate the SQLite database with 22+ books, 10 categories, 6 users, borrowings, waitlists, fines, notifications, and events:
```bash
cd backend
npm run seed
```

---

## 9. Running the Application

### Development Servers

**1. Start Backend Server:**
```bash
cd backend
npm run dev
# Server runs at: http://localhost:5000
```

**2. Start Frontend Server:**
```bash
cd frontend
npm run dev
# Application runs at: http://localhost:5173
```

---

## 10. Screenshots

*Placeholder for live application UI screenshots:*
- **Login Screen:** Split-screen academic hero and sign-in credentials.
- **Main Dashboard:** 4 KPI stat cards, reading progress bars, and loan chart.
- **Book Catalog:** Instant search, category filters, and 14-day borrow flow.
- **Circulation Ledger:** My Borrowed Books table with renew and return actions.
- **Librarian Dashboard:** Administration metrics and inventory manager.

---

## 11. Future Improvements
- RFID and Barcode hardware scanner integration.
- Automated email and SMS webhooks via Twilio and SendGrid.
- AI-powered personalized textbook recommendation engine based on department syllabus.
- Digital PDF and ePub full-text reader with in-app annotations.

---

© 2026 LIBRIXA Campus Systems. All rights reserved.
