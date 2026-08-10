const router=require('express').Router(),passport=require('passport'),{register,login,getMe,updateProfile,googleCallback}=require('../controllers/authController'),{protect}=require('../middleware/auth'),{uploadProfile}=require('../config/cloudinary');
router.post('/register',register);router.post('/login',login);router.get('/me',protect,getMe);router.put('/profile',protect,uploadProfile.single('profilePic'),updateProfile);
router.get('/google',passport.authenticate('google',{scope:['profile','email'],session:false}));
router.get('/google/callback',passport.authenticate('google',{session:false,failureRedirect:'/login'}),googleCallback);
module.exports=router;
