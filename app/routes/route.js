const express = require("express");
const router = express.Router();
const productController = require('../controllers/productController')

// check route
router.get('/', (req, res) => {
    res.send(200, {
        message: 'Hello World'
    })
})

// products
router.get('/products', productController.getAllProducts)
router.post('/addproduct', productController.addProduct)

module.exports = router