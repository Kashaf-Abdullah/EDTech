import React,{useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {fetchRevenue,fetchAdminStats} from '../../redux/slices/adminSlice';
export default function AdminRevenue() {
  const dispatch=useDispatch(),{revenue,stats}=useSelector(s=>s.admin);
  useEffect(()=>{ dispatch(fetchRevenue());dispatch(fetchAdminStats()); },[dispatch]);
  return (
    <div className="container py-4">
      <h4 className="mb-4">Revenue Report 📊</h4>
      <div className="row g-3 mb-4">
        {[{icon:'💰',label:'Total Revenue',val:`PKR ${(stats?.totalRevenue||0).toLocaleString()}`},{icon:'📅',label:'This Month',val:`PKR ${(stats?.monthRevenue||0).toLocaleString()}`},{icon:'📦',label:'Total Transactions',val:revenue.length}].map(s=>(
          <div key={s.label} className="col-md-4"><div className="card text-center shadow-sm p-3"><div className="fs-2">{s.icon}</div><h4>{s.val}</h4><small className="text-muted">{s.label}</small></div></div>
        ))}
      </div>
      <h5>Transaction History</h5>
      <div className="table-responsive"><table className="table table-hover">
        <thead className="table-light"><tr><th>Student</th><th>Course / Entry Test</th><th>Amount</th><th>Platform Fee</th><th>Tutor Earning</th><th>Method</th><th>Date</th></tr></thead>
        <tbody>{revenue.map(p=>(
          <tr key={p._id}>
            <td>{p.student?.name}</td>
            <td>{p.course?.title || (p.entryTest ? `📝 ${p.entryTest.title}` : '—')}</td>
            <td>PKR {p.amount?.toLocaleString()}</td>
            <td className="text-success">PKR {p.platformFee?.toLocaleString()}</td>
            <td>PKR {p.tutorEarning?.toLocaleString()}</td>
            <td><span className={`badge bg-${p.method==='stripe'?'primary':'warning'}`}>{p.method}</span></td>
            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
