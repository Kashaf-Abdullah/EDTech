const router=require('express').Router(),{protect}=require('../middleware/auth'),{addReview,updateReview,getCourseReviews}=require('../controllers/reviewController');
router.get('/course/:courseId',getCourseReviews);router.post('/',protect,addReview);router.put('/:id',protect,updateReview);module.exports=router;
