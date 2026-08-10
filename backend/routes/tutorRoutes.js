const router=require('express').Router(),{protect,authorize}=require('../middleware/auth'),{uploadProfile}=require('../config/cloudinary'),t=require('../controllers/tutorController');
router.get('/',protect,authorize('tutor'),t.getMyTutorProfile);router.put('/',protect,authorize('tutor'),uploadProfile.single('profilePic'),t.updateTutorProfile);
router.get('/stats',protect,authorize('tutor'),t.getDashboardStats);router.get('/all',t.getAllTutors);router.get('/public/:id',t.getTutorProfile);module.exports=router;
