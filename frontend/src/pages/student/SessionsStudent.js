import React,{useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {fetchSessions} from '../../redux/slices/enrollSlice';
import {Link} from 'react-router-dom';
const STATUS_COLORS={pending:'warning',confirmed:'success',completed:'secondary',cancelled:'danger',rescheduled:'info'};
export default function SessionsStudent() {
  const dispatch=useDispatch(),{sessions}=useSelector(s=>s.enroll);
  useEffect(()=>{ dispatch(fetchSessions()); },[dispatch]);
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h4>My Sessions</h4>
        <Link to="/tutors" className="btn btn-primary btn-sm">+ Book Session</Link>
      </div>
      {sessions.length===0
        ? <div className="text-center py-5 text-muted"><div className="fs-1 mb-2">📅</div><p>No sessions booked yet.</p><Link to="/tutors" className="btn btn-primary">Find a Tutor</Link></div>
        : <div className="row g-3">
          {sessions.map(s=>(
            <div key={s._id} className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <h6>{s.tutor?.name}</h6>
                    <span className={`badge bg-${STATUS_COLORS[s.status]||'secondary'}`}>{s.status}</span>
                  </div>
                  <p className="text-muted small mb-1">📅 {new Date(s.date).toLocaleString()}</p>
                  <p className="text-muted small mb-1">⏱ {s.duration} minutes</p>
                  {s.subject && <p className="text-muted small mb-1">📖 {s.subject}</p>}
                  {s.zoomLink && s.status==='confirmed' && <a href={s.zoomLink} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm mt-2">🎥 Join Zoom</a>}
                </div>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}
