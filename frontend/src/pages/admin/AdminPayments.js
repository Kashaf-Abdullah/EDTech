import React,{useEffect,useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {fetchPendingPay,reviewPayment} from '../../redux/slices/adminSlice';
export default function AdminPayments() {
  const dispatch=useDispatch(),{payments}=useSelector(s=>s.admin);
  const [modal,setModal]=useState({show:false,id:null,action:'',note:''});
  useEffect(()=>{ dispatch(fetchPendingPay()); },[dispatch]);
  const doReview=()=>{ dispatch(reviewPayment({id:modal.id,action:modal.action,note:modal.note}));setModal({show:false,id:null,action:'',note:''}); };
  return (
    <div className="container py-4">
      <h4 className="mb-4">Pending Payments ({payments.length})</h4>
      {payments.length===0?<div className="alert alert-success">✅ No pending payments!</div>
      :<div className="row g-3">{payments.map(p=>(
        <div key={p._id} className="col-md-6">
          <div className="card shadow-sm"><div className="card-body">
            <div className="d-flex justify-content-between mb-2">
              <div><strong>{p.student?.name}</strong><p className="text-muted small mb-0">{p.student?.email}</p></div>
              <span className="badge bg-warning">Pending</span>
            </div>
            <p className="small mb-1">📚 {p.course?.title}</p>
            <p className="small mb-1">💰 PKR {p.amount?.toLocaleString()} | 🏦 {p.bankName}</p>
            {p.transactionId&&<p className="small mb-1">TXN: {p.transactionId}</p>}
            <p className="small mb-2">📅 {new Date(p.createdAt).toLocaleDateString()}</p>
            {p.screenshotUrl&&<div className="mb-3"><a href={p.screenshotUrl} target="_blank" rel="noopener noreferrer"><img src={p.screenshotUrl} alt="Screenshot" className="img-thumbnail" style={{maxHeight:150}}/></a></div>}
            <div className="d-flex gap-2">
              <button className="btn btn-success btn-sm" onClick={()=>setModal({show:true,id:p._id,action:'approve',note:''})}>✅ Approve</button>
              <button className="btn btn-danger btn-sm" onClick={()=>setModal({show:true,id:p._id,action:'reject',note:''})}>❌ Reject</button>
            </div>
          </div></div>
        </div>
      ))}</div>}
      {modal.show&&<div className="modal d-block" style={{background:'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5>{modal.action==='approve'?'Approve':'Reject'} Payment</h5><button className="btn-close" onClick={()=>setModal({show:false,id:null,action:'',note:''})}/></div>
          <div className="modal-body"><label className="form-label">Note (optional)</label><textarea className="form-control" rows={3} value={modal.note} onChange={e=>setModal({...modal,note:e.target.value})}/></div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setModal({show:false,id:null,action:'',note:''})}>Cancel</button><button className={`btn btn-${modal.action==='approve'?'success':'danger'}`} onClick={doReview}>{modal.action==='approve'?'Approve':'Reject'}</button></div>
        </div></div>
      </div>}
    </div>
  );
}
