# SIPRS — Smart Internship & Placement Recommendation System

A full-stack MERN application that recommends internships to students based on their skills, interests, and CGPA using a scoring algorithm.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Axios, Context API |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Architecture | MVC (backend), App Router (frontend) |

---

## Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── recruiterController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT protect middleware
│   │   ├── role.js                # Role-based authorization
│   │   └── errorHandler.js        # Centralized error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── StudentProfile.js
│   │   ├── Internship.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── student.js
│   │   ├── recruiter.js
│   │   └── admin.js
│   ├── utils/
│   │   └── recommendationEngine.js  # Skill-based scoring
│   ├── app.js
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── layout.jsx
    │   ├── page.jsx               # Root redirect
    │   ├── globals.css
    │   ├── login/page.jsx
    │   ├── register/page.jsx
    │   ├── student/dashboard/page.jsx
    │   ├── recruiter/dashboard/page.jsx
    │   └── admin/dashboard/page.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   └── ProtectedRoute.jsx
    ├── context/
    │   └── AuthContext.jsx        # Auth state + JWT decode
    ├── services/
    │   ├── api.js                 # Axios instance
    │   └── index.js               # Domain services
    ├── middleware.js              # Next.js edge middleware
    ├── jsconfig.json              # Path aliases (@/*)
    ├── tailwind.config.js
    ├── next.config.js
    ├── .env.local.example
    └── package.json
```

---

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

---

## Setup & Run

### 1. Clone & Navigate

```bash
cd "e:/SEM 6/SGP 6/TRY 1"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# Edit .env and set MONGO_URI, JWT_SECRET

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## Environment Variables

### Backend `.env`

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/siprs_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Demo Login Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@siprs.dev | admin123 |
| Recruiter | recruiter@techcorp.com | recruiter123 |
| Student | charlie@college.edu | student123 |
| Student | diana@college.edu | student123 |

---

## API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register (student/recruiter) |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### Student (requires `Authorization: Bearer <token>` + role=student)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/student/profile` | Get own profile |
| PUT | `/api/student/profile` | Update profile |
| GET | `/api/student/recommendations` | Get scored recommendations |
| POST | `/api/student/apply/:internshipId` | Apply for internship |
| GET | `/api/student/applications` | Get all applications |

### Recruiter (role=recruiter)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/internship` | Create internship |
| GET | `/api/internship` | Get own internships |
| PUT | `/api/internship/:id` | Update internship |
| DELETE | `/api/internship/:id` | Delete internship |
| GET | `/api/internship/applicants/:id` | View applicants |
| PUT | `/api/internship/applicants/:appId/status` | Update applicant status |

### Admin (role=admin)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users (paginated) |
| DELETE | `/api/admin/users/:id` | Delete user |

---

## Recommendation Algorithm

```
matchScore = (matching skills / total required skills) × 100
           + min(interest overlaps × 5, 20)            [bonus]

Filters applied:
  ✓ Deadline not yet passed
  ✓ Student CGPA ≥ internship minCGPA
  ✓ Not already applied

Result: sorted by matchScore descending
```

---

## Features

- **Role-based auth** — student, recruiter, admin
- **JWT authentication** with auto-logout on expiry
- **Skill-based recommendation engine** with match scoring
- **Student dashboard** — profile management, recommendations, application tracker
- **Recruiter dashboard** — post/edit/delete internships, manage applicants, update status
- **Admin dashboard** — platform stats, user management
- **Protected routes** — client-side (`ProtectedRoute`) + edge (`middleware.js`)
- **Centralized error handling** — backend + frontend Axios interceptors
- **Clean Tailwind UI** — responsive, mobile-friendly

---

## Production Notes

- Change `JWT_SECRET` to a cryptographically secure random string
- Use MongoDB Atlas for production database
- Set `NODE_ENV=production`
- Add rate limiting (`express-rate-limit`) before deploying
- Add file upload service (Cloudinary/S3) for resume uploads
- Use HTTPS in production
