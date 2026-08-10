import React,{useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchAdminStats} from '../../redux/slices/adminSlice';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

export default function AdminDashboard() {
  const dispatch=useDispatch(),{stats}=useSelector(s=>s.admin);
  useEffect(()=>{ dispatch(fetchAdminStats()); },[dispatch]);
  const cards=[
    {icon:'👨‍🎓',label:'Students',val:stats?.students||0,color:'primary'},
    {icon:'👨‍🏫',label:'Active Tutors',val:stats?.tutors||0,color:'accent'},
    {icon:'⏳',label:'Pending Tutors',val:stats?.pendingTutors||0,color:'warning',link:'/admin/tutors'},
    {icon:'📚',label:'Courses',val:stats?.courses||0,color:'info'},
    {icon:'📋',label:'Pending Courses',val:stats?.pendingCourses||0,color:'warning',link:'/admin/courses'},
    {icon:'💰',label:'Total Revenue',val:`PKR ${(stats?.totalRevenue||0).toLocaleString()}`,color:'accent'},
    {icon:'📅',label:'Month Revenue',val:`PKR ${(stats?.monthRevenue||0).toLocaleString()}`,color:'primary'},
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview at a glance" />

      <div className="row g-3 mb-4">
        {cards.map(c=>(
          <div key={c.label} className="col-6 col-md-3">
            {c.link ? <Link to={c.link} className="text-decoration-none"><StatCard icon={c.icon} label={c.label} value={c.val} color={c.color} /></Link>
                    : <StatCard icon={c.icon} label={c.label} value={c.val} color={c.color} />}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Quick Actions</h5>
          <div className="row g-2">
            {[
              { to:'/admin/tutors', label:`⏳ Review Tutors (${stats?.pendingTutors||0} pending)` },
              { to:'/admin/courses', label:`📋 Approve Courses (${stats?.pendingCourses||0} pending)` },
              { to:'/admin/payments', label:'💳 Review Payments' },
              { to:'/admin/users', label:'👥 Manage Users' },
              { to:'/admin/revenue', label:'📊 Revenue Report' },
              { to:'/admin/settings', label:'⚙️ Platform Settings' },
            ].map(a => (
              <div key={a.to} className="col-md-6">
                <Link to={a.to} className="btn btn-outline-primary w-100 text-start">{a.label}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
