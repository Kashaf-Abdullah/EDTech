# Entry Test Unlock Workflow - Implementation Summary

## Overview
Entry tests now use a **payment-approval unlock model** where students submit a purchase request, an admin reviews and approves it, and the student gains access after approval. This mirrors the existing course purchase workflow.

## Key Features Implemented

### 1. Student Entry Test Purchase Flow
- **Browse Tests**: Students see free vs paid entry tests with clear pricing
- **Submit Unlock Request**: Clicking "Unlock for PKR X" submits a payment request (pending status)
- **Notification**: Student receives a notification that their request is under review
- **Admin Approval**: Once admin approves, student gets immediate notification and access to all questions
- **Test Taking**: Students can only start a test if it's free OR they have an approved payment

### 2. Admin Review Panel
- **Pending Requests Tab**: Admins see all pending unlock requests with:
  - Student name and email
  - Test title and subject
  - Amount and status badge
  - Optional approval/rejection notes
- **Approve/Reject**: Admins can approve (granting access) or reject (with optional reason)
- **Notifications**: Admin receives notification when request is submitted, and confirmation when they approve/reject

### 3. Backend Endpoints

#### Student Operations
- `POST /entry-tests/:id/unlock` - Submit an unlock request
- `POST /entry-tests/:id/start` - Start a test (checks lock status)
- `POST /entry-tests/attempts/:attemptId/submit` - Submit answers
- `GET /entry-tests/attempts/my` - View my attempt history

#### Admin Operations
- `GET /entry-tests/admin/unlocks` - View pending unlock requests
- `PATCH /entry-tests/admin/unlocks/:id` - Review (approve/reject) a request

### 4. Notifications Sent

#### When Student Submits Unlock Request
- **To Student**: "Entry Test Unlock Request Submitted 🧾"
- **To Admin**: "New Entry Test Unlock Request 🔔"

#### When Admin Approves
- **To Student**: "Entry Test Unlocked ✅"
- **To Admin**: "Entry Test Unlock Approved ✅"

#### When Admin Rejects
- **To Student**: "Entry Test Unlock Rejected ❌"

### 5. Data Model Integration

**Payment Model Extended**:
- `entryTest`: Reference to the entry test (alongside existing `course` field)
- Uses existing payment lifecycle: pending → approved/rejected

**Test Access Logic**:
- Free tests (price ≤ 0): Always accessible to authenticated students
- Paid tests: Require approved payment entry in Payment collection with status='approved'

## Files Modified

### Backend
- `controllers/entryTestController.js`: Added unlock request, admin review, and test start validation
- `routes/entryTestRoutes.js`: Added new admin review endpoints
- `models/Payment.js`: Already had `entryTest` field (pre-existing)

### Frontend
- `pages/EntryTests.js`: Added unlock button with pending/approved state feedback
- `pages/admin/AdminEntryTests.js`: Added pending requests review panel
- `redux/slices/entryTestSlice.js`: Added unlock requests fetching and review actions

## Usage Flow

### For Students
1. Browse entry tests on `/entry-tests`
2. See free questions preview + price for full access
3. Click "Unlock for PKR X" to submit payment request
4. Wait for admin approval notification
5. Once approved, click "Start Test" to take the full test
6. View score and explanations after submission

### For Admins
1. Go to `/admin/entry-tests`
2. See "Pending Unlock Requests" section
3. Review student info, test title, and amount
4. Optionally add approval/rejection note
5. Click Approve or Reject
6. Student receives instant notification of the decision

## Key Behaviors

- **Free tests**: No payment/approval needed, students can start immediately
- **Paid tests**: New payment record created with `status: 'pending'`
- **Lock enforcement**: Backend validates approved payment exists before allowing test start
- **Admin notification**: First admin user (role: 'admin') is notified for all unlock requests
- **Attempt tracking**: All answers/scores recorded in EntryTestAttempt collection
- **Test stats**: Total attempts and average score updated per test
