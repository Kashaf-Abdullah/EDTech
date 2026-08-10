# EduPak — Full EdTech SaaS Platform

## Stack
- **Frontend**: React.js + Bootstrap 5 + Redux Toolkit
- **Backend**: Node.js + Express + MongoDB + JWT

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Seed Demo Data
```bash
cd backend
node seed.js
```

## Login Credentials (after seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edupak.com | admin123 |
| Tutor | ali@edupak.com | tutor123 |
| Tutor | sara@edupak.com | tutor123 |
| Tutor | usman@edupak.com | tutor123 |
| Student | hamza@student.com | student123 |
| Student | ayesha@student.com | student123 |

## Features
### Student
- Browse & search courses
- Enroll via bank transfer screenshot upload
- Video player + PDF viewer
- Progress tracking
- Reviews & ratings
- Certificates on completion
- Book 1-on-1 sessions

### Tutor
- Dashboard with stats
- Create & manage courses
- Upload video/PDF lessons
- Session management
- Earnings tracker

### Admin
- Full dashboard with revenue
- Approve/reject tutors
- Approve/reject courses
- Feature courses
- Review manual payments
- User management (ban/unban)
- Revenue reports

## API Routes
- /api/auth — register, login, google OAuth
- /api/courses — CRUD, lessons, publish
- /api/enrollments — check, get
- /api/payments — stripe, manual, admin review
- /api/progress — track, mark complete
- /api/reviews — add, edit, get
- /api/certificates — get, verify
- /api/sessions — book, manage
- /api/tutor — profile, stats
- /api/admin — full admin panel
