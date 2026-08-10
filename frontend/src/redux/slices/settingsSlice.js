import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchSettings = createAsyncThunk('settings/get', async (_,{rejectWithValue}) => {
  try { return (await API.get('/settings')).data.settings; } catch(e){ return rejectWithValue(e.response?.data?.message); }
});
export const updateSettings = createAsyncThunk('settings/update', async (fd,{rejectWithValue}) => {
  try { return (await API.put('/settings', fd, { headers:{'Content-Type':'multipart/form-data'} })).data.settings; }
  catch(e){ return rejectWithValue(e.response?.data?.message); }
});

const s = createSlice({
  name: 'settings',
  initialState: { settings: null, loading: false, error: null },
  reducers: { clearError(s){ s.error = null; } },
  extraReducers: b => {
    b.addCase(fetchSettings.fulfilled, (s,{payload})=>{ s.settings = payload; })
     .addCase(updateSettings.pending, s=>{ s.loading=true; s.error=null; })
     .addCase(updateSettings.rejected, (s,{payload})=>{ s.loading=false; s.error=payload; })
     .addCase(updateSettings.fulfilled, (s,{payload})=>{ s.loading=false; s.settings=payload; });
  }
});
export const { clearError: clearSettingsError } = s.actions;
export default s.reducer;
