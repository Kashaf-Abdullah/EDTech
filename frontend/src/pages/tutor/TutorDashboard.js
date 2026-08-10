import React,{useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchTutorStats} from '../../redux/slices/tutorSlice';
import {fetchMyCourses,togglePublish,deleteCourse} from '../../redux/slices/courseSlice';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';

export default function TutorDashboard() {
  const dispatch=useDispatch(),{user}=useSelector(s=>s.auth);
  const {stats}=useSelector(s=>s.tutor);
  const {myCourses}=useSelector(s=>s.course);
  useEffect(()=>{ dispatch(fetchTutorStats());dispatch(fetchMyCourses()); },[dispatch]);
  const approvalColor={approved:'success',pending:'warning',rejected:'danger'};

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]} 👨‍🏫`}
        subtitle={<span className={`badge bg-${approvalColor[user?.approvalStatus]}`}>Account: {user?.approvalStatus}</span>}
        action={user?.approvalStatus==='approved' && <Link to="/tutor/courses/create" className="btn btn-primary">+ New Course</Link>}
      />

      {user?.approvalStatus==='pending' && (
        <div className="alert" style={{background:'var(--color-warning-light)',border:'none',color:'#92600A'}}>⏳ Your account is pending admin approval. You'll be notified by email.</div>
      )}
      {user?.approvalStatus==='rejected' && (
        <div className="alert" style={{background:'var(--color-danger-light)',border:'none',color:'#991B1B'}}>❌ Application rejected. Please update your profile and contact support.</div>
      )}

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-lg-2"><StatCard icon="📚" label="Total Courses" value={stats.totalCourses} color="primary" /></div>
          <div className="col-6 col-md-4 col-lg-2"><StatCard icon="✅" label="Published" value={stats.publishedCourses} color="accent" /></div>
          <div className="col-6 col-md-4 col-lg-2"><StatCard icon="👥" label="Total Students" value={stats.totalStudents} color="info" /></div>
          <div className="col-6 col-md-4 col-lg-2"><StatCard icon="🎯" label="Sessions Done" value={stats.totalSessions} color="info" /></div>
          <div className="col-6 col-md-4 col-lg-2"><StatCard icon="💰" label="Total Earnings" value={`PKR ${(stats.totalEarnings||0).toLocaleString()}`} color="accent" /></div>
          <div className="col-6 col-md-4 col-lg-2"><StatCard icon="⏳" label="Pending Payout" value={`PKR ${(stats.pendingPayout||0).toLocaleString()}`} color="warning" /></div>
        </div>
      )}

      <h5 className="mb-3">My Courses</h5>
      {myCourses.length===0
        ? <EmptyState icon="📚" title="No courses yet" subtitle={user?.approvalStatus==='approved' ? "Create your first course to get started." : "You'll be able to create courses once approved."} action={user?.approvalStatus==='approved' && <Link to="/tutor/courses/create" className="btn btn-primary">Create First Course</Link>} />
        : <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light"><tr><th>Course</th><th>Price</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{myCourses.map(c=>(
                <tr key={c._id}>
                  <td><div className="d-flex align-items-center gap-2"><img src={c.thumbnail||'https://placehold.co/50x35?text=C'} width={50} height={35} style={{objectFit:'cover',borderRadius:6}} alt=""/><span className="fw-medium">{c.title}</span></div></td>
                  <td>PKR {c.price?.toLocaleString()}</td>
                  <td>{c.totalStudents||0}</td>
                  <td><span className={`badge bg-${!c.isApproved?'warning':c.isPublished?'success':'secondary'}`}>{!c.isApproved?'Pending Approval':c.isPublished?'Published':'Draft'}</span></td>
                  <td><div className="d-flex gap-1">
                    <Link to={`/tutor/courses/${c._id}`} className="btn btn-sm btn-outline-primary">Manage</Link>
                    {c.isApproved&&<button className="btn btn-sm btn-outline-secondary" onClick={()=>dispatch(togglePublish(c._id))}>{c.isPublished?'Unpublish':'Publish'}</button>}
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>window.confirm('Delete?')&&dispatch(deleteCourse(c._id))}>🗑</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>}
    </div>
  );
}
