import React,{useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchCertificates} from '../../redux/slices/enrollSlice';
export default function Certificates() {
  const dispatch=useDispatch(),{certificates}=useSelector(s=>s.enroll);
  useEffect(()=>{ dispatch(fetchCertificates()); },[dispatch]);
  return (
    <div className="container py-4">
      <h4 className="mb-4">My Certificates </h4>
      {certificates.length===0
        ? <div className="text-center py-5 text-muted"><div className="fs-1 mb-2">📜</div><p>Complete a course to earn your certificate!</p></div>
        : <div className="row g-4">
          {certificates.map(c=>(
            <div key={c._id} className="col-md-4">
              <div className="card shadow-sm border-warning">
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-2">🏆</div>
                  <h6>{c.course?.title}</h6>
                  <small className="text-muted d-block mb-2">Issued: {new Date(c.issuedAt).toLocaleDateString()}</small>
                  <code className="small">{c.certificateId}</code>
                  <div className="mt-3">
                    <Link to={`/certificates/${c.certificateId}`} target="_blank" rel="noopener noreferrer" className="btn btn-warning btn-sm">
                      🎓 View Certificate
                    </Link>
                  </div>
                </div>
                <div className="card-footer text-center py-2" style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white'}}>
                  <small>EduPak Certified ✓</small>
                </div>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}
