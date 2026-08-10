import React,{useEffect,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchCourseById,addLesson} from '../../redux/slices/courseSlice';
import API from '../../utils/api';

export default function ManageCourse() {
  const {id}=useParams(),dispatch=useDispatch();
  const {selected:course,loading}=useSelector(s=>s.course);
  const [lf,setLf]=useState({title:'',isFree:'false',duration:''});
  const [file,setFile]=useState(null),[uploading,setUploading]=useState(false),[msg,setMsg]=useState('');
  const [students,setStudents]=useState([]);
  const [tab,setTab]=useState('lessons');
  const [copied,setCopied]=useState(false);

  useEffect(()=>{ dispatch(fetchCourseById(id)); },[dispatch,id]);
  useEffect(()=>{
    if(tab==='students') API.get(`/courses/${id}/students`).then(r=>setStudents(r.data.students)).catch(()=>{});
  },[tab,id]);

  const doAdd=async e=>{ e.preventDefault();if(!file)return setMsg('Select a file');setUploading(true);const fd=new FormData();fd.append('title',lf.title);fd.append('isFree',lf.isFree);fd.append('duration',lf.duration);fd.append('file',file);const r=await dispatch(addLesson({id,fd}));setUploading(false);if(!r.error){setMsg('Lesson added!');setLf({title:'',isFree:'false',duration:''});setFile(null);}else setMsg(r.payload||'Upload failed'); };
  const doDelLesson=async(lessonId)=>{ if(!window.confirm('Delete?'))return;await API.delete(`/courses/${id}/lessons/${lessonId}`);dispatch(fetchCourseById(id)); };

  if(!course) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>;
  const allLessons=[...(course.lessons||[]),...(course.sections||[]).flatMap(s=>s.lessons||[])];
  const courseLink = `${window.location.origin}/courses/${id}`;
  const copyLink = () => { navigator.clipboard.writeText(courseLink); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h4 className="mb-0">{course.title}</h4>
        <button className="btn btn-sm btn-outline-primary" onClick={copyLink}>{copied?'✅ Copied!':'🔗 Share Course Link'}</button>
      </div>
      <span className={`badge bg-${!course.isApproved?'warning':course.isPublished?'success':'secondary'} mb-3`}>{!course.isApproved?'Pending Approval':course.isPublished?'Published':'Draft'}</span>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${tab==='lessons'?'active':''}`} onClick={()=>setTab('lessons')}>📹 Lessons</button></li>
        <li className="nav-item"><button className={`nav-link ${tab==='students'?'active':''}`} onClick={()=>setTab('students')}>👥 Students ({course.totalStudents||0})</button></li>
      </ul>

      {tab==='lessons' && (
        <div className="row g-4">
          <div className="col-md-7">
            <h5>Lessons ({allLessons.length})</h5>
            {allLessons.length===0?<p className="text-muted">No lessons yet. Add your first →</p>
            :<div className="list-group">
              {allLessons.map((l,i)=>(
                <div key={l._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div><span className="fw-medium">{i+1}. {l.title}</span><div><span className="badge bg-secondary me-1">{l.type}</span>{l.isFree&&<span className="badge bg-success">Free</span>}{l.duration>0&&<small className="text-muted ms-2">{l.duration}min</small>}</div></div>
                  <button className="btn btn-sm btn-outline-danger" onClick={()=>doDelLesson(l._id)}>🗑</button>
                </div>
              ))}
            </div>}
          </div>
          <div className="col-md-5">
            <div className="card shadow-sm"><div className="card-body">
              <h5>Add Lesson</h5>
              {msg&&<div className={`alert py-2 ${msg==='Lesson added!'?'alert-success':'alert-danger'}`}>{msg}</div>}
              <form onSubmit={doAdd}>
                <div className="mb-3"><label className="form-label">Title *</label><input type="text" className="form-control" value={lf.title} onChange={e=>setLf({...lf,title:e.target.value})} required/></div>
                <div className="mb-3"><label className="form-label">File (Video or PDF) *</label><input type="file" className="form-control" accept="video/mp4,video/webm,application/pdf" onChange={e=>setFile(e.target.files[0])}/></div>
                <div className="row g-2 mb-3">
                  <div className="col-6"><label className="form-label">Duration (min)</label><input type="number" className="form-control" min="0" value={lf.duration} onChange={e=>setLf({...lf,duration:e.target.value})}/></div>
                  <div className="col-6"><label className="form-label">Free preview?</label><select className="form-select" value={lf.isFree} onChange={e=>setLf({...lf,isFree:e.target.value})}><option value="false">No (Paid)</option><option value="true">Yes (Free)</option></select></div>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={uploading}>{uploading?<><span className="spinner-border spinner-border-sm me-2"/>Uploading...</>:'Add Lesson'}</button>
              </form>
            </div></div>
          </div>
        </div>
      )}

      {tab==='students' && (
        <div>
          {students.length===0 ? <p className="text-muted">No students enrolled yet.</p>
          : <div className="row g-3">
            {students.map(s=>(
              <div key={s._id} className="col-md-6">
                <div className="card shadow-sm"><div className="card-body d-flex align-items-center gap-3">
                  <img src={s.profilePic||'https://placehold.co/44'} width={44} height={44} className="rounded-circle" style={{objectFit:'cover'}} alt=""/>
                  <div className="flex-fill">
                    <strong className="d-block small">{s.name}</strong>
                    <small className="text-muted">{s.email}</small>
                  </div>
                  <Link to={`/chat?with=${s._id}`} className="btn btn-outline-primary btn-sm">💬 Message</Link>
                </div></div>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  );
}
