import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {fetchCourses} from '../redux/slices/courseSlice';
import EmptyState from '../components/common/EmptyState';
import './CourseBrowse.css';

const CATS=['Math','Science','English','Urdu','Computer','Physics','Chemistry','IELTS','Coding','Other'];

export default function CourseBrowse() {
  const dispatch=useDispatch(),{courses,loading,total,pages}=useSelector(s=>s.course);
  const [f,setF]=useState({search:'',category:'',level:'',page:1});
  useEffect(()=>{ const p={page:f.page};if(f.search)p.search=f.search;if(f.category)p.category=f.category;if(f.level)p.level=f.level;dispatch(fetchCourses(p)); },[dispatch,f]);
  const sf=(k,v)=>setF(x=>({...x,[k]:v,page:1}));

  return (
    <div className="browse-page">
      <div className="browse-hero">
        <h1>Find your next course</h1>
        <p>{total} courses from verified tutors, in Urdu and English.</p>
        <div className="browse-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input placeholder="Search courses, e.g. 'Python for beginners'" value={f.search} onChange={e=>sf('search',e.target.value)} />
        </div>
      </div>

      <div className="browse-filters">
        <button className={`browse-chip ${!f.category ? 'active' : ''}`} onClick={()=>sf('category','')}>All</button>
        {CATS.map(c => (
          <button key={c} className={`browse-chip ${f.category===c ? 'active' : ''}`} onClick={()=>sf('category', f.category===c ? '' : c)}>{c}</button>
        ))}
        <select className="browse-level-select" value={f.level} onChange={e=>sf('level',e.target.value)}>
          <option value="">All Levels</option>
          {['beginner','intermediate','advanced'].map(l=><option key={l} value={l} className="text-capitalize">{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : courses.length === 0 ? (
        <EmptyState icon="🔍" title="No courses found" subtitle="Try a different search or clear your filters." />
      ) : (
        <div className="course-grid">
          {courses.map(c => (
            <Link to={`/courses/${c._id}`} key={c._id} className="course-card">
              <div className="course-card-thumb">
                <img src={c.thumbnail || 'https://placehold.co/400x225/4F6BFF/fff?text=Course'} alt={c.title} />
                {c.isFeatured && <span className="course-card-badge">⭐ Featured</span>}
              </div>
              <div className="course-card-body">
                <span className="course-card-cat">{c.category}</span>
                <h3>{c.title}</h3>
                <p className="course-card-tutor">by {c.tutor?.name}</p>
                <div className="course-card-meta">
                  <span className="course-card-rating">★ {c.rating?.toFixed(1) || 'New'} <span>({c.totalReviews || 0})</span></span>
                  <strong className="course-card-price">PKR {c.price?.toLocaleString()}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="browse-pagination">
          {[...Array(pages)].map((_, i) => (
            <button key={i} className={`browse-page-btn ${f.page === i+1 ? 'active' : ''}`} onClick={()=>setF(x=>({...x,page:i+1}))}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
