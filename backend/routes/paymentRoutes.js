const router=require('express').Router(),{protect,authorize}=require('../middleware/auth'),{uploadScreenshot}=require('../config/cloudinary'),p=require('../controllers/paymentController');
router.post('/stripe/intent',protect,p.createPaymentIntent);router.post('/stripe/confirm',protect,p.confirmStripePayment);
router.post('/manual',protect,uploadScreenshot.single('screenshot'),p.submitManualPayment);
router.get('/my',protect,p.getMyPayments);router.get('/admin/pending',protect,authorize('admin'),p.getPendingPayments);
router.patch('/admin/:id',protect,authorize('admin'),p.reviewPayment);router.get('/tutor/earnings',protect,authorize('tutor'),p.getTutorEarnings);
module.exports=router;
