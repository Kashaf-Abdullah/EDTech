import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchEntryTests = createAsyncThunk('entryTest/fetchEntryTests', async () => {
  const res = await API.get('/entry-tests');
  return res.data;
});

export const createEntryTest = createAsyncThunk('entryTest/createEntryTest', async (payload) => {
  const res = await API.post('/entry-tests/admin', payload);
  return res.data;
});

export const fetchAdminEntryTests = createAsyncThunk('entryTest/fetchAdminEntryTests', async () => {
  const res = await API.get('/entry-tests/admin');
  return res.data;
});

export const fetchEntryTestById = createAsyncThunk('entryTest/fetchEntryTestById', async (id) => {
  const res = await API.get(`/entry-tests/admin/${id}`);
  return res.data;
});

export const updateEntryTest = createAsyncThunk('entryTest/updateEntryTest', async ({ id, payload }) => {
  const res = await API.patch(`/entry-tests/admin/${id}`, payload);
  return res.data;
});

export const deleteEntryTest = createAsyncThunk('entryTest/deleteEntryTest', async (id) => {
  const res = await API.delete(`/entry-tests/admin/${id}`);
  return { id, ...res.data };
});

export const toggleEntryTestPublish = createAsyncThunk('entryTest/toggleEntryTestPublish', async (id) => {
  const res = await API.patch(`/entry-tests/admin/${id}/toggle`);
  return res.data;
});

export const unlockEntryTest = createAsyncThunk('entryTest/unlockEntryTest', async (id) => {
  const res = await API.post(`/entry-tests/${id}/unlock`);
  return res.data;
});

export const startEntryTestAttempt = createAsyncThunk('entryTest/startEntryTestAttempt', async (id) => {
  const res = await API.post(`/entry-tests/${id}/start`);
  return res.data;
});

export const submitEntryTestAttempt = createAsyncThunk('entryTest/submitEntryTestAttempt', async ({ attemptId, answers }) => {
  const res = await API.post(`/entry-tests/attempts/${attemptId}/submit`, { answers });
  return res.data;
});

export const fetchMyEntryTestAttempts = createAsyncThunk('entryTest/fetchMyEntryTestAttempts', async () => {
  const res = await API.get('/entry-tests/attempts/my');
  return res.data;
});

export const fetchEntryTestUnlockRequests = createAsyncThunk('entryTest/fetchEntryTestUnlockRequests', async () => {
  const res = await API.get('/entry-tests/admin/unlocks');
  return res.data;
});

export const reviewEntryTestUnlock = createAsyncThunk('entryTest/reviewEntryTestUnlock', async ({ id, action, note }) => {
  const res = await API.patch(`/entry-tests/admin/unlocks/${id}`, { action, note });
  return res.data;
});

const initialState = {
  tests: [],
  adminTests: [],
  attempts: [],
  unlockRequests: [],
  selectedTest: null,
  currentAttempt: null,
  loading: false,
  error: '',
};

const entryTestSlice = createSlice({
  name: 'entryTest',
  initialState,
  reducers: {
    clearEntryTestError: (state) => { state.error = ''; },
    setSelectedTest: (state, action) => { state.selectedTest = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntryTests.pending, (state) => { state.loading = true; state.error = ''; })
      .addCase(fetchEntryTests.fulfilled, (state, action) => { state.loading = false; state.tests = action.payload.tests || []; })
      .addCase(fetchEntryTests.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed'; })
      .addCase(createEntryTest.fulfilled, (state, action) => { if (action.payload?.test) state.adminTests.unshift(action.payload.test); })
      .addCase(fetchAdminEntryTests.fulfilled, (state, action) => { state.adminTests = action.payload.tests || []; })
      .addCase(fetchEntryTestById.fulfilled, (state, action) => { if (action.payload?.test) state.selectedTest = action.payload.test; })
      .addCase(updateEntryTest.fulfilled, (state, action) => {
        if (action.payload?.test) {
          state.adminTests = state.adminTests.map(t => t._id === action.payload.test._id ? action.payload.test : t);
          state.selectedTest = action.payload.test;
        }
      })
      .addCase(deleteEntryTest.fulfilled, (state, action) => {
        state.adminTests = state.adminTests.filter(t => t._id !== action.payload.id);
        if (state.selectedTest?._id === action.payload.id) state.selectedTest = null;
      })
      .addCase(toggleEntryTestPublish.fulfilled, (state, action) => {
        if (action.payload?.test) {
          state.adminTests = state.adminTests.map(t => t._id === action.payload.test._id ? action.payload.test : t);
        }
      })
      .addCase(unlockEntryTest.fulfilled, (state, action) => {
        if (action.payload?.message) state.error = action.payload.message;
      })
      .addCase(startEntryTestAttempt.fulfilled, (state, action) => {
        state.currentAttempt = action.payload.attempt;
        state.selectedTest = action.payload.test;
      })
      .addCase(submitEntryTestAttempt.fulfilled, (state, action) => {
        state.currentAttempt = action.payload.attempt;
      })
      .addCase(fetchMyEntryTestAttempts.fulfilled, (state, action) => { state.attempts = action.payload.attempts || []; })
      .addCase(fetchEntryTestUnlockRequests.fulfilled, (state, action) => { state.unlockRequests = action.payload.payments || []; })
      .addCase(reviewEntryTestUnlock.fulfilled, (state, action) => {
        if (action.payload?.payment) {
          state.unlockRequests = state.unlockRequests.filter(r => r._id !== action.payload.payment._id);
        }
      });
  }
});

export const { clearEntryTestError, setSelectedTest } = entryTestSlice.actions;
export default entryTestSlice.reducer;
