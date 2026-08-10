import React,{useEffect,useState} from 'react';
import {useParams,Link,useNavigate} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchCourseById,fetchReviews,addReview,clearSelected} from '../redux/slices/courseSlice';
import {checkEnrollment} from '../redux/slices/enrollSlice';
export default function CourseDetail() {
  const {id}=useParams(),dispatch=useDispatch(),navigate=useNavigate();
  const {selected:course,loading,reviews}=useSelector(s=>s.course);
  const {user}=useSelector(s=>s.auth);
  const {isEnrolled}=useSelector(s=>s.enroll);
  const [rv,setRv]=useState({rating:5,comment:''});
  const [copied,setCopied]=useState(false);
  useEffect(()=>{ dispatch(fetchCourseById(id));dispatch(fetchReviews(id));if(user)dispatch(checkEnrollment(id));return()=>dispatch(clearSelected()); },[dispatch,id,user]);
  if(loading&&!course) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>;
  if(!course) return null;
  const allLessons=[...course.lessons||[],...(course.sections||[]).flatMap(s=>s.lessons||[])];
  const courseLink = `${window.location.origin}/courses/${id}`;
  const copyLink = () => { navigator.clipboard.writeText(courseLink); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-start">
            <span className="badge bg-secondary mb-2">{course.category}</span>
            <button className="btn btn-sm btn-outline-primary" onClick={copyLink}>{copied?'✅ Copied!':'🔗 Share Course'}</button>
          </div>
          <h2>{course.title}</h2>
          <p className="text-muted">{course.description}</p>
          <div className="d-flex gap-2 flex-wrap mb-3">
            <span className="badge bg-light text-dark">📊 {course.level}</span>
            <span className="badge bg-light text-dark">🌐 {course.language||'Urdu'}</span>
            <span className="badge bg-light text-dark">👥 {course.totalStudents||0} students</span>
            <span className="badge bg-light text-dark">★ {course.rating?.toFixed(1)||'New'} ({course.totalReviews||0})</span>
          </div>
          {course.tutor && <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-4">
            <img src={course.tutor.profilePic||'https://placehold.co/50'} width={50} height={50} className="rounded-circle" alt=""/>
            <div className="flex-fill"><strong>{course.tutor.name}</strong><p className="text-muted small mb-0">{course.tutor.bio?.slice(0,100)}</p></div>
            {user?.role==='student' && isEnrolled && (
              <Link to={`/chat?with=${course.tutor._id}`} className="btn btn-outline-primary btn-sm">💬 Message Tutor</Link>
            )}
            {user?.role==='student' && !isEnrolled && (
              <span className="badge bg-light text-muted border" title="Enroll to unlock chat">🔒 Enroll to chat</span>
            )}
          </div>}
          {course.whatYouLearn?.length>0 && <div className="mb-4"><h5>What you'll learn</h5><ul>{course.whatYouLearn.map((w,i)=><li key={i}>{w}</li>)}</ul></div>}
          <h5>Course Content ({allLessons.length} lessons)</h5>
          <div className="list-group mb-4">
            {allLessons.map((l,i)=><div key={l._id} className="list-group-item d-flex justify-content-between">
              <span>{i+1}. {l.title} <span className="badge bg-light text-dark ms-1">{l.type}</span></span>
              {l.isFree?<span className="badge bg-success">Free</span>:<span className="text-muted small">🔒 Paid</span>}
            </div>)}
          </div>
          <h5>Reviews ({reviews.length})</h5>
          {isEnrolled && <div className="card mb-3"><div className="card-body">
            <h6>Write a Review</h6>
            <div className="mb-2">Rating: {[1,2,3,4,5].map(n=><button key={n} className={`btn btn-sm me-1 ${rv.rating>=n?'btn-warning':'btn-outline-secondary'}`} onClick={()=>setRv({...rv,rating:n})}>★</button>)}</div>
            <textarea className="form-control mb-2" rows={3} value={rv.comment} onChange={e=>setRv({...rv,comment:e.target.value})} placeholder="Share your experience..."/>
            <button className="btn btn-primary btn-sm" onClick={()=>dispatch(addReview({courseId:id,rating:rv.rating,comment:rv.comment}))}>Submit Review</button>
          </div></div>}
          {reviews.map(r=><div key={r._id} className="card mb-2"><div className="card-body py-2">
            <div className="d-flex justify-content-between"><strong>{r.student?.name}</strong><span className="text-warning">{'★'.repeat(r.rating)}</span></div>
            <p className="mb-0 small">{r.comment}</p>
          </div></div>)}
        </div>
        <div className="col-lg-4">
          <div className="card shadow position-sticky" style={{top:80}}>
            <img src={course.thumbnail||'https://placehold.co/400x225?text=Course'} className="card-img-top" alt=""/>
            <div className="card-body text-center">
              <h3 className="text-primary mb-3">PKR {course.price?.toLocaleString()}</h3>
              {isEnrolled
                ? <Link to={`/learn/${course._id}`} className="btn btn-success btn-lg w-100">▶ Continue Learning</Link>
                : user
                ? <Link to={`/checkout/${course._id}`} className="btn btn-primary btn-lg w-100">Enroll Now</Link>
                : <Link to="/login" className="btn btn-primary btn-lg w-100">Login to Enroll</Link>}
              <p className="text-muted small mt-2">✅ Lifetime access · ✅ Certificate · ✅ Urdu support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
