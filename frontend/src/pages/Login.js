import React,{useState,useEffect} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {loginUser,clearError} from '../redux/slices/authSlice';
import './AuthPages.css';

export default function Login() {
  const dispatch=useDispatch(),navigate=useNavigate(),{loading,error,user}=useSelector(s=>s.auth);
  const [f,setF]=useState({email:'',password:''});
  useEffect(()=>{ if(user) navigate(user.role==='admin'?'/admin':user.role==='tutor'?'/tutor/dashboard':'/dashboard'); },[user,navigate]);
  useEffect(()=>()=>dispatch(clearError()),[dispatch]);
  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-mark">E</span>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Log in to keep learning where you left off.</p>

        {error && (
          <div className="auth-alert auth-alert-error">
            {error}
            <button className="auth-alert-close" onClick={()=>dispatch(clearError())}>✕</button>
          </div>
        )}

        <form onSubmit={e=>{e.preventDefault();dispatch(loginUser(f));}}>
          <label className="auth-label">Email</label>
          <input type="email" className="auth-input" value={f.email} onChange={e=>setF({...f,email:e.target.value})} required />

          <label className="auth-label">Password</label>
          <input type="password" className="auth-input" value={f.password} onChange={e=>setF({...f,password:e.target.value})} required />

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            Log in
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <a href="/api/auth/google" className="auth-google-btn">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9A8.8 8.8 0 0 0 17.64 9.2z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26A5.4 5.4 0 0 1 9 14.5c-2.3 0-4.27-1.55-4.96-3.64H1.06v2.32A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M4.04 10.86A5.4 5.4 0 0 1 3.75 9c0-.65.11-1.28.3-1.86V4.82H1.06A9 9 0 0 0 0 9c0 1.45.35 2.83 1.06 4.18l2.98-2.32z"/><path fill="#EA4335" d="M9 3.5c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 1.06 4.82l2.98 2.32C4.73 5.05 6.7 3.5 9 3.5z"/></svg>
          Continue with Google
        </a>

        <p className="auth-footer">New to EduPak? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
