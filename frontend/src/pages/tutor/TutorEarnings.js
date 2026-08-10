import React,{useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {fetchEarnings} from '../../redux/slices/tutorSlice';
export default function TutorEarnings() {
  const dispatch=useDispatch(),{earnings}=useSelector(s=>s.tutor);
  useEffect(()=>{ dispatch(fetchEarnings()); },[dispatch]);
  return (
    <div className="container py-4">
      <h4 className="mb-4">Earnings 💰</h4>
      <div className="row g-3 mb-4">
        {[{icon:'💰',label:'Total Earned',val:`PKR ${(earnings?.totalEarned||0).toLocaleString()}`},{icon:'⏳',label:'Pending Payout',val:`PKR ${(earnings?.pendingPayout||0).toLocaleString()}`},{icon:'📦',label:'Transactions',val:earnings?.payments?.length||0}].map(s=>(
          <div key={s.label} className="col-md-4"><div className="card text-center shadow-sm p-3"><div className="fs-2">{s.icon}</div><h4>{s.val}</h4><small className="text-muted">{s.label}</small></div></div>
        ))}
      </div>
      <h5>Transaction History</h5>
      {!earnings?.payments?.length?<p className="text-muted">No transactions yet.</p>
      :<div className="table-responsive"><table className="table table-hover">
        <thead className="table-light"><tr><th>Course</th><th>Student</th><th>Amount</th><th>My Earning</th><th>Date</th></tr></thead>
        <tbody>{earnings.payments.map(p=>(
          <tr key={p._id}><td>{p.course?.title}</td><td>{p.student?.name}</td><td>PKR {p.amount?.toLocaleString()}</td><td className="text-success">PKR {p.tutorEarning?.toLocaleString()}</td><td>{new Date(p.createdAt).toLocaleDateString()}</td></tr>
        ))}</tbody>
      </table></div>}
      <div className="alert alert-info mt-3"><strong>Payout:</strong> Contact admin to withdraw earnings. Bank Transfer / JazzCash available.</div>
    </div>
  );
}
