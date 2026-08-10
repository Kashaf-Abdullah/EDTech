import React,{useEffect,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {useSelector,useDispatch} from 'react-redux';
import {bookSession} from '../redux/slices/enrollSlice';
import API from '../utils/api';

export default function TutorPublicProfile() {
  const {id}=useParams(),[data,setData]=useState(null),{user}=useSelector(s=>s.auth),dispatch=useDispatch();
  const [booking,setBooking]=useState({date:'',duration:60,subject:'',price:''});
  const [booked,setBooked]=useState(false),[copied,setCopied]=useState(false);
  useEffect(()=>{ API.get(`/tutor/public/${id}`).then(r=>setData(r.data)).catch(()=>{}); },[id]);
  if(!data) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>;
  const {tutor,courses}=data;
  const doBook = async()=>{
    const r=await dispatch(bookSession({tutorId:id,...booking}));
    if(!r.error)setBooked(true);
  };
  const profileLink = `${window.location.origin}/tutors/${id}`;
  const copyLink = () => { navigator.clipboard.writeText(profileLink); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-sm btn-outline-primary" onClick={copyLink}>{copied?'✅ Link Copied!':'🔗 Share this profile'}</button>
      </div>
      <div className="row g-4">
        <div className="col-md-4 text-center">
          <img src={tutor.profilePic||'https://placehold.co/120'} width={120} height={120} className="rounded-circle mb-3" style={{objectFit:'cover'}} alt=""/>
          <h4>{tutor.name}</h4>
          <div className="d-flex flex-wrap gap-1 justify-content-center mb-3">{tutor.subjects?.map(s=><span key={s} className="badge bg-primary">{s}</span>)}</div>
          <p className="text-muted small">{tutor.experience}</p>
          {tutor.zoomLink && <a href={tutor.zoomLink} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm">Join Zoom</a>}
        </div>
        <div className="col-md-8">
          <h5>About</h5><p>{tutor.bio}</p>

          {tutor.education?.length > 0 && (
            <div className="mb-4">
              <h5>🎓 Education</h5>
              <ul className="list-group list-group-flush">
                {tutor.education.map((ed,i)=>(
                  <li key={i} className="list-group-item px-0">
                    <strong>{ed.degree}</strong>{ed.institution && <> — {ed.institution}</>}{ed.year && <span className="text-muted"> ({ed.year})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user?.role==='student' && <div className="card mb-4"><div className="card-body">
            <h5>Book a Session</h5>
            {booked?<div className="alert alert-success">Session booked! Tutor will confirm soon.</div>:<>
              <div className="row g-2 mb-2">
                <div className="col-md-6"><label className="form-label">Date & Time</label><input type="datetime-local" className="form-control" value={booking.date} onChange={e=>setBooking({...booking,date:e.target.value})}/></div>
                <div className="col-md-6"><label className="form-label">Subject</label><input type="text" className="form-control" value={booking.subject} onChange={e=>setBooking({...booking,subject:e.target.value})}/></div>
                <div className="col-md-6"><label className="form-label">Duration (min)</label><select className="form-select" value={booking.duration} onChange={e=>setBooking({...booking,duration:+e.target.value})}><option value={30}>30 min</option><option value={60}>1 hour</option><option value={90}>1.5 hours</option></select></div>
                <div className="col-md-6"><label className="form-label">Price (PKR)</label><input type="number" className="form-control" value={booking.price} onChange={e=>setBooking({...booking,price:e.target.value})}/></div>
              </div>
              <button className="btn btn-primary" onClick={doBook}>Book Session</button>
            </>}
          </div></div>}

          <h5>Courses by {tutor.name}</h5>
          <div className="row g-3">
            {courses?.map(c=>(
              <div key={c._id} className="col-md-6">
                <div className="card shadow-sm">
                  <img src={c.thumbnail||'https://placehold.co/400x180?text=Course'} className="card-img-top" style={{height:120,objectFit:'cover'}} alt=""/>
                  <div className="card-body py-2">
                    <h6 className="card-title mb-1">{c.title}</h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <strong className="text-primary small">PKR {c.price?.toLocaleString()}</strong>
                      <Link to={`/courses/${c._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
