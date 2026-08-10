import React,{useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchCourseById} from '../../redux/slices/courseSlice';
import {fetchProgress,markLessonComplete} from '../../redux/slices/enrollSlice';
export default function LearnCourse() {
  const {id}=useParams(),dispatch=useDispatch();
  const {selected:course}=useSelector(s=>s.course);
  const {progress}=useSelector(s=>s.enroll);
  const [active,setActive]=useState(null);
  useEffect(()=>{ dispatch(fetchCourseById(id));dispatch(fetchProgress(id)); },[dispatch,id]);
  useEffect(()=>{ if(course){const all=getAllLessons(course);if(all.length>0&&!active)setActive(all[0]);} },[course]);

  const getAllLessons=(c)=>[...(c?.lessons||[]),...(c?.sections||[]).flatMap(s=>s.lessons||[])];
  const isCompleted=(lessonId)=>progress?.completedLessons?.map(String).includes(String(lessonId));

  const markDone=()=>{
    if(active) dispatch(markLessonComplete({courseId:id,lessonId:active._id}));
  };

  const nextLesson=()=>{
    const all=getAllLessons(course);
    const idx=all.findIndex(l=>l._id===active?._id);
    if(idx<all.length-1) setActive(all[idx+1]);
  };

  if(!course) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>;
  const allLessons=getAllLessons(course);
  const pct=progress?.percentage||0;

  return (
    <div className="container-fluid py-0">
      <div className="row g-0" style={{minHeight:'calc(100vh - 56px)'}}>
        {/* Sidebar */}
        <div className="col-md-3 border-end bg-light" style={{overflowY:'auto',maxHeight:'calc(100vh - 56px)'}}>
          <div className="p-3 border-bottom">
            <h6 className="mb-1">{course.title}</h6>
            <div className="progress" style={{height:6}}><div className="progress-bar" style={{width:`${pct}%`}}/></div>
            <small className="text-muted">{pct}% complete</small>
          </div>
          <div className="list-group list-group-flush">
            {allLessons.map((l,i)=>(
              <button key={l._id} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 ${active?._id===l._id?'active':''}`} onClick={()=>setActive(l)}>
                <span className="small">{i+1}. {l.title}</span>
                <span>{isCompleted(l._id)?'✅':<span className="badge bg-secondary">{l.type}</span>}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-md-9 p-4">
          {active ? (<>
            <h5 className="mb-3">{active.title}</h5>
            {active.type==='video' && (
              <div className="ratio ratio-16x9 mb-3">
                <video src={active.url} controls className="w-100 rounded" style={{background:'#000'}}/>
              </div>
            )}
            {active.type==='pdf' && (
              <div className="mb-3">
                <iframe src={active.url} width="100%" height="600px" title={active.title} className="border rounded"/>
                <a href={active.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mt-2">📥 Download PDF</a>
              </div>
            )}
            <div className="d-flex gap-2 mt-3">
              {!isCompleted(active._id)
                ? <button className="btn btn-success" onClick={markDone}>✅ Mark as Complete</button>
                : <span className="btn btn-outline-success disabled">✅ Completed</span>}
              <button className="btn btn-primary" onClick={nextLesson}>Next Lesson →</button>
            </div>
            {progress?.isCompleted && (
              <div className="alert alert-success mt-4">
                🎉 Congratulations! You completed this course. Check your <a href="/certificates">certificates</a>!
              </div>
            )}
          </>) : <p className="text-muted">Select a lesson from the sidebar.</p>}
        </div>
      </div>
    </div>
  );
}
