import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchCommunityMessages = createAsyncThunk('community/fetch', async (_,{rejectWithValue}) => {
  try { return (await API.get('/community')).data.messages; }
  catch(e){ return rejectWithValue(e.response?.data?.message); }
});

const s = createSlice({
  name: 'community',
  initialState: { messages: [], notice: null },
  reducers: {
    addCommunityMessage(state, { payload }) {
      state.messages.push(payload);
    },
    updateReactions(state, { payload }) {
      const msg = state.messages.find(m => m._id === payload.messageId);
      if (msg) msg.reactions = payload.reactions;
    },
    setNotice(state, { payload }) { state.notice = payload; },
    clearNotice(state) { state.notice = null; },
  },
  extraReducers: b => {
    b.addCase(fetchCommunityMessages.fulfilled, (s,{payload})=>{ s.messages = payload; });
  }
});

export const { addCommunityMessage, updateReactions, setNotice, clearNotice } = s.actions;
export default s.reducer;
