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

// products
router.get('/products', authController.authorize, productController.getAllProducts)
router.get('/product/:productId', productController.getSingleProduct)
router.post('/addproduct', upload.array('image'), productController.addProduct)
router.put('/product/:productId/update', productController.updateProduct)
router.delete('/product/:productId/delete', productController.deleteProduct)

// categories
router.get('/categories', categoryController.getAllCategories)
router.get('/category/:categoryId', categoryController.getSingleCategories)
router.post('/addcategory', categoryController.addCategory)
router.put('/category/:categoryId/update', categoryController.updateCategory)
router.delete('/category/:categoryId/delete', categoryController.deleteCategory)

module.exports = router