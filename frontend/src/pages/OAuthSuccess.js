import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import API from '../utils/api';
export default function OAuthSuccess() {
  const navigate = useNavigate(), dispatch = useDispatch();
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('token', token);
      API.get('/auth/me').then(r => {
        dispatch(setCredentials({ token, user: r.data.user }));
        const role = r.data.user.role;
        navigate(role==='admin'?'/admin':role==='tutor'?'/tutor/dashboard':'/dashboard');
      }).catch(()=>navigate('/login'));
    } else navigate('/login');
  }, []);
  return <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}><div className="text-center"><div className="spinner-border text-primary mb-3"/><p>Signing in...</p></div></div>;
}
