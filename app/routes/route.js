const express = require("express");
const router = express.Router();
const { productController, categoryController, authController } = require('../controllers')
const upload = require('../middlewares/multer')

// check route
router.get('/', (req, res) => {
    res.send(200, {
        message: 'Server is running!'
    })
})

// auth
router.post('/auth/signup', authController.signUp)
router.post('/auth/login', authController.login)
router.post('/auth/me', authController.me)

// products
router.get('/products', productController.getAllProducts)
router.get('/product/:productId', productController.getSingleProduct)
router.post('/addproduct', authController.authorize, upload.array('image'), productController.addProduct)
router.put('/product/:productId/update', authController.authorize, productController.updateProduct)
router.delete('/product/:productId/delete', authController.authorize, productController.deleteProduct)

// categories
router.get('/categories', categoryController.getAllCategories)
router.get('/category/:categoryId', categoryController.getSingleCategories)
router.post('/addcategory', authController.authorize, categoryController.addCategory)
router.put('/category/:categoryId/update', authController.authorize, categoryController.updateCategory)
router.delete('/category/:categoryId/delete', authController.authorize, categoryController.deleteCategory)

// test cloudinary
var cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'storage-ecommerce-bugita/product-images',
    },
});
const parser = multer({ storage: storage });
router.post('/upload-file', parser.array('image'), function (req, res, next) {
    try {
        res.json(req.files)
    } catch (error) {
        res.json(error.message)
    }
})

module.exports = router