const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: async (req, file) => 'e-commerce-bugita',
        format: async (req, file) => 'png',
        public_id: (req, file) => req.fieldName,
    },
});
const parser = multer({ storage: storage });

module.exports = {
    parser,
}