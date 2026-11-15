import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
export const fetchCourses    = createAsyncThunk('course/all',      async (p={},{rejectWithValue})=>{ try{return (await API.get('/courses?'+new URLSearchParams(p))).data;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchCourseById = createAsyncThunk('course/byId',     async (id,{rejectWithValue})=>{ try{return (await API.get(`/courses/${id}`)).data.course;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchMyCourses  = createAsyncThunk('course/my',       async (_,{rejectWithValue})=>{ try{return (await API.get('/courses/my')).data.courses;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const createCourse    = createAsyncThunk('course/create',   async (fd,{rejectWithValue})=>{ try{return (await API.post('/courses',fd,{headers:{'Content-Type':'multipart/form-data'}})).data.course;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const updateCourse    = createAsyncThunk('course/update',   async ({id,fd},{rejectWithValue})=>{ try{return (await API.put(`/courses/${id}`,fd,{headers:{'Content-Type':'multipart/form-data'}})).data.course;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const deleteCourse    = createAsyncThunk('course/delete',   async (id,{rejectWithValue})=>{ try{await API.delete(`/courses/${id}`);return id;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const togglePublish   = createAsyncThunk('course/publish',  async (id,{rejectWithValue})=>{ try{const r=await API.patch(`/courses/${id}/publish`);return{id,...r.data};}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const addLesson       = createAsyncThunk('course/addLesson',async ({id,fd},{rejectWithValue})=>{ try{return (await API.post(`/courses/${id}/lessons`,fd,{headers:{'Content-Type':'multipart/form-data'}})).data.course;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const fetchReviews    = createAsyncThunk('course/reviews',  async (id,{rejectWithValue})=>{ try{return (await API.get(`/reviews/course/${id}`)).data.reviews;}catch(e){return rejectWithValue(e.response?.data?.message);}});
export const addReview       = createAsyncThunk('course/addReview',async (d,{rejectWithValue})=>{ try{return (await API.post('/reviews',d)).data.review;}catch(e){return rejectWithValue(e.response?.data?.message);}});
const s = createSlice({ name:'course', initialState:{courses:[],myCourses:[],selected:null,reviews:[],total:0,pages:1,loading:false,error:null},
  reducers:{clearSelected(s){s.selected=null;},clearError(s){s.error=null;}},
  extraReducers:b=>{
    b.addCase(fetchCourses.pending,  s=>{s.loading=true;}).addCase(fetchCourses.fulfilled,(s,{payload})=>{s.loading=false;s.courses=payload.courses;s.total=payload.total;s.pages=payload.pages;}).addCase(fetchCourses.rejected,(s,{payload})=>{s.loading=false;s.error=payload;})
     .addCase(fetchCourseById.pending,s=>{s.loading=true;}).addCase(fetchCourseById.fulfilled,(s,{payload})=>{s.loading=false;s.selected=payload;}).addCase(fetchCourseById.rejected,(s,{payload})=>{s.loading=false;s.error=payload;})
     .addCase(fetchMyCourses.fulfilled,(s,{payload})=>{s.myCourses=payload;})
     .addCase(createCourse.pending,s=>{s.loading=true;s.error=null;}).addCase(createCourse.rejected,(s,{payload})=>{s.loading=false;s.error=payload||'Failed to create course';}).addCase(createCourse.fulfilled,(s,{payload})=>{s.loading=false;s.myCourses.unshift(payload);})
     .addCase(updateCourse.pending,s=>{s.loading=true;s.error=null;}).addCase(updateCourse.rejected,(s,{payload})=>{s.loading=false;s.error=payload||'Failed to update course';}).addCase(updateCourse.fulfilled,(s,{payload})=>{s.loading=false;s.myCourses=s.myCourses.map(c=>c._id===payload._id?payload:c);if(s.selected?._id===payload._id)s.selected=payload;})
     .addCase(deleteCourse.rejected,(s,{payload})=>{s.error=payload||'Failed to delete course';}).addCase(deleteCourse.fulfilled,(s,{payload})=>{s.myCourses=s.myCourses.filter(c=>c._id!==payload);})
     .addCase(togglePublish.fulfilled,(s,{payload})=>{const c=s.myCourses.find(c=>c._id===payload.id);if(c)c.isPublished=payload.isPublished;})
     .addCase(addLesson.pending,s=>{s.error=null;}).addCase(addLesson.rejected,(s,{payload})=>{s.error=payload||'Failed to add lesson';}).addCase(addLesson.fulfilled,(s,{payload})=>{s.selected=payload;const i=s.myCourses.findIndex(c=>c._id===payload._id);if(i>-1)s.myCourses[i]=payload;})
     .addCase(fetchReviews.fulfilled,(s,{payload})=>{s.reviews=payload;})
     .addCase(addReview.fulfilled,(s,{payload})=>{s.reviews.unshift(payload);});
  }
});
export const { clearSelected, clearError } = s.actions;
export default s.reducer;
