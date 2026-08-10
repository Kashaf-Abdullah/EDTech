import React,{useState,useEffect} from 'react';
import {Link,useNavigate,useSearchParams} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {registerUser,clearError} from '../redux/slices/authSlice';
import './AuthPages.css';

export default function Register() {
  const dispatch=useDispatch(),navigate=useNavigate(),{loading,error,user}=useSelector(s=>s.auth);
  const [searchParams]=useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [f,setF]=useState({name:'',email:'',password:'',role:'student'});
  useEffect(()=>{ if(user) navigate(user.role==='tutor'?'/tutor/profile':'/dashboard'); },[user,navigate]);
  useEffect(()=>()=>dispatch(clearError()),[dispatch]);
  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-mark">E</span>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-sub">Join thousands learning and teaching on EduPak.</p>

        {refCode && (
          <div className="auth-alert auth-alert-success">🎉 You were invited by a friend — you'll both be connected.</div>
        )}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form onSubmit={e=>{e.preventDefault();dispatch(registerUser({...f,refCode}));}}>
          <label className="auth-label">Full name</label>
          <input type="text" className="auth-input" value={f.name} onChange={e=>setF({...f,name:e.target.value})} required />

          <label className="auth-label">Email</label>
          <input type="email" className="auth-input" value={f.email} onChange={e=>setF({...f,email:e.target.value})} required />

          <label className="auth-label">Password</label>
          <input type="password" className="auth-input" value={f.password} onChange={e=>setF({...f,password:e.target.value})} required minLength={6} />

          <label className="auth-label">I want to join as</label>
          <div className="auth-role-row">
            {['student','tutor'].map(r => (
              <button
                key={r}
                type="button"
                className={`auth-role-btn ${f.role===r ? 'active' : ''}`}
                onClick={() => setF({...f, role: r})}
              >
                {r === 'student' ? '🎓' : '👨‍🏫'} <span className="text-capitalize">{r}</span>
              </button>
            ))}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            Create account
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
