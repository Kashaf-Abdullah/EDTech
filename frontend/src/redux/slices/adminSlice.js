import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
export const fetchAdminStats   = createAsyncThunk('admin/stats',    async(_,{rejectWithValue})=>{ try{return (await API.get('/admin/stats')).data.stats;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchAdminUsers   = createAsyncThunk('admin/users',    async(p={},{rejectWithValue})=>{ try{return (await API.get('/admin/users?'+new URLSearchParams(p))).data;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchAdminTutors  = createAsyncThunk('admin/tutors',   async(st='pending',{rejectWithValue})=>{ try{return (await API.get(`/admin/tutors?status=${st}`)).data;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const approveTutor      = createAsyncThunk('admin/appTutor', async(id,{rejectWithValue})=>{ try{await API.patch(`/admin/tutors/${id}/approve`);return id;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const rejectTutor       = createAsyncThunk('admin/rejTutor', async({id,reason},{rejectWithValue})=>{ try{await API.patch(`/admin/tutors/${id}/reject`,{reason});return id;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchAdminCourses = createAsyncThunk('admin/courses',  async(a='false',{rejectWithValue})=>{ try{return (await API.get(`/admin/courses?approved=${a}`)).data;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const approveCourse     = createAsyncThunk('admin/appCourse',async(id,{rejectWithValue})=>{ try{await API.patch(`/admin/courses/${id}/approve`);return id;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const featureCourse     = createAsyncThunk('admin/featCourse',async(id,{rejectWithValue})=>{ try{return (await API.patch(`/admin/courses/${id}/feature`)).data;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const banUser           = createAsyncThunk('admin/ban',      async(id,{rejectWithValue})=>{ try{await API.patch(`/admin/users/${id}/ban`);return id;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const unbanUser         = createAsyncThunk('admin/unban',    async(id,{rejectWithValue})=>{ try{await API.patch(`/admin/users/${id}/unban`);return id;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchPendingPay   = createAsyncThunk('admin/payments', async(_,{rejectWithValue})=>{ try{return (await API.get('/payments/admin/pending')).data.payments;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const reviewPayment     = createAsyncThunk('admin/revPay',   async({id,action,note},{rejectWithValue})=>{ try{await API.patch(`/payments/admin/${id}`,{action,note});return id;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchRevenue      = createAsyncThunk('admin/revenue',  async(_,{rejectWithValue})=>{ try{return (await API.get('/admin/revenue')).data.payments;}catch(e){return rejectWithValue(e.response?.data?.message);}});
const s = createSlice({ name:'admin', initialState:{stats:null,users:[],tutors:[],courses:[],payments:[],revenue:[],total:0,loading:false,error:null},
  reducers:{clearError(s){s.error=null;}},
  extraReducers:b=>{
    b.addCase(fetchAdminStats.fulfilled,  (s,{payload})=>{s.stats=payload;})
     .addCase(fetchAdminUsers.fulfilled,  (s,{payload})=>{s.users=payload.users;s.total=payload.total;})
     .addCase(fetchAdminTutors.fulfilled, (s,{payload})=>{s.tutors=payload.tutors;})
     .addCase(approveTutor.fulfilled,     (s,{payload})=>{s.tutors=s.tutors.filter(t=>t._id!==payload);})
     .addCase(rejectTutor.fulfilled,      (s,{payload})=>{s.tutors=s.tutors.filter(t=>t._id!==payload);})
     .addCase(fetchAdminCourses.fulfilled,(s,{payload})=>{s.courses=payload.courses;})
     .addCase(approveCourse.fulfilled,    (s,{payload})=>{s.courses=s.courses.filter(c=>c._id!==payload);})
     .addCase(featureCourse.fulfilled,    (s,{payload,meta})=>{s.courses=s.courses.map(c=>c._id===meta.arg?{...c,isFeatured:payload.isFeatured}:c);})
     .addCase(banUser.fulfilled,          (s,{payload})=>{s.users=s.users.map(u=>u._id===payload?{...u,isBanned:true}:u);})
     .addCase(unbanUser.fulfilled,        (s,{payload})=>{s.users=s.users.map(u=>u._id===payload?{...u,isBanned:false}:u);})
     .addCase(fetchPendingPay.fulfilled,  (s,{payload})=>{s.payments=payload;})
     .addCase(reviewPayment.fulfilled,    (s,{payload})=>{s.payments=s.payments.filter(p=>p._id!==payload);})
     .addCase(fetchRevenue.fulfilled,     (s,{payload})=>{s.revenue=payload;});
  }
});
export const { clearError:clearAdminError } = s.actions;
export default s.reducer;
