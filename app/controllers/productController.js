const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllProducts = async (req, res) => {
    res.send(200, {
        name: "Product 1"
    })
}

const addProduct = async (req, res) => {
    let product
    if (req.body.category) {
        product = {
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            category: {
                create: {
                    name: req.body.category.name,
                    image: req.body.category.image,
                }
            }
        }
    } else {
        product = {
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            categoryId: parseInt(req.body.categoryId)
        }
    }

    const createProduct = await prisma.product.create({ data: product, include: { category: true } })
    res.send(createProduct)
}

module.exports = {
    getAllProducts,
    addProduct
}