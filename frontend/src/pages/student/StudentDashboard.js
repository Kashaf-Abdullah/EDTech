import React,{useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchEnrollments,fetchAllProgress,fetchCertificates} from '../../redux/slices/enrollSlice';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';

export default function StudentDashboard() {
  const dispatch=useDispatch(),{user}=useSelector(s=>s.auth);
  const {enrollments,allProgress,certificates}=useSelector(s=>s.enroll);
  useEffect(()=>{ dispatch(fetchEnrollments());dispatch(fetchAllProgress());dispatch(fetchCertificates()); },[dispatch]);
  const getProgress=(courseId)=>allProgress.find(p=>p.course?._id===courseId||p.course===courseId);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's where you left off"
        action={<Link to="/courses" className="btn btn-primary">Browse Courses</Link>}
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><StatCard icon="📚" label="Enrolled Courses" value={enrollments.length} color="primary" /></div>
        <div className="col-6 col-md-3"><StatCard icon="📈" label="In Progress" value={allProgress.filter(p=>!p.isCompleted).length} color="info" /></div>
        <div className="col-6 col-md-3"><StatCard icon="✅" label="Completed" value={allProgress.filter(p=>p.isCompleted).length} color="accent" /></div>
        <div className="col-6 col-md-3"><StatCard icon="🏆" label="Certificates" value={certificates.length} color="warning" /></div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">My Courses</h5>
        <Link to="/my-courses" className="text-decoration-none small fw-semibold" style={{color:'var(--color-primary)'}}>View all →</Link>
      </div>

      {enrollments.length===0
        ? <EmptyState icon="📚" title="No courses yet" subtitle="Browse the catalog and start learning today." action={<Link to="/courses" className="btn btn-primary">Browse Courses</Link>} />
        : <div className="row g-3">
          {enrollments.slice(0,4).map(e=>{
            const prog=getProgress(e.course?._id);
            return (
              <div key={e._id} className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex gap-3">
                      <img src={e.course?.thumbnail||'https://placehold.co/80x60?text=Course'} width={80} height={60} style={{objectFit:'cover',borderRadius:8}} alt=""/>
                      <div className="flex-fill">
                        <h6 className="mb-1">{e.course?.title}</h6>
                        <small className="text-muted-soft">by {e.course?.tutor?.name}</small>
                        <div className="progress mt-2" style={{height:6,borderRadius:6}}>
                          <div className="progress-bar" style={{width:`${prog?.percentage||0}%`,background:'var(--color-primary)'}}/>
                        </div>
                        <small className="text-muted-soft">{prog?.percentage||0}% complete</small>
                      </div>
                    </div>
                    <Link to={`/learn/${e.course?._id}`} className="btn btn-primary btn-sm mt-3 w-100">
                      {prog?.percentage>0?'Continue Learning':'Start Learning'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
    </div>
  );
}
