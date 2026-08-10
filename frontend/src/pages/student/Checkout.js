import React,{useEffect,useState} from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchCourseById} from '../../redux/slices/courseSlice';
import {submitManualPay,clearPaymentSuccess} from '../../redux/slices/enrollSlice';
import API from '../../utils/api';
export default function Checkout() {
  const {id}=useParams(),dispatch=useDispatch(),navigate=useNavigate();
  const {selected:course}=useSelector(s=>s.course);
  const {loading,error,paymentSuccess}=useSelector(s=>s.enroll);
  const [method,setMethod]=useState('manual');
  const [mf,setMf]=useState({bankName:'jazzcash',transactionId:''});
  const [screenshot,setScreenshot]=useState(null);
  useEffect(()=>{ dispatch(fetchCourseById(id)); },[dispatch,id]);
  useEffect(()=>{ if(paymentSuccess){dispatch(clearPaymentSuccess());navigate('/dashboard');} },[paymentSuccess,navigate,dispatch]);

  const submitManual=async()=>{
    const fd=new FormData();
    fd.append('courseId',id);
    fd.append('bankName',mf.bankName);
    fd.append('transactionId',mf.transactionId);
    if(screenshot) fd.append('screenshot',screenshot);
    dispatch(submitManualPay(fd));
  };

  if(!course) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h4 className="mb-4">Checkout</h4>
          <div className="card shadow-sm mb-4">
            <div className="card-body d-flex gap-3">
              <img src={course.thumbnail||'https://placehold.co/120x80?text=Course'} width={120} height={80} style={{objectFit:'cover',borderRadius:8}} alt=""/>
              <div>
                <h6>{course.title}</h6>
                <p className="text-muted small mb-0">by {course.tutor?.name}</p>
                <h5 className="text-primary mt-1">PKR {course.price?.toLocaleString()}</h5>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Select Payment Method</h5>
              <div className="d-flex gap-3 mb-4">
                {['manual'].map(m=>(
                  <div key={m} className={`card flex-fill text-center p-3 cursor-pointer ${method===m?'border-primary':''}`} style={{cursor:'pointer'}} onClick={()=>setMethod(m)}>
                    <div className="fs-2">{m==='stripe'?'💳':'🏦'}</div>
                    <small>{m==='stripe'?'Card / Stripe':'Bank Transfer'}</small>
                  </div>
                ))}
              </div>

              {method==='manual' && (
                <div>
                  <div className="alert alert-info">
                    <h6>Bank Account Details:</h6>
                    <p className="mb-1">🏦 <strong>JazzCash:</strong> 0300-1234567</p>
                    <p className="mb-1">📱 <strong>EasyPaisa:</strong> 0301-7654321</p>
                    <p className="mb-0">🏛️ <strong>Bank (HBL):</strong> IBAN: PK36HABB0000123456789</p>
                  </div>
                  <p className="text-muted small">Transfer PKR <strong>{course.price?.toLocaleString()}</strong> to any of the above accounts, then upload screenshot below.</p>
                  <div className="mb-3">
                    <label className="form-label">Transfer Method</label>
                    <select className="form-select" value={mf.bankName} onChange={e=>setMf({...mf,bankName:e.target.value})}>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="bank">Bank Transfer (HBL)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Transaction ID (optional)</label>
                    <input type="text" className="form-control" placeholder="e.g. TXN123456" value={mf.transactionId} onChange={e=>setMf({...mf,transactionId:e.target.value})}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Upload Payment Screenshot *</label>
                    <input type="file" className="form-control" accept="image/*" onChange={e=>setScreenshot(e.target.files[0])}/>
                    <small className="text-muted">JPG/PNG only, max 5MB</small>
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button className="btn btn-primary w-100" onClick={submitManual} disabled={loading||!screenshot}>
                    {loading?<span className="spinner-border spinner-border-sm me-2"/>:null}
                    Submit Payment for Review
                  </button>
                  <p className="text-muted small text-center mt-2">Admin will approve within 24 hours. You'll get email confirmation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
