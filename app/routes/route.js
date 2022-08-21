const express = require("express");
const router = express.Router();
const productController = require('../controllers/productController')
const upload = require('../middlewares/multer')

// check route
router.get('/', (req, res) => {
    res.send(200, {
        message: 'Hello World'
    })
})

// products
router.get('/products', productController.getAllProducts)
router.get('/product/:productId', productController.getSingleProduct)
router.post('/addproduct', upload.array('image'), productController.addProduct)
router.put('/product/:productId/update', productController.updateProduct)
router.delete('/product/:productId/delete', productController.deleteProduct)

module.exports = router