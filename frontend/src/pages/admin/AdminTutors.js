import React,{useEffect,useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {fetchAdminTutors,approveTutor,rejectTutor} from '../../redux/slices/adminSlice';
export default function AdminTutors() {
  const dispatch=useDispatch(),{tutors}=useSelector(s=>s.admin);
  const [status,setStatus]=useState('pending');
  const [modal,setModal]=useState({show:false,id:null,reason:''});
  useEffect(()=>{ dispatch(fetchAdminTutors(status)); },[dispatch,status]);
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h4>Tutor Management</h4>
        <select className="form-select w-auto" value={status} onChange={e=>setStatus(e.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
      </div>
      {tutors.length===0?<div className="alert alert-success">✅ No {status} tutors!</div>
      :<div className="row g-4">{tutors.map(t=>(
        <div key={t._id} className="col-md-6">
          <div className="card shadow-sm h-100"><div className="card-body">
            <div className="d-flex gap-3 mb-3">
              <img src={t.profilePic||'https://placehold.co/60'} width={60} height={60} className="rounded-circle" style={{objectFit:'cover'}} alt=""/>
              <div><h6 className="mb-0">{t.name}</h6><small className="text-muted">{t.email}</small><br/><small className="text-muted">{new Date(t.createdAt).toLocaleDateString()}</small></div>
            </div>
            <p className="small mb-1"><strong>Bio:</strong> {t.bio||'Not provided'}</p>
            <p className="small mb-2"><strong>Subjects:</strong> {t.subjects?.map(s=><span key={s} className="badge bg-primary me-1">{s}</span>)}</p>
            <p className="small mb-3"><strong>Experience:</strong> {t.experience||'Not provided'}</p>
            {status==='pending'&&<div className="d-flex gap-2">
              <button className="btn btn-success btn-sm" onClick={()=>dispatch(approveTutor(t._id))}>✅ Approve</button>
              <button className="btn btn-danger btn-sm" onClick={()=>setModal({show:true,id:t._id,reason:''})}>❌ Reject</button>
            </div>}
          </div></div>
        </div>
      ))}</div>}
      {modal.show&&<div className="modal d-block" style={{background:'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5>Reject Tutor</h5><button className="btn-close" onClick={()=>setModal({show:false,id:null,reason:''})}/></div>
          <div className="modal-body"><label className="form-label">Reason</label><textarea className="form-control" rows={3} value={modal.reason} onChange={e=>setModal({...modal,reason:e.target.value})}/></div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setModal({show:false,id:null,reason:''})}>Cancel</button><button className="btn btn-danger" onClick={()=>{dispatch(rejectTutor({id:modal.id,reason:modal.reason}));setModal({show:false,id:null,reason:''});}}>Reject</button></div>
        </div></div>
      </div>}
    </div>
  );
}
