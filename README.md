# ☁️ Cloud-Assignment Submission-Portal

> A production-grade, cloud-hosted web application for students to submit assignments and for faculty to grade and deliver feedback — demonstrating 25 cloud computing concepts in a real, deployable system.

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF.svg)](/.github/workflows/ci-cd.yml)

---

## 📋 Overview

A **Cloud-Assignment Submission-Portal** is a full-stack web application that eliminates paper-based submission workflows by providing:

- A **React** single-page application served via a global CDN
- A **Python Flask REST API** deployed on cloud infrastructure
- **Role-based access control** (Student / Teacher / Admin)
- **Cloud object storage** for assignment files (PDF, DOCX, etc.)
- **Cloud database** for structured metadata (assignments, submissions, grades)
- **JWT authentication** with secure session management
- **Automated deadline enforcement** using server-side UTC timestamps
- **Real-time grade and feedback visibility** for students

---

## 🎯 Problem Statement

Traditional assignment submission systems rely on:
- Physical paper collection (lost papers, no audit trail)
- Email-based submission (inbox overload, no versioning)
- USB drives (malware risk, manual tracking)
- Single-server portals (downtime at deadline peaks, no scalability)

This portal replaces all of that with a **cloud-native architecture** that is available 24/7, scales automatically, and maintains a complete audit trail.

---

## ✅ Features

### Student Features
- 📝 Register and login with secure bcrypt password hashing
- 📋 View all assignments with status (Not Submitted / Submitted / Late / Graded)
- 📤 Upload assignment files (PDF, DOCX, TXT, ZIP)
- 🔄 Resubmit before or after deadline (configurable)
- ⬇️ Download previously submitted files
- 📊 View marks and teacher feedback
- 📅 Track upcoming deadlines on dashboard

### Teacher Features
- 📚 Create and manage courses
- ✏️ Create assignments with deadlines, max marks, and file restrictions
- 👁️ View all student submissions per assignment
- ⬇️ Download any student's submitted file
- 🎓 Grade submissions with marks and written feedback
- 📈 Dashboard with submission statistics and pending reviews

---

## 👥 User Roles

| Permission | Student | Teacher | Admin |
|-----------|---------|---------|-------|
| Register | ✅ | ✅ | ✅ |
| View assignments | ✅ | ✅ | ✅ |
| Submit file | ✅ | ❌ | ❌ |
| View own submissions | ✅ | ❌ | ❌ |
| Create assignment | ❌ | ✅ | ✅ |
| View all submissions | ❌ | ✅ (own only) | ✅ |
| Grade submission | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## ☁️ Cloud Computing Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| **Cloud Computing** | App runs on Render/Railway (cloud PaaS) |
| **SaaS** | Portal accessible via browser URL, nothing to install |
| **PaaS** | Render handles OS, runtime, and scaling |
| **Cloud Database** | Supabase PostgreSQL for structured metadata |
| **Object Storage** | Supabase Storage for binary assignment files |
| **Authentication** | JWT tokens via Flask-JWT-Extended + bcrypt |
| **Authorization** | Role-based access with `@require_role` decorators |
| **RBAC** | 3-tier role system: student / teacher / admin |
| **REST API** | 15+ endpoints with standard HTTP methods |
| **Client-Server** | React frontend + Flask backend (fully decoupled) |
| **CDN** | Frontend deployed on Vercel (global edge network) |
| **CI/CD** | GitHub Actions auto-tests and deploys on push |
| **Scalability** | Stateless API can run multiple replicas |
| **Environment Variables** | All secrets loaded from `.env`, never hardcoded |
| **Secrets Management** | Render/Railway dashboard injects secrets at runtime |
| **Logging** | Python `logging` module with structured log format |
| **Monitoring** | `/health` endpoint + cloud provider dashboards |
| **Backup** | Supabase automatic daily PostgreSQL backups |
| **API Gateway** | Flask URL router (local) / AWS API Gateway (advanced) |
| **Serverless** | Each route is stateless (serverless-ready with Mangum) |
| **Elasticity** | Cloud auto-scaling at submission deadline peaks |
| **Availability** | 99.9%+ SLA from managed cloud providers |
| **Load Balancing** | Multiple Render instances behind load balancer |
| **Encryption in transit** | HTTPS enforced on all cloud endpoints |
| **Encryption at rest** | Supabase encrypts database and storage |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│              Students  |  Teachers  |  Admin                │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│               CDN (Vercel / Netlify)                        │
│           React Single-Page Application                     │
└──────────────────────┬──────────────────────────────────────┘
                       │  REST API (HTTPS)
┌──────────────────────▼──────────────────────────────────────┐
│          Backend (Render / Railway / AWS)                   │
│               Python Flask REST API                         │
│     Auth ─── Assignments ─── Submissions ─── Dashboard      │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
┌──────────────▼───────┐  ┌───────────▼───────────────────────┐
│  Cloud Database      │  │  Cloud Object Storage             │
│  Supabase PostgreSQL │  │  Supabase Storage / S3            │
│  (metadata, grades)  │  │  (PDF, DOCX files)                │
└──────────────────────┘  └───────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────────┐
│           Logging / Monitoring / CI/CD                       │
│   GitHub Actions ─── Render Dashboard ─── Health Endpoint   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | User interface |
| Routing | React Router v6 | Client-side navigation |
| HTTP Client | Axios | API communication |
| Backend | Python Flask 3.0 | REST API server |
| Auth | Flask-JWT-Extended | JWT token management |
| Password | bcrypt | Secure password hashing |
| ORM | SQLAlchemy 2.0 | Database abstraction |
| Database | SQLite (local) / Supabase PostgreSQL | Metadata storage |
| Storage | Local filesystem / Supabase Storage | File storage |
| CORS | Flask-CORS | Cross-origin requests |
| Hosting (FE) | Vercel (free) | React deployment |
| Hosting (BE) | Render (free) | Flask deployment |
| CI/CD | GitHub Actions | Automated testing and deployment |

---

## 🗄️ Database Design

### Entity Relationship

```
User (teacher)
  ↓ teacher_id
Course
  ↓ course_id
Assignment
  ↓ assignment_id
Submission ←── User (student)
  student_id
```

### Tables

**users** — `user_id | name | email | password_hash | role | enrollment_number | created_at`

**courses** — `course_id | course_name | course_code | description | teacher_id | created_at`

**assignments** — `assignment_id | course_id | title | description | deadline | max_marks | allowed_extensions | created_by | allow_resubmission | created_at`

**submissions** — `submission_id | assignment_id | student_id | file_name | storage_path | file_url | submission_status | submitted_at | marks | feedback | graded_by | graded_at | attempt_number`

---

## 📁 Folder Structure

```
Cloud-Assignment-Submission-Portal/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   │   ├── database.py
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── assignment.py
│   │   └── submission.py
│   │
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── course_routes.py
│   │   ├── assignment_routes.py
│   │   ├── submission_routes.py
│   │   └── grading_routes.py
│   │
│   ├── schemas/
│   ├── services/
│   │   ├── auth_dependency.py
│   │   └── security_service.py
│   │
│   ├── utils/
│   ├── app.py
│   └── requirements.txt
│
├── cloud/
│   ├── auth_service.py
│   ├── database_service.py
│   └── storage_service.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── tests/
│   └── test_api_smoke.py
│
├── sample_files/
├── screenshots/
├── docs/
├── reports/
│
├── migrate_database.py
├── .env.example
├── .gitignore
└── README.md

```
---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

### Step 1 — Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/Cloud-Based-Assignment-Submission-Portal.git
cd Cloud-Based-Assignment-Submission-Portal
```

### Step 2 — Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env if needed (defaults work for local development)

# Start backend server (auto-seeds demo data on first run)
python app.py
```
Backend starts at: `http://localhost:5000`

### Step 3 — Frontend setup
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000

# Start frontend
npm start
```
Frontend starts at: `http://localhost:3000`

### Step 4 — Access the portal
Open `http://localhost:3000` in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|---------|
| Teacher | priya.sharma@portal.edu | Teacher@123 |
| Teacher | amit.verma@portal.edu | Teacher@123 |
| Student | ayush.kumar@student.edu | Student@123 |
| Student | sneha.patel@student.edu | Student@123 |
| Student | rohit.gupta@student.edu | Student@123 |
| Admin | admin@portal.edu | Admin@123456 |

---

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment (`development`/`production`) | `development` |
| `SECRET_KEY` | Flask secret key | Change in production |
| `JWT_SECRET_KEY` | JWT signing key | Change in production |
| `DATABASE_URL` | Database connection string | SQLite local |
| `STORAGE_TYPE` | `local` or `supabase` | `local` |
| `SUPABASE_URL` | Supabase project URL | — |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | — |
| `STORAGE_BUCKET` | Supabase storage bucket name | `assignment-files` |
| `MAX_FILE_SIZE_MB` | Maximum upload size | `10` |
| `ALLOWED_EXTENSIONS` | Comma-separated extensions | `pdf,docx,doc,txt,zip` |
| `ALLOW_LATE_SUBMISSIONS` | Allow submissions after deadline | `True` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## 🧪 Running Tests

```bash
# From repository root
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run all tests with verbose output
python -m pytest ../tests/ -v
python -m pip install -r backend\requirements.txt
python -m pip install -r backend\requirements.txt

# Run specific test file
python -m pytest ../tests/test_auth.py -v

# Run with coverage report
python -m pytest ../tests/ --cov=. --cov-report=html

# Start the backend
# From the project root:
python -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000

# Install frontend dependencies
# Open another terminal:
cd frontend
npm install
npm run dev
```

## 🔄 Main Application Workflow
 ## Teacher Workflow
Register
   ↓
Login
   ↓
Teacher Dashboard
   ↓
Create Course
   ↓
Create Assignment
   ↓
Configure Deadline / Marks / File Rules
   ↓
Wait for Student Submission
   ↓
Review Submission
   ↓
Download File
   ↓
Enter Marks + Feedback
   ↓
Submit Grade

## Student Workflow
Register
   ↓
Login
   ↓
Student Dashboard
   ↓
View Assignments
   ↓
Open Assignment
   ↓
Upload File
   ↓
Submission Created
   ↓
Resubmit if Required
   ↓
Version History
   ↓
Teacher Grades
   ↓
View Marks + Feedback
---

## ☁️ Cloud Deployment

### Approach A — Free Tier (Recommended for Students)

1. **Backend → Render.com**
   - Create account at render.com
   - New Web Service → Connect GitHub repo
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - Add environment variables from `.env.example`

2. **Frontend → Vercel.com**
   - Create account at vercel.com
   - Import GitHub repo
   - Framework: Create React App
   - Root directory: `frontend`
   - Set `REACT_APP_API_URL` to your Render backend URL

3. **Database + Storage → Supabase.com**
   - Create project at supabase.com
   - Copy connection string to `DATABASE_URL`
   - Create storage bucket named `assignment-files`
   - Set `STORAGE_TYPE=supabase`

### Approach B — AWS Architecture
- Frontend: S3 + CloudFront
- Backend: AWS App Runner / ECS
- API: AWS API Gateway
- Database: RDS PostgreSQL
- Storage: S3 bucket
- Auth: AWS Cognito
- Monitoring: CloudWatch

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (never stored in plain text)
- **JWT tokens** with configurable expiry
- **Role-based access control** on every API endpoint
- **File type validation** (server-side, not just client-side)
- **File size limits** enforced by Flask
- **Signed URLs** for private file access (Supabase)
- **CORS** configured to allow only the frontend origin
- All secrets in **environment variables** (never in source code)
- **Path traversal protection** on local file serving
- Input sanitization and validation on all endpoints

---

## 📈 Scalability

| Scale | Architecture |
|-------|-------------|
| 10 students | Single Flask instance, SQLite |
| 1,000 students | PostgreSQL, multiple Flask replicas |
| 100,000 students | Auto-scaling, CDN, caching, message queues |

---

## ⚠️ Limitations

- No real-time notifications (polling only)
- No plagiarism detection integration
- No email notification system
- Supabase free tier pauses after 1 week of inactivity
- Render free tier spins down after 15 min of inactivity

---

## 🔮 Future Improvements

- Email notifications for submissions and grades
- Plagiarism detection via Turnitin API integration
- Real-time updates with WebSockets
- Mobile app (React Native)
- Analytics dashboard with charts
- Bulk grading with CSV export
- Assignment rubric system
- Video feedback support

---

## 📚 Learning Outcomes

This project demonstrates:
1. Full-stack cloud application development
2. REST API design and implementation
3. JWT authentication and authorization
4. Role-based access control patterns
5. Cloud database design and ORM usage
6. Cloud object storage integration
7. CI/CD pipeline with GitHub Actions
8. Environment variable management for secrets
9. React frontend with protected routes
10. Production deployment on free-tier cloud services

---

## 👤 Author

**Ayush Kumar Dubey**
Cloud Computing Course Project
B.Tech Computer Science

GitHub: [github.com/ayushkrdubey-23](https://github.com/ayushkrdubey-23)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
