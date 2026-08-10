const router=require('express').Router(),{protect}=require('../middleware/auth'),{getProgress,markLesson,getAllProgress}=require('../controllers/progressController');
router.get('/',protect,getAllProgress);router.get('/:courseId',protect,getProgress);router.post('/mark',protect,markLesson);module.exports=router;
