const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllProducts = async (req, res) => {
    const products = await prisma.product.findMany({
        include: {
            category: true
        }
    })
    res.send(200, products)
}

const getSingleProduct = async (req, res) => {
    const productId = parseInt(req.params.productId)
    try {
        const product = await prisma.product.findUniqueOrThrow({
            where: {
                id: productId
            },
            include: {
                category: true
            }
        })
        res.send(200, product)
    } catch (error) {
        res.send(error)
    }
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

    try {
        const createProduct = await prisma.product.create({ data: product, include: { category: true } })
        res.send(200, createProduct)
    } catch (error) {
        res.send(error)
    }
}

const updateProduct = async (req, res) => {
    const productId = parseInt(req.params.productId)
    try {
        const updateProduct = await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                name: req.body.name,
                description: req.body.description,
                categoryId: req.body.categoryId,
                image: req.body.image,
            },
            include: {
                category: true
            }
        })
        res.send(200, updateProduct)
    } catch (error) {
        res.send(error)
    }
}

const deleteProduct = async (req, res) => {
    const productId = parseInt(req.params.productId)
    try {
        const deleteProduct = await prisma.product.delete({
            where: {
                id: productId
            }
        })
        res.send(200, {
            message: "Successfully deleted.",
            product: deleteProduct
        })
    } catch (error) {
        res.send(error)
    }
}

module.exports = {
    getAllProducts,
    addProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct
}