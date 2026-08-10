const router=require('express').Router(),{protect,authorize}=require('../middleware/auth'),a=require('../controllers/adminController');
router.use(protect,authorize('admin'));
router.get('/stats',a.getStats);router.get('/users',a.getUsers);router.patch('/users/:id/ban',a.banUser);router.patch('/users/:id/unban',a.unbanUser);router.delete('/users/:id',a.deleteUser);
router.get('/tutors',a.getPendingTutors);router.patch('/tutors/:id/approve',a.approveTutor);router.patch('/tutors/:id/reject',a.rejectTutor);
router.get('/courses',a.getAdminCourses);router.patch('/courses/:id/approve',a.approveCourse);router.patch('/courses/:id/reject',a.rejectCourse);router.patch('/courses/:id/feature',a.featureCourse);
router.get('/revenue',a.getRevenueData);module.exports=router;
