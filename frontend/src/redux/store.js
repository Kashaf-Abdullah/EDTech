import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import courseReducer       from './slices/courseSlice';
import enrollReducer       from './slices/enrollSlice';
import adminReducer        from './slices/adminSlice';
import tutorReducer        from './slices/tutorSlice';
import notificationReducer from './slices/notificationSlice';
import chatReducer         from './slices/chatSlice';
import settingsReducer     from './slices/settingsSlice';
import communityReducer    from './slices/communitySlice';
import entryTestReducer    from './slices/entryTestSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    enroll: enrollReducer,
    admin: adminReducer,
    tutor: tutorReducer,
    notification: notificationReducer,
    chat: chatReducer,
    settings: settingsReducer,
    community: communityReducer,
    entryTest: entryTestReducer,
  }
});
