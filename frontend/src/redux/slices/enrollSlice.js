import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
export const fetchEnrollments   = createAsyncThunk('enroll/my',      async (_,{rejectWithValue})=>{ try{return (await API.get('/enrollments')).data.enrollments;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const checkEnrollment    = createAsyncThunk('enroll/check',   async (id,{rejectWithValue})=>{ try{return (await API.get(`/enrollments/check/${id}`)).data.isEnrolled;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchProgress      = createAsyncThunk('enroll/progress',async (id,{rejectWithValue})=>{ try{return (await API.get(`/progress/${id}`)).data.progress;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const markLessonComplete = createAsyncThunk('enroll/mark',    async (d,{rejectWithValue})=>{ try{return (await API.post('/progress/mark',d)).data.progress;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchAllProgress   = createAsyncThunk('enroll/allProg', async (_,{rejectWithValue})=>{ try{return (await API.get('/progress')).data.progresses;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchCertificates  = createAsyncThunk('enroll/certs',   async (_,{rejectWithValue})=>{ try{return (await API.get('/certificates')).data.certificates;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const submitManualPay    = createAsyncThunk('enroll/manual',  async (fd,{rejectWithValue})=>{ try{return (await API.post('/payments/manual',fd,{headers:{'Content-Type':'multipart/form-data'}})).data;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchMyPayments    = createAsyncThunk('enroll/payments',async (_,{rejectWithValue})=>{ try{return (await API.get('/payments/my')).data.payments;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchSessions      = createAsyncThunk('enroll/sessions',async (_,{rejectWithValue})=>{ try{return (await API.get('/sessions/student')).data.sessions;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const bookSession        = createAsyncThunk('enroll/book',    async (d,{rejectWithValue})=>{ try{return (await API.post('/sessions',d)).data.session;}catch(e){return rejectWithValue(e.response?.data?.message);}});
const s = createSlice({ name:'enroll', initialState:{enrollments:[],isEnrolled:false,progress:null,allProgress:[],certificates:[],payments:[],sessions:[],loading:false,error:null,paymentSuccess:false},
  reducers:{clearPaymentSuccess(s){s.paymentSuccess=false;},clearError(s){s.error=null;}},
  extraReducers:b=>{
    b.addCase(fetchEnrollments.fulfilled,  (s,{payload})=>{s.enrollments=payload;})
     .addCase(checkEnrollment.fulfilled,   (s,{payload})=>{s.isEnrolled=payload;})
     .addCase(fetchProgress.fulfilled,     (s,{payload})=>{s.progress=payload;})
     .addCase(markLessonComplete.fulfilled,(s,{payload})=>{s.progress=payload;})
     .addCase(fetchAllProgress.fulfilled,  (s,{payload})=>{s.allProgress=payload;})
     .addCase(fetchCertificates.fulfilled, (s,{payload})=>{s.certificates=payload;})
     .addCase(submitManualPay.pending,     s=>{s.loading=true;s.error=null;})
     .addCase(submitManualPay.rejected,    (s,{payload})=>{s.loading=false;s.error=payload;})
     .addCase(submitManualPay.fulfilled,   s=>{s.loading=false;s.paymentSuccess=true;})
     .addCase(fetchMyPayments.fulfilled,   (s,{payload})=>{s.payments=payload;})
     .addCase(fetchSessions.fulfilled,     (s,{payload})=>{s.sessions=payload;})
     .addCase(bookSession.fulfilled,       (s,{payload})=>{s.sessions.unshift(payload);});
  }
});
export const { clearPaymentSuccess, clearError:clearEnrollError } = s.actions;
export default s.reducer;
