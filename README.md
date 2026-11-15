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
# Replace the placeholder values in .env
node server.js
```
For deployment, set `CLIENT_URL` to the frontend's origin (for example,
`https://your-app.vercel.app`). A trailing slash is removed automatically.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```
The frontend env file contains public API/socket URLs only. Never put passwords,
API keys, or other secrets in frontend environment variables; React embeds them
in the browser build.

### Seed Demo Data
Set `SEED_ADMIN_PASSWORD`, `SEED_TUTOR_PASSWORD`, and `SEED_STUDENT_PASSWORD`
in `backend/.env` to unique passwords of at least 12 characters before seeding.
All seed accounts in the same role use that role's configured password.
```bash
cd backend
node seed.js
```

## Seeded Login Emails
- Admin: `admin@edupak.com`
- Tutors: `ali@edupak.com`, `sara@edupak.com`, `usman@edupak.com`
- Students: `hamza@student.com`, `ayesha@student.com`

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
