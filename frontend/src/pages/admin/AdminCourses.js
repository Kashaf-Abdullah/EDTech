import React,{useEffect,useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {fetchAdminCourses,approveCourse,featureCourse} from '../../redux/slices/adminSlice';
export default function AdminCourses() {
  const dispatch=useDispatch(),{courses}=useSelector(s=>s.admin);
  const [filter,setFilter]=useState('false');
  useEffect(()=>{ dispatch(fetchAdminCourses(filter)); },[dispatch,filter]);
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h4>Course Management</h4>
        <select className="form-select w-auto" value={filter} onChange={e=>setFilter(e.target.value)}><option value="false">Pending Approval</option><option value="true">Approved</option></select>
      </div>
      {courses.length===0?<div className="alert alert-success">✅ No courses here!</div>
      :<div className="table-responsive"><table className="table table-hover align-middle">
        <thead className="table-light"><tr><th>Course</th><th>Tutor</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{courses.map(c=>(
          <tr key={c._id}>
            <td><div className="d-flex align-items-center gap-2"><img src={c.thumbnail||'https://placehold.co/50x35?text=C'} width={50} height={35} style={{objectFit:'cover',borderRadius:4}} alt=""/><span>{c.title}</span></div></td>
            <td><div>{c.tutor?.name}</div><small className="text-muted">{c.tutor?.email}</small></td>
            <td><span className="badge bg-secondary">{c.category}</span></td>
            <td>PKR {c.price?.toLocaleString()}</td>
            <td>{c.isFeatured&&<span className="badge bg-warning me-1">⭐ Featured</span>}<span className={`badge bg-${c.isPublished?'success':'secondary'}`}>{c.isPublished?'Published':'Draft'}</span></td>
            <td><div className="d-flex gap-1">
              {!c.isApproved&&<button className="btn btn-success btn-sm" onClick={()=>dispatch(approveCourse(c._id))}>✅ Approve</button>}
              <button className="btn btn-sm btn-outline-warning" onClick={()=>dispatch(featureCourse(c._id))}>{c.isFeatured?'Unfeature':'⭐ Feature'}</button>
            </div></td>
          </tr>
        ))}</tbody>
      </table></div>}
    </div>
  );
}
