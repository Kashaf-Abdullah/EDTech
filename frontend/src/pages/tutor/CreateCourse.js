import React,{useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {createCourse} from '../../redux/slices/courseSlice';
const CATS=['Math','Science','English','Urdu','Computer','Physics','Chemistry','IELTS','Coding','Other'];
export default function CreateCourse() {
  const dispatch=useDispatch(),navigate=useNavigate(),{loading,error}=useSelector(s=>s.course);
  const [f,setF]=useState({title:'',description:'',price:'',category:'',level:'beginner',language:'Urdu',tags:'',whatYouLearn:'',requirements:''});
  const [thumb,setThumb]=useState(null),[preview,setPreview]=useState(null);
  const onThumb=e=>{ const file=e.target.files[0];if(file){setThumb(file);setPreview(URL.createObjectURL(file));} };
  const onSubmit=async e=>{
    e.preventDefault();
    const fd=new FormData();
    Object.entries(f).forEach(([k,v])=>fd.append(k,v));
    if(thumb)fd.append('thumbnail',thumb);
    const r=await dispatch(createCourse(fd));
    if(!r.error) navigate('/tutor/dashboard');
  };
  return (
    <div className="container py-4"><div className="row justify-content-center"><div className="col-md-8">
      <h4 className="mb-4">Create New Course</h4>
      {error&&<div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm"><div className="card-body p-4">
        <div className="mb-3 text-center">
          <div style={{height:180,background:'#f0f0f0',borderRadius:8,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
            {preview?<img src={preview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span className="text-muted">Course thumbnail</span>}
          </div>
          <label className="btn btn-outline-secondary btn-sm" htmlFor="thumb">Upload Thumbnail</label>
          <input id="thumb" type="file" accept="image/*" className="d-none" onChange={onThumb}/>
        </div>
        <form onSubmit={onSubmit}>
          <div className="mb-3"><label className="form-label">Course Title *</label><input type="text" className="form-control" value={f.title} onChange={e=>setF({...f,title:e.target.value})} required/></div>
          <div className="mb-3"><label className="form-label">Description *</label><textarea className="form-control" rows={4} value={f.description} onChange={e=>setF({...f,description:e.target.value})} required/></div>
          <div className="mb-3"><label className="form-label">What Students Will Learn (one per line)</label><textarea className="form-control" rows={3} value={f.whatYouLearn} onChange={e=>setF({...f,whatYouLearn:e.target.value})} placeholder="Line 1&#10;Line 2"/></div>
          <div className="row g-3 mb-3">
            <div className="col-md-4"><label className="form-label">Price (PKR) *</label><input type="number" className="form-control" min="0" value={f.price} onChange={e=>setF({...f,price:e.target.value})} required/></div>
            <div className="col-md-4"><label className="form-label">Category *</label><select className="form-select" value={f.category} onChange={e=>setF({...f,category:e.target.value})} required><option value="">Select...</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label">Level</label><select className="form-select" value={f.level} onChange={e=>setF({...f,level:e.target.value})}>{['beginner','intermediate','advanced'].map(l=><option key={l} value={l} className="text-capitalize">{l}</option>)}</select></div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6"><label className="form-label">Language</label><select className="form-select" value={f.language} onChange={e=>setF({...f,language:e.target.value})}>{['Urdu','English','Urdu + English'].map(l=><option key={l} value={l}>{l}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label">Tags (comma separated)</label><input type="text" className="form-control" value={f.tags} onChange={e=>setF({...f,tags:e.target.value})} placeholder="python, beginner"/></div>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading?<span className="spinner-border spinner-border-sm me-2"/>:null}Create Course</button>
        </form>
      </div></div>
    </div></div></div>
  );
}
