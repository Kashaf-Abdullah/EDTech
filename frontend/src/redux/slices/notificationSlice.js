import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchNotifications = createAsyncThunk('notif/fetch', async (_,{rejectWithValue}) => {
  try { return (await API.get('/notifications')).data; } catch(e){ return rejectWithValue(e.response?.data?.message); }
});
export const markAsRead = createAsyncThunk('notif/read', async (id,{rejectWithValue}) => {
  try { await API.patch(`/notifications/${id}/read`); return id; } catch(e){ return rejectWithValue(e.response?.data?.message); }
});
export const markAllAsRead = createAsyncThunk('notif/readAll', async (_,{rejectWithValue}) => {
  try { await API.patch('/notifications/read-all'); return true; } catch(e){ return rejectWithValue(e.response?.data?.message); }
});
export const deleteNotification = createAsyncThunk('notif/delete', async (id,{rejectWithValue}) => {
  try { await API.delete(`/notifications/${id}`); return id; } catch(e){ return rejectWithValue(e.response?.data?.message); }
});

const s = createSlice({
  name:'notification',
  initialState:{ notifications:[], unreadCount:0, loading:false },
  reducers:{},
  extraReducers:b=>{
    b.addCase(fetchNotifications.fulfilled, (s,{payload})=>{ s.notifications=payload.notifications; s.unreadCount=payload.unreadCount; })
     .addCase(markAsRead.fulfilled, (s,{payload})=>{ const n=s.notifications.find(x=>x._id===payload); if(n&&!n.isRead){n.isRead=true; s.unreadCount=Math.max(0,s.unreadCount-1);} })
     .addCase(markAllAsRead.fulfilled, (s)=>{ s.notifications.forEach(n=>n.isRead=true); s.unreadCount=0; })
     .addCase(deleteNotification.fulfilled, (s,{payload})=>{ s.notifications=s.notifications.filter(n=>n._id!==payload); });
  }
});
export default s.reducer;
