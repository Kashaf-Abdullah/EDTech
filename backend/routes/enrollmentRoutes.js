const router=require('express').Router(),{protect}=require('../middleware/auth'),{getMyEnrollments,checkEnrollment}=require('../controllers/enrollmentController');
router.get('/',protect,getMyEnrollments);router.get('/check/:courseId',protect,checkEnrollment);module.exports=router;
