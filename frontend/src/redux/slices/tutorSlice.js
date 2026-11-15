import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
export const fetchTutorStats    = createAsyncThunk('tutor/stats',    async(_,{rejectWithValue})=>{ try{return (await API.get('/tutor/stats')).data.stats;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchTutorProfile  = createAsyncThunk('tutor/profile',  async(_,{rejectWithValue})=>{ try{return (await API.get('/tutor')).data.user;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const updateTutorProfile = createAsyncThunk('tutor/update',   async(fd,{rejectWithValue})=>{ try{return (await API.put('/tutor',fd,{headers:{'Content-Type':'multipart/form-data'}})).data.user;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchTutorSessions = createAsyncThunk('tutor/sessions', async(_,{rejectWithValue})=>{ try{return (await API.get('/sessions/tutor')).data.sessions;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const updateSession      = createAsyncThunk('tutor/updSess',  async({id,data},{rejectWithValue})=>{ try{return (await API.patch(`/sessions/${id}`,data)).data.session;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchEarnings      = createAsyncThunk('tutor/earnings', async(_,{rejectWithValue})=>{ try{return (await API.get('/payments/tutor/earnings')).data;}catch(e){return rejectWithValue(e.response?.data?.message);}});
const s = createSlice({ name:'tutor', initialState:{stats:null,profile:null,sessions:[],earnings:null,loading:false,error:null},
  reducers:{clearError(s){s.error=null;}},
  extraReducers:b=>{
    b.addCase(fetchTutorStats.fulfilled,   (s,{payload})=>{s.stats=payload;})
     .addCase(fetchTutorProfile.fulfilled, (s,{payload})=>{s.profile=payload;})
     .addCase(updateTutorProfile.pending,  s=>{s.loading=true;s.error=null;})
     .addCase(updateTutorProfile.rejected, (s,{payload})=>{s.loading=false;s.error=payload||'Failed to update profile';})
     .addCase(updateTutorProfile.fulfilled,(s,{payload})=>{s.loading=false;s.profile=payload;})
     .addCase(fetchTutorSessions.fulfilled,(s,{payload})=>{s.sessions=payload;})
     .addCase(updateSession.fulfilled,     (s,{payload})=>{s.sessions=s.sessions.map(x=>x._id===payload._id?payload:x);})
     .addCase(fetchEarnings.fulfilled,     (s,{payload})=>{s.earnings=payload;});
  }
});
export const { clearError:clearTutorError } = s.actions;
export default s.reducer;
