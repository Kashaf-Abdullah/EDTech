const Certificate = require('../models/Certificate');

exports.getMyCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ student: req.user._id })
      .populate('course','title thumbnail').sort('-issuedAt');
    res.json({ success:true, certificates: certs });
  } catch(err) { next(err); }
};

// Public route — anyone with the link (even logged out) can verify a certificate
exports.getCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId });
    if (!cert) return res.status(404).json({ success:false, message:'Certificate not found' });
    res.json({ success:true, certificate: cert });
  } catch(err) { next(err); }
};
