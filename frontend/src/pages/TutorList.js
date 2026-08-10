import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import API from '../utils/api';
import './TutorList.css';

export default function TutorList() {
  const [tutors,setTutors]=useState([]);
  useEffect(()=>{ API.get('/tutor/all').then(r=>setTutors(r.data.tutors)).catch(()=>{}); },[]);
  return (
    <div className="tutor-list-page">
      <div className="tutor-list-header">
        <h1>Meet our tutors</h1>
        <p>Verified, experienced, ready to teach.</p>
      </div>
      <div className="tutor-grid">
        {tutors.map(t=>(
          <div key={t._id} className="tutor-card">
            <img src={t.profilePic||'https://placehold.co/80'} className="tutor-card-pic" alt=""/>
            <h3>{t.name}</h3>
            <p className="tutor-card-bio">{t.bio?.slice(0,70)}...</p>
            <div className="tutor-card-subjects">{t.subjects?.slice(0,3).map(s=><span key={s} className="tutor-card-subject-tag">{s}</span>)}</div>
            <Link to={`/tutors/${t._id}`} className="tutor-card-link">View Profile</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
