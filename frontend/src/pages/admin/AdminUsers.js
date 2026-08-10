import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchAdminUsers,banUser} from '../../redux/slices/adminSlice';
export default function AdminUsers() {
  const dispatch=useDispatch(),{users,total}=useSelector(s=>s.admin);
  const [role,setRole]=useState('');
  useEffect(()=>{ dispatch(fetchAdminUsers(role?{role}:{})); },[dispatch,role]);
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h4>User Management ({total})</h4>
        <select className="form-select w-auto" value={role} onChange={e=>setRole(e.target.value)}><option value="">All Roles</option><option value="student">Students</option><option value="tutor">Tutors</option><option value="admin">Admins</option></select>
      </div>
      <div className="table-responsive"><table className="table table-hover align-middle">
        <thead className="table-light"><tr><th>User</th><th>Role</th><th>Status</th><th>Referred By</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>{users.map(u=>(
          <tr key={u._id}>
            <td><div className="d-flex align-items-center gap-2"><img src={u.profilePic||'https://placehold.co/32'} width={32} height={32} className="rounded-circle" style={{objectFit:'cover'}} alt=""/><div><div>{u.name}</div><small className="text-muted">{u.email}</small></div></div></td>
            <td><span className={`badge bg-${u.role==='admin'?'danger':u.role==='tutor'?'primary':'success'}`}>{u.role}</span></td>
            <td>{u.isBanned?<span className="badge bg-danger">Banned</span>:<span className="badge bg-success">Active</span>}</td>
            <td>{u.referredBy ? <small className="text-success">🎁 {u.referredBy.name}</small> : <small className="text-muted">—</small>}</td>
            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
            <td className="d-flex gap-1">
              {u.role!=='admin'&&<Link to={`/chat?with=${u._id}`} className="btn btn-sm btn-outline-primary">💬</Link>}
              {u.role!=='admin'&&<button className="btn btn-sm btn-outline-danger" onClick={()=>window.confirm(`Ban ${u.name}?`)&&dispatch(banUser(u._id))}>Ban</button>}
            </td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
