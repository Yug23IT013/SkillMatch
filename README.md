# SkillMatch – Intelligent Internship & Placement Recommendation System

An AI-powered platform that matches students with internships and full-time roles using a hybrid recommendation engine combining content-based filtering and machine learning.

---

## Project Structure

```
skillmatch/
├── backend/          # Node.js + Express + MongoDB API
├── frontend/         # Next.js 14 + Tailwind CSS
└── ml-service/       # Python FastAPI + scikit-learn ML Service
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| Python | 3.9+ |
| MongoDB | Local or Atlas |
| npm | v9+ |

---

## Setup & Running

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with your values
npm run dev            # Runs on http://localhost:5000
```

---

### 2. ML Service

```bash
cd ml-service
pip install -r requirements.txt
cp .env.example .env   # set BACKEND_URL if needed
python app.py          # Runs on http://localhost:8000
```

**Train/retrain the ML model:**
```bash
curl -X POST http://localhost:8000/train
```

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # Runs on http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillmatch
JWT_SECRET=<64-char random hex>
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development

# Email (Nodemailer — Gmail App Password recommended)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here

# Used in email links
FRONTEND_URL=http://localhost:3000
```

### ML Service (`ml-service/.env`)

```env
BACKEND_URL=http://localhost:5000
# ML_ALLOW_ORIGINS=http://localhost:5000,http://localhost:3000
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register           Register new user (rate-limited)
POST   /api/auth/login              Login (rate-limited)
GET    /api/auth/me                 Get current authenticated user
PUT    /api/auth/change-password    Change password (rate-limited)
```

### Student
```
GET    /api/student/profile         Get student profile
PUT    /api/student/profile         Update profile (validated)
POST   /api/student/resume          Upload resume PDF (multipart)
POST   /api/student/parse-resume    Parse resume via ML & return extracted data
POST   /api/student/skills          Add a skill
DELETE /api/student/skills          Remove a skill
GET    /api/student/bookmarks       Get bookmarked jobs
POST   /api/student/bookmarks/:jobId  Toggle job bookmark
GET    /api/student/dashboard       Get dashboard stats
GET    /api/student/:id             Get student by ID
```

### Jobs
```
GET    /api/jobs                    List all active jobs (with filters)
GET    /api/jobs/my-jobs            Get recruiter's own jobs
GET    /api/jobs/:id                Get job details
POST   /api/jobs                    Create job (recruiter/admin)
PUT    /api/jobs/:id                Update job (recruiter/admin)
DELETE /api/jobs/:id                Deactivate job (recruiter/admin)
GET    /api/jobs/:id/applicants     Get applicants for a job (recruiter/admin)
```

### Recommendations
```
GET    /api/recommendations/ml              ML-powered recommendations for logged-in student
GET    /api/recommendations/missing-skills  Skill gap analysis
GET    /api/recommendations/market-skills   Most in-demand skills on the platform
GET    /api/recommendations/from-resume     Recommendations based on parsed resume
GET    /api/recommendations/:studentId      Content-based recommendations for a student
```

### Applications
```
POST   /api/applications/apply           Apply for a job (student)
GET    /api/applications/my              Get my applications (student)
GET    /api/applications/:id             Get application by ID
PUT    /api/applications/:id/status      Update application status (recruiter/admin)
DELETE /api/applications/:id/withdraw    Withdraw application (student)
```

### Admin
```
GET    /api/admin/analytics          Platform analytics & statistics
GET    /api/admin/users              List all users
PUT    /api/admin/users/:id/toggle   Toggle user active status
DELETE /api/admin/users/:id          Delete a user
```

### ML Service (Port 8000)
```
GET    /health          Service health check & model status
POST   /recommend       Get ranked job recommendations
POST   /train           Train / retrain the ML model
POST   /parse-resume    Parse PDF resume → skills, projects, education
```

---

## Features

### Student
- Profile management (skills, CGPA, domain & location preferences)
- Resume upload & **AI-powered resume parsing** (extracts skills, projects, education from PDF)
- Personalized job & internship recommendations with match score breakdown
- Skill gap analysis with missing skill suggestions
- Market skill trends
- Job bookmarking (save/unsave jobs)
- Application tracking (apply, view status, withdraw)

### Recruiter
- Post, edit, and deactivate job listings
- View all applicants per job
- Update application statuses

### Admin
- Analytics dashboard (placement stats, active users, top skills)
- User management (view, toggle active, delete)

### ML Engine
- **Hybrid recommendations**: Content-based cosine similarity + Gradient Boosting Classifier
- Match score breakdown:
  - Skill similarity (cosine): up to **60%**
  - CGPA qualification: up to **15%**
  - Domain preference: up to **15%**
  - Location preference: up to **10%**
- Missing skill suggestions
- Resume-based recommendations

### Security
- JWT authentication with role-based authorization (`student`, `recruiter`, `admin`)
- **Rate limiting** on all auth routes (5 attempts / 15 min)
- Input validation via `express-validator` on all mutating endpoints
- All secrets managed via environment variables — no hardcoded credentials
- Email notifications via Nodemailer (configurable SMTP)

---

## Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | Next.js 14, Tailwind CSS, Chart.js            |
| Backend     | Node.js, Express.js, MongoDB, Mongoose        |
| ML Service  | Python, FastAPI, scikit-learn, pdfplumber     |
| Auth        | JWT (JSON Web Tokens), bcryptjs               |
| File Upload | Multer                                        |
| Email       | Nodemailer                                    |
| Rate Limit  | express-rate-limit                            |
| Validation  | express-validator                             |
| ML Models   | Gradient Boosting, Random Forest              |

---

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a Pull Request

---
