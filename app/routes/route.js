const express = require("express");
const router = express.Router();
const productController = require('../controllers/productController')
const upload = require('../middlewares/multer')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')

// check route
router.get('/', (req, res) => {
    res.send(200, {
        message: 'Hello World'
    })
})

// testing upload image
router.post('/upload', upload.array('image'), async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path, "storage-ecommerce-bugita")

    if (req.method === 'POST') {
        const urls = []
        const files = req.files
        for (const file of files) {
            const { path } = file
            const newPath = await uploader(path)
            urls.push(newPath)
            fs.unlinkSync(path)
        }

        res.status(200).json({
            message: 'OK',
            files: urls
        })
    } else {
        res.status(405).json({
            err: "Method Not Allowed",
        })
    }
})

// products
router.get('/products', productController.getAllProducts)
router.get('/product/:productId', productController.getSingleProduct)
router.post('/addproduct', productController.addProduct)
router.put('/product/:productId/update', productController.updateProduct)
router.delete('/product/:productId/delete', productController.deleteProduct)

module.exports = router