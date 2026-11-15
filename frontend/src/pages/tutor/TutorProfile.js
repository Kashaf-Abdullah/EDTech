import React,{useEffect,useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {fetchTutorProfile,updateTutorProfile} from '../../redux/slices/tutorSlice';
import {logout} from '../../redux/slices/authSlice';

export default function TutorProfile() {
  const dispatch=useDispatch(),navigate=useNavigate(),{profile,loading,error}=useSelector(s=>s.tutor);
  const {user}=useSelector(s=>s.auth);
  const [f,setF]=useState({name:'',bio:'',subjects:'',experience:'',zoomLink:'',company:'',address:'',phone:''});
  const [education,setEducation]=useState([{degree:'',institution:'',year:''}]);
  const [pic,setPic]=useState(null),[preview,setPreview]=useState(null),[ok,setOk]=useState(false),[copied,setCopied]=useState(false);

  useEffect(()=>{ dispatch(fetchTutorProfile()); },[dispatch]);
  useEffect(()=>{
    if(profile){
      setF({
        name:profile.name||'', bio:profile.bio||'', subjects:profile.subjects?.join(', ')||'',
        experience:profile.experience||'', zoomLink:profile.zoomLink||'',
        company:profile.company||'', address:profile.address||'', phone:profile.phone||'',
      });
      setEducation(profile.education?.length ? profile.education : [{degree:'',institution:'',year:''}]);
      setPreview(profile.profilePic||null);
    }
  },[profile]);

  const onPic=e=>{ const file=e.target.files[0];if(file){setPic(file);setPreview(URL.createObjectURL(file));} };

  const addEducation=()=>setEducation([...education,{degree:'',institution:'',year:''}]);
  const removeEducation=(i)=>setEducation(education.filter((_,idx)=>idx!==i));
  const updateEducation=(i,field,val)=>{
    const copy=[...education]; copy[i][field]=val; setEducation(copy);
  };

  const onSubmit=async e=>{
    e.preventDefault();
    const fd=new FormData();
    Object.entries(f).forEach(([k,v])=>fd.append(k,v));
    fd.append('education', JSON.stringify(education.filter(ed=>ed.degree||ed.institution)));
    if(pic)fd.append('profilePic',pic);
    const res = await dispatch(updateTutorProfile(fd));
    if (!res.error) {
      setOk(true);
      setTimeout(()=>setOk(false),3000);
    }
  };

  const doLogout=()=>{ if(window.confirm('Are you sure you want to logout?')){dispatch(logout());navigate('/login');} };

  const profileLink = `${window.location.origin}/tutors/${user?._id}`;
  const copyLink = () => { navigator.clipboard.writeText(profileLink); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const inviteLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;
  const [inviteCopied,setInviteCopied]=useState(false);
  const copyInvite = () => { navigator.clipboard.writeText(inviteLink); setInviteCopied(true); setTimeout(()=>setInviteCopied(false),2000); };

  return (
    <div className="container py-4"><div className="row justify-content-center"><div className="col-md-7">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">My Profile</h4>
        <button className="btn btn-outline-danger btn-sm" onClick={doLogout}>🚪 Logout</button>
      </div>

      {/* Shareable profile link */}
      <div className="card shadow-sm mb-3 border-primary">
        <div className="card-body">
          <label className="form-label small text-muted">🔗 Your public profile link — share it anywhere</label>
          <div className="input-group">
            <input type="text" className="form-control" value={profileLink} readOnly />
            <button className="btn btn-primary" onClick={copyLink}>{copied ? '✅ Copied!' : 'Copy'}</button>
          </div>
          <small className="text-muted">Students see your bio, subjects, education & courses — not your phone/address.</small>
        </div>
      </div>

      {/* Invite a friend */}
      <div className="card shadow-sm mb-4 border-success">
        <div className="card-body">
          <h6 className="mb-1">🎁 Invite a Friend</h6>
          <p className="text-muted small mb-2">Share your invite link — when others sign up through it, they'll be linked to you.</p>
          <div className="input-group">
            <input type="text" className="form-control" value={inviteLink} readOnly />
            <button className="btn btn-success" onClick={copyInvite}>{inviteCopied ? '✅ Copied!' : 'Copy'}</button>
          </div>
        </div>
      </div>

      {ok && <div className="alert alert-success">Profile updated!</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm"><div className="card-body p-4">
        <div className="text-center mb-4">
          <img src={preview||'https://placehold.co/100'} width={100} height={100} className="rounded-circle mb-2" style={{objectFit:'cover'}} alt=""/>
          <div><label className="btn btn-sm btn-outline-secondary" htmlFor="pic">Change Photo</label><input id="pic" type="file" accept="image/*" className="d-none" onChange={onPic}/></div>
        </div>

        <form onSubmit={onSubmit}>
          <h6 className="text-primary mb-3">Public Info <small className="text-muted">(visible to students)</small></h6>
          <div className="mb-3"><label className="form-label">Full Name</label><input type="text" className="form-control" value={f.name} onChange={e=>setF({...f,name:e.target.value})} required/></div>
          <div className="mb-3"><label className="form-label">Bio</label><textarea className="form-control" rows={3} value={f.bio} onChange={e=>setF({...f,bio:e.target.value})} placeholder="Tell students about yourself..."/></div>
          <div className="mb-3"><label className="form-label">Subjects (comma separated)</label><input type="text" className="form-control" value={f.subjects} onChange={e=>setF({...f,subjects:e.target.value})} placeholder="Math, Physics, Chemistry"/></div>
          <div className="mb-3"><label className="form-label">Experience</label><input type="text" className="form-control" value={f.experience} onChange={e=>setF({...f,experience:e.target.value})}/></div>
          <div className="mb-3"><label className="form-label">Zoom Link</label><input type="url" className="form-control" value={f.zoomLink} onChange={e=>setF({...f,zoomLink:e.target.value})} placeholder="https://zoom.us/j/..."/></div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">🎓 Education</label>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addEducation}>+ Add</button>
            </div>
            {education.map((ed,i)=>(
              <div key={i} className="row g-2 mb-2 align-items-end">
                <div className="col-5"><input type="text" className="form-control form-control-sm" placeholder="Degree (e.g. MSc Math)" value={ed.degree} onChange={e=>updateEducation(i,'degree',e.target.value)}/></div>
                <div className="col-4"><input type="text" className="form-control form-control-sm" placeholder="Institution" value={ed.institution} onChange={e=>updateEducation(i,'institution',e.target.value)}/></div>
                <div className="col-2"><input type="text" className="form-control form-control-sm" placeholder="Year" value={ed.year} onChange={e=>updateEducation(i,'year',e.target.value)}/></div>
                <div className="col-1"><button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeEducation(i)}>✕</button></div>
              </div>
            ))}
          </div>

          <hr/>
          <h6 className="text-secondary mb-3">🔒 Private Info <small className="text-muted">(admin only — never shown to students)</small></h6>
          <div className="mb-3"><label className="form-label">Company / Institution you work at</label><input type="text" className="form-control" value={f.company} onChange={e=>setF({...f,company:e.target.value})} placeholder="e.g. Beacon House School"/></div>
          <div className="mb-3"><label className="form-label">Address</label><input type="text" className="form-control" value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="House #, Street, City"/></div>
          <div className="mb-4"><label className="form-label">Phone Number</label><input type="tel" className="form-control" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="03XX-XXXXXXX"/></div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading?<span className="spinner-border spinner-border-sm me-2"/>:null}Save Profile</button>
        </form>
      </div></div>
    </div></div></div>
  );
}
