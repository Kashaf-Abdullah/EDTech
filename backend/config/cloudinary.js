const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const makeStorage = (folder, formats, resource_type = 'auto') =>
  new CloudinaryStorage({ cloudinary, params: { folder: `edtech/${folder}`, allowed_formats: formats, resource_type } });

const limit = (mb) => ({ fileSize: mb * 1024 * 1024 });

module.exports = {
  uploadProfile:    multer({ storage: makeStorage('profiles',    ['jpg','jpeg','png','webp']), limits: limit(5) }),
  uploadThumbnail:  multer({ storage: makeStorage('thumbnails',  ['jpg','jpeg','png','webp']), limits: limit(10) }),
  uploadVideo:      multer({ storage: makeStorage('videos',      ['mp4','webm','mov'], 'video'), limits: limit(500) }),
  uploadPdf:        multer({ storage: makeStorage('pdfs',        ['pdf'], 'raw'), limits: limit(50) }),
  uploadDoc:        multer({ storage: makeStorage('docs',        ['jpg','jpeg','png','pdf']), limits: limit(10) }),
  uploadScreenshot: multer({ storage: makeStorage('payments',    ['jpg','jpeg','png']), limits: limit(5) }),
  cloudinary,
};
