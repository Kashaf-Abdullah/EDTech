import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
const saved = { user: JSON.parse(localStorage.getItem('user')||'null'), token: localStorage.getItem('token')||null };
const persist = (token, user) => { localStorage.setItem('token',token); localStorage.setItem('user',JSON.stringify(user)); };
export const registerUser = createAsyncThunk('auth/register', async (d,{rejectWithValue}) => { try { return (await API.post('/auth/register',d)).data; } catch(e) { return rejectWithValue(e.response?.data?.message||'Failed'); }});
export const loginUser   = createAsyncThunk('auth/login',    async (d,{rejectWithValue}) => { try { return (await API.post('/auth/login',d)).data;    } catch(e) { return rejectWithValue(e.response?.data?.message||'Invalid credentials'); }});
export const fetchMe     = createAsyncThunk('auth/me',       async (_,{rejectWithValue}) => { try { return (await API.get('/auth/me')).data;           } catch(e) { return rejectWithValue(e.response?.data?.message); }});
export const updateMyProfile = createAsyncThunk('auth/update', async (fd,{rejectWithValue}) => { try { return (await API.put('/auth/profile',fd,{headers:{'Content-Type':'multipart/form-data'}})).data; } catch(e) { return rejectWithValue(e.response?.data?.message); }});
const authSlice = createSlice({
  name:'auth', initialState:{ ...saved, loading:false, error:null },
  reducers:{ logout(s){ s.user=null;s.token=null;localStorage.clear(); }, clearError(s){ s.error=null; }, setCredentials(s,{payload}){ s.user=payload.user;s.token=payload.token;persist(payload.token,payload.user); } },
  extraReducers: b => {
    const ok = (s,{payload}) => { s.loading=false;s.user=payload.user;s.token=payload.token;persist(payload.token,payload.user); };
    b.addCase(registerUser.pending, s=>{s.loading=true;s.error=null;}).addCase(registerUser.rejected,(s,{payload})=>{s.loading=false;s.error=payload;}).addCase(registerUser.fulfilled,ok)
     .addCase(loginUser.pending,    s=>{s.loading=true;s.error=null;}).addCase(loginUser.rejected,   (s,{payload})=>{s.loading=false;s.error=payload;}).addCase(loginUser.fulfilled,ok)
     .addCase(fetchMe.fulfilled,    (s,{payload})=>{ s.user=payload.user; localStorage.setItem('user',JSON.stringify(payload.user)); })
     .addCase(updateMyProfile.fulfilled,(s,{payload})=>{ s.user=payload.user; localStorage.setItem('user',JSON.stringify(payload.user)); });
  }
});
export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
