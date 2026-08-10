const router=require('express').Router(),{protect}=require('../middleware/auth');
router.get('/me',protect,(req,res)=>res.json({success:true,user:req.user}));module.exports=router;
