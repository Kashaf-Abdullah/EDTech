import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

const errMsg = (e, fallback = 'Request failed') => e.response?.data?.message || e.message || fallback;

export const fetchEntryTests = createAsyncThunk('entryTest/fetchEntryTests', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/entry-tests');
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to load entry tests'));
  }
});

export const createEntryTest = createAsyncThunk('entryTest/createEntryTest', async (payload, { rejectWithValue }) => {
  try {
    const res = await API.post('/entry-tests/admin', payload);
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to create entry test'));
  }
});

export const fetchAdminEntryTests = createAsyncThunk('entryTest/fetchAdminEntryTests', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/entry-tests/admin');
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to load admin tests'));
  }
});

export const fetchEntryTestById = createAsyncThunk('entryTest/fetchEntryTestById', async (id, { rejectWithValue }) => {
  try {
    const res = await API.get(`/entry-tests/admin/${id}`);
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to load test details'));
  }
});

export const updateEntryTest = createAsyncThunk('entryTest/updateEntryTest', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await API.patch(`/entry-tests/admin/${id}`, payload);
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to update entry test'));
  }
});

export const deleteEntryTest = createAsyncThunk('entryTest/deleteEntryTest', async (id, { rejectWithValue }) => {
  try {
    const res = await API.delete(`/entry-tests/admin/${id}`);
    return { id, ...res.data };
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to delete entry test'));
  }
});

export const toggleEntryTestPublish = createAsyncThunk('entryTest/toggleEntryTestPublish', async (id, { rejectWithValue }) => {
  try {
    const res = await API.patch(`/entry-tests/admin/${id}/toggle`);
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to toggle visibility'));
  }
});

export const unlockEntryTest = createAsyncThunk('entryTest/unlockEntryTest', async (arg, { rejectWithValue }) => {
  try {
    const id = typeof arg === 'string' ? arg : arg.id;
    const formData = typeof arg === 'string' ? null : arg.formData;
    const res = formData
      ? await API.post(`/entry-tests/${id}/unlock`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : await API.post(`/entry-tests/${id}/unlock`);
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to submit unlock request'));
  }
});

export const startEntryTestAttempt = createAsyncThunk('entryTest/startEntryTestAttempt', async (id, { rejectWithValue }) => {
  try {
    const res = await API.post(`/entry-tests/${id}/start`);
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Unable to start test'));
  }
});

export const submitEntryTestAttempt = createAsyncThunk('entryTest/submitEntryTestAttempt', async ({ attemptId, answers }, { rejectWithValue }) => {
  try {
    const res = await API.post(`/entry-tests/attempts/${attemptId}/submit`, { answers });
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to submit test'));
  }
});

export const fetchMyEntryTestAttempts = createAsyncThunk('entryTest/fetchMyEntryTestAttempts', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/entry-tests/attempts/my');
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to load attempts'));
  }
});

export const fetchEntryTestUnlockRequests = createAsyncThunk('entryTest/fetchEntryTestUnlockRequests', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/entry-tests/admin/unlocks');
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to load unlock requests'));
  }
});

export const reviewEntryTestUnlock = createAsyncThunk('entryTest/reviewEntryTestUnlock', async ({ id, action, note }, { rejectWithValue }) => {
  try {
    const res = await API.patch(`/entry-tests/admin/unlocks/${id}`, { action, note });
    return res.data;
  } catch (e) {
    return rejectWithValue(errMsg(e, 'Failed to review request'));
  }
});

const initialState = {
  tests: [],
  adminTests: [],
  attempts: [],
  unlockRequests: [],
  selectedTest: null,
  currentAttempt: null,
  loading: false,
  submitting: false,
  error: '',
  notice: '',
};

const entryTestSlice = createSlice({
  name: 'entryTest',
  initialState,
  reducers: {
    clearEntryTestError: (state) => { state.error = ''; },
    clearEntryTestNotice: (state) => { state.notice = ''; },
    setSelectedTest: (state, action) => { state.selectedTest = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntryTests.pending, (state) => { state.loading = true; state.error = ''; })
      .addCase(fetchEntryTests.fulfilled, (state, action) => { state.loading = false; state.tests = action.payload.tests || []; })
      .addCase(fetchEntryTests.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message || 'Failed'; })
      .addCase(createEntryTest.pending, (state) => { state.submitting = true; state.error = ''; state.notice = ''; })
      .addCase(createEntryTest.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload?.test) state.adminTests.unshift(action.payload.test);
        state.notice = 'Entry test created!';
      })
      .addCase(createEntryTest.rejected, (state, action) => { state.submitting = false; state.error = action.payload || 'Failed to create test'; })
      .addCase(fetchAdminEntryTests.fulfilled, (state, action) => { state.adminTests = action.payload.tests || []; })
      .addCase(fetchEntryTestById.fulfilled, (state, action) => { if (action.payload?.test) state.selectedTest = action.payload.test; })
      .addCase(updateEntryTest.pending, (state) => { state.submitting = true; state.error = ''; state.notice = ''; })
      .addCase(updateEntryTest.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload?.test) {
          state.adminTests = state.adminTests.map(t => t._id === action.payload.test._id ? action.payload.test : t);
          state.selectedTest = action.payload.test;
        }
        state.notice = 'Entry test updated!';
      })
      .addCase(updateEntryTest.rejected, (state, action) => { state.submitting = false; state.error = action.payload || 'Failed to update test'; })
      .addCase(deleteEntryTest.fulfilled, (state, action) => {
        state.adminTests = state.adminTests.filter(t => t._id !== action.payload.id);
        if (state.selectedTest?._id === action.payload.id) state.selectedTest = null;
      })
      .addCase(deleteEntryTest.rejected, (state, action) => { state.error = action.payload || 'Failed to delete test'; })
      .addCase(toggleEntryTestPublish.fulfilled, (state, action) => {
        if (action.payload?.test) {
          state.adminTests = state.adminTests.map(t => t._id === action.payload.test._id ? action.payload.test : t);
        }
      })
      .addCase(unlockEntryTest.pending, (state) => { state.submitting = true; state.error = ''; state.notice = ''; })
      .addCase(unlockEntryTest.fulfilled, (state, action) => {
        state.submitting = false;
        state.notice = action.payload?.message || 'Payment submitted for admin review!';
      })
      .addCase(unlockEntryTest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || action.error.message || 'Unlock request failed';
      })
      .addCase(startEntryTestAttempt.pending, (state) => { state.error = ''; state.notice = ''; })
      .addCase(startEntryTestAttempt.fulfilled, (state, action) => {
        state.currentAttempt = action.payload.attempt;
        state.selectedTest = action.payload.test;
      })
      .addCase(startEntryTestAttempt.rejected, (state, action) => {
        state.error = action.payload || action.error.message || 'Could not start test';
      })
      .addCase(submitEntryTestAttempt.pending, (state) => { state.submitting = true; state.error = ''; })
      .addCase(submitEntryTestAttempt.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentAttempt = action.payload.attempt;
        if (action.payload?.test) state.selectedTest = action.payload.test;
      })
      .addCase(submitEntryTestAttempt.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || action.error.message || 'Failed to submit test';
      })
      .addCase(fetchMyEntryTestAttempts.fulfilled, (state, action) => { state.attempts = action.payload.attempts || []; })
      .addCase(fetchEntryTestUnlockRequests.fulfilled, (state, action) => { state.unlockRequests = action.payload.payments || []; })
      .addCase(reviewEntryTestUnlock.fulfilled, (state, action) => {
        if (action.payload?.payment) {
          state.unlockRequests = state.unlockRequests.filter(r => r._id !== action.payload.payment._id);
        }
      })
      .addCase(reviewEntryTestUnlock.rejected, (state, action) => {
        state.error = action.payload || 'Failed to review request';
      });
  }
});

export const { clearEntryTestError, clearEntryTestNotice, setSelectedTest } = entryTestSlice.actions;
export default entryTestSlice.reducer;
