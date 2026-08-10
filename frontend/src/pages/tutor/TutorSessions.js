import React,{useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {fetchTutorSessions,updateSession} from '../../redux/slices/tutorSlice';
const SC={pending:'warning',confirmed:'success',completed:'secondary',cancelled:'danger'};
export default function TutorSessions() {
  const dispatch=useDispatch(),{sessions}=useSelector(s=>s.tutor);
  useEffect(()=>{ dispatch(fetchTutorSessions()); },[dispatch]);
  const upd=(id,data)=>dispatch(updateSession({id,data}));
  return (
    <div className="container py-4">
      <h4 className="mb-4">Session Requests</h4>
      {sessions.length===0?<div className="text-center py-5 text-muted"><div className="fs-1">📅</div><p>No session requests yet.</p></div>
      :<div className="row g-3">{sessions.map(s=>(
        <div key={s._id} className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <div><strong>{s.student?.name}</strong><p className="text-muted small mb-0">{s.student?.email}</p></div>
                <span className={`badge bg-${SC[s.status]}`}>{s.status}</span>
              </div>
              <p className="small mb-1">📅 {new Date(s.date).toLocaleString()}</p>
              <p className="small mb-1">⏱ {s.duration} min | 📖 {s.subject}</p>
              {s.price>0&&<p className="small mb-2">💰 PKR {s.price}</p>}
              {s.status==='pending' && (
                <div className="d-flex gap-2">
                  <button className="btn btn-success btn-sm" onClick={()=>upd(s._id,{status:'confirmed'})}>✅ Confirm</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>upd(s._id,{status:'cancelled'})}>❌ Cancel</button>
                </div>
              )}
              {s.status==='confirmed' && (
                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-primary btn-sm" onClick={()=>upd(s._id,{status:'completed'})}>Mark Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}</div>}
    </div>
  );
}
