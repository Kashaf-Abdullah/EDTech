import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchConversations = createAsyncThunk('chat/list', async (_,{rejectWithValue}) => {
  try { return (await API.get('/chat')).data.conversations; } catch(e){ return rejectWithValue(e.response?.data?.message); }
});
export const fetchMessages = createAsyncThunk('chat/messages', async (conversationId,{rejectWithValue}) => {
  try { return { conversationId, messages: (await API.get(`/chat/${conversationId}/messages`)).data.messages }; }
  catch(e){ return rejectWithValue(e.response?.data?.message); }
});
export const startConversation = createAsyncThunk('chat/start', async (userId,{rejectWithValue}) => {
  try { return (await API.post('/chat/start', { userId })).data.conversation; }
  catch(e){ return rejectWithValue(e.response?.data?.message); }
});
export const checkChatAccess = createAsyncThunk('chat/checkAccess', async (userId,{rejectWithValue}) => {
  try { return (await API.get(`/chat/access/${userId}`)).data; }
  catch(e){ return rejectWithValue(e.response?.data?.message); }
});

const s = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    onlineUsers: {},
    typingUsers: {},
    loading: false,
    error: null,
    accessCheck: null,
  },
  reducers: {
    setActiveConversation(state, { payload }) { state.activeConversation = payload; state.messages = []; },
    addIncomingMessage(state, { payload }) {
      if (state.activeConversation?._id === payload.conversation) {
        state.messages.push(payload);
      }
      const convo = state.conversations.find(c => c._id === payload.conversation);
      if (convo) {
        convo.lastMessage = payload.text;
        convo.lastMessageAt = payload.createdAt;
        if (state.activeConversation?._id !== payload.conversation) convo.unreadCount = (convo.unreadCount||0) + 1;
      }
    },
    setPresence(state, { payload }) { state.onlineUsers[payload.userId] = payload.online; },
    setTyping(state, { payload }) { state.typingUsers[payload.userId] = payload.typing; },
    clearError(state) { state.error = null; },
    clearAccessCheck(state) { state.accessCheck = null; },
  },
  extraReducers: b => {
    b.addCase(fetchConversations.fulfilled, (s,{payload})=>{ s.conversations = payload; })
     .addCase(fetchMessages.fulfilled, (s,{payload})=>{ s.messages = payload.messages; })
     .addCase(startConversation.fulfilled, (s,{payload})=>{
        s.activeConversation = payload;
        if (!s.conversations.find(c=>c._id===payload._id)) s.conversations.unshift(payload);
     })
     .addCase(startConversation.rejected, (s,{payload})=>{ s.error = payload; })
     .addCase(checkChatAccess.fulfilled, (s,{payload})=>{ s.accessCheck = payload; })
     .addCase(checkChatAccess.rejected, (s,{payload})=>{ s.accessCheck = { allowed:false, reason:payload }; });
  }
});

export const { setActiveConversation, addIncomingMessage, setPresence, setTyping, clearError, clearAccessCheck } = s.actions;
export default s.reducer;
