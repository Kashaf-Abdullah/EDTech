import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './redux/slices/authSlice';
import PublicNavbar from './components/layout/PublicNavbar';
import AppLayout from './components/layout/AppLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthSuccess from './pages/OAuthSuccess';
import Chat from './pages/Chat';
import Community from './pages/Community';
import CertificateView from './pages/CertificateView';
import CourseBrowse from './pages/CourseBrowse';
import CourseDetail from './pages/CourseDetail';
import Checkout from './pages/student/Checkout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import MyCourses from './pages/student/MyCourses';
import LearnCourse from './pages/student/LearnCourse';
import Certificates from './pages/student/Certificates';
import SessionsStudent from './pages/student/SessionsStudent';
import EntryTests from './pages/EntryTests';
import TutorList from './pages/TutorList';
import TutorPublicProfile from './pages/TutorPublicProfile';
import TutorDashboard from './pages/tutor/TutorDashboard';
import TutorProfile from './pages/tutor/TutorProfile';
import CreateCourse from './pages/tutor/CreateCourse';
import ManageCourse from './pages/tutor/ManageCourse';
import TutorSessions from './pages/tutor/TutorSessions';
import TutorEarnings from './pages/tutor/TutorEarnings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTutors from './pages/admin/AdminTutors';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminSettings from './pages/admin/AdminSettings';
import AdminEntryTests from './pages/admin/AdminEntryTests';

// Wraps protected pages in the sidebar+topbar app shell, and enforces role access.
const Guard = ({ children, roles }) => {
  const { user, token } = useSelector(s => s.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const AnyLoggedInGuard = ({ children }) => {
  const { user, token } = useSelector(s => s.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
};

// Public pages (marketing/auth/browse) get the simple top navbar, not the sidebar shell.
const PublicPage = ({ children }) => (
  <>
    <PublicNavbar />
    {children}
  </>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage><Home /></PublicPage>} />
      <Route path="/login" element={<PublicPage><Login /></PublicPage>} />
      <Route path="/register" element={<PublicPage><Register /></PublicPage>} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/courses" element={<PublicPage><CourseBrowse /></PublicPage>} />
      <Route path="/courses/:id" element={<PublicPage><CourseDetail /></PublicPage>} />
      <Route path="/tutors" element={<PublicPage><TutorList /></PublicPage>} />
      <Route path="/tutors/:id" element={<PublicPage><TutorPublicProfile /></PublicPage>} />
      <Route path="/certificates/:certId" element={<CertificateView />} />

      <Route path="/chat" element={<AnyLoggedInGuard><Chat /></AnyLoggedInGuard>} />
      <Route path="/community" element={<AnyLoggedInGuard><Community /></AnyLoggedInGuard>} />

      <Route path="/checkout/:id" element={<Guard roles={['student']}><Checkout /></Guard>} />
      <Route path="/dashboard" element={<Guard roles={['student']}><StudentDashboard /></Guard>} />
      <Route path="/profile" element={<Guard roles={['student']}><StudentProfile /></Guard>} />
      <Route path="/my-courses" element={<Guard roles={['student']}><MyCourses /></Guard>} />
      <Route path="/learn/:id" element={<Guard roles={['student']}><LearnCourse /></Guard>} />
      <Route path="/certificates" element={<Guard roles={['student']}><Certificates /></Guard>} />
      <Route path="/sessions" element={<Guard roles={['student']}><SessionsStudent /></Guard>} />
      <Route path="/entry-tests" element={<Guard roles={['student']}><EntryTests /></Guard>} />

      <Route path="/tutor/dashboard" element={<Guard roles={['tutor']}><TutorDashboard /></Guard>} />
      <Route path="/tutor/profile" element={<Guard roles={['tutor']}><TutorProfile /></Guard>} />
      <Route path="/tutor/courses/create" element={<Guard roles={['tutor']}><CreateCourse /></Guard>} />
      <Route path="/tutor/courses/:id" element={<Guard roles={['tutor']}><ManageCourse /></Guard>} />
      <Route path="/tutor/sessions" element={<Guard roles={['tutor']}><TutorSessions /></Guard>} />
      <Route path="/tutor/earnings" element={<Guard roles={['tutor']}><TutorEarnings /></Guard>} />

      <Route path="/admin" element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
      <Route path="/admin/tutors" element={<Guard roles={['admin']}><AdminTutors /></Guard>} />
      <Route path="/admin/courses" element={<Guard roles={['admin']}><AdminCourses /></Guard>} />
      <Route path="/admin/users" element={<Guard roles={['admin']}><AdminUsers /></Guard>} />
      <Route path="/admin/payments" element={<Guard roles={['admin']}><AdminPayments /></Guard>} />
      <Route path="/admin/revenue" element={<Guard roles={['admin']}><AdminRevenue /></Guard>} />
      <Route path="/admin/settings" element={<Guard roles={['admin']}><AdminSettings /></Guard>} />
      <Route path="/admin/entry-tests" element={<Guard roles={['admin']}><AdminEntryTests /></Guard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);
  useEffect(() => { if (token) dispatch(fetchMe()); }, [dispatch, token]);
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
