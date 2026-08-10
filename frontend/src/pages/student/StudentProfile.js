import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateMyProfile, logout } from '../../redux/slices/authSlice';

export default function StudentProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);
  const [name, setName] = useState(user?.name || '');
  const [pic, setPic] = useState(null);
  const [preview, setPreview] = useState(user?.profilePic || null);
  const [ok, setOk] = useState(false);
  const [copied, setCopied] = useState(false);

  const onPic = (e) => {
    const file = e.target.files[0];
    if (file) { setPic(file); setPreview(URL.createObjectURL(file)); }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    if (pic) fd.append('profilePic', pic);
    await dispatch(updateMyProfile(fd));
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  };

  const doLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  const inviteLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;
  const copyInvite = () => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2500); };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Hey! I'm learning on EduPak — join me here: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">My Profile</h4>
            <button className="btn btn-outline-danger btn-sm" onClick={doLogout}>🚪 Logout</button>
          </div>

          {/* Invite a friend */}
          <div className="card shadow-sm mb-4 border-success">
            <div className="card-body">
              <h6 className="mb-1">🎁 Invite a Friend</h6>
              <p className="text-muted small mb-2">Share your personal link — when friends sign up through it, they'll be linked to you.</p>
              <div className="input-group mb-2">
                <input type="text" className="form-control" value={inviteLink} readOnly />
                <button className="btn btn-success" onClick={copyInvite}>{copied ? '✅ Copied!' : 'Copy'}</button>
              </div>
              <button className="btn btn-outline-success btn-sm" onClick={shareWhatsApp}>📱 Share on WhatsApp</button>
            </div>
          </div>

          {ok && <div className="alert alert-success">Profile updated!</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <img
                  src={preview || 'https://placehold.co/100'}
                  width={100} height={100}
                  className="rounded-circle mb-2"
                  style={{ objectFit: 'cover' }}
                  alt=""
                />
                <div>
                  <label className="btn btn-sm btn-outline-secondary" htmlFor="pic">Change Photo</label>
                  <input id="pic" type="file" accept="image/*" className="d-none" onChange={onPic} />
                </div>
              </div>

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={user?.email || ''} disabled />
                  <small className="text-muted">Email cannot be changed</small>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
