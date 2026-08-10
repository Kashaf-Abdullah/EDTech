import React,{useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchEnrollments,fetchAllProgress} from '../../redux/slices/enrollSlice';
export default function MyCourses() {
  const dispatch=useDispatch();
  const {enrollments,allProgress}=useSelector(s=>s.enroll);
  useEffect(()=>{ dispatch(fetchEnrollments());dispatch(fetchAllProgress()); },[dispatch]);
  const getProgress=(id)=>allProgress.find(p=>p.course?._id===id||p.course===id);
  return (
    <div className="container py-4">
      <h4 className="mb-4">My Courses ({enrollments.length})</h4>
      {enrollments.length===0
        ? <div className="text-center py-5"><p className="text-muted">No courses enrolled yet.</p><Link to="/courses" className="btn btn-primary">Browse Courses</Link></div>
        : <div className="row g-4">
          {enrollments.map(e=>{
            const prog=getProgress(e.course?._id);
            const pct=prog?.percentage||0;
            return (
              <div key={e._id} className="col-md-4">
                <div className="card h-100 shadow-sm">
                  <img src={e.course?.thumbnail||'https://placehold.co/400x200?text=Course'} className="card-img-top" style={{height:150,objectFit:'cover'}} alt=""/>
                  <div className="card-body d-flex flex-column">
                    <h6>{e.course?.title}</h6>
                    <small className="text-muted mb-2">by {e.course?.tutor?.name}</small>
                    <div className="progress mb-1" style={{height:8}}><div className="progress-bar bg-success" style={{width:`${pct}%`}}/></div>
                    <small className="text-muted mb-3">{pct}% complete {prog?.isCompleted?'✅':''}</small>
                    <div className="mt-auto d-flex gap-2">
                      <Link to={`/learn/${e.course?._id}`} className="btn btn-primary btn-sm flex-fill">
                        {pct>0?'Continue':'Start'}
                      </Link>
                      {prog?.isCompleted && <Link to="/certificates" className="btn btn-outline-success btn-sm">🏆 Cert</Link>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
    </div>
  );
}
