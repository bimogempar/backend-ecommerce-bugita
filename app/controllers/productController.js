const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('../config/cloudinary')
const fs = require('fs')

const getAllProducts = async (req, res) => {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            productsImage: {
                select: {
                    path: true
                }
            }
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
    const { name, description, categoryId } = req.body
    const slug = name.replace(/\s+/g, '-').toLowerCase()
    const urls = []

    if (req.files) {
        const uploader = async (path) => await cloudinary.uploads(path, `storage-ecommerce-bugita/product-images/${slug}`)
        const files = req.files
        for (const file of files) {
            const { path } = file
            const newPath = await uploader(path)
            urls.push({ path: newPath.url })
            fs.unlinkSync(path)
        }
    }

    if (req.body.category) {
        product = {
            name,
            slug,
            description,
            category: {
                create: {
                    name: req.body.category.name,
                }
            },
            productsImage: {
                createMany: {
                    data: urls
                }
            }
        }
    } else {
        product = {
            name,
            slug,
            description,
            categoryId: parseInt(categoryId),
            productsImage: {
                createMany: {
                    data: urls
                }
            }
        }
    }

    try {
        const createProduct = await prisma.product.create({ data: product, include: { category: true, productsImage: true } })
        res.send(200, createProduct)
    } catch (error) {
        res.send(500, {
            message: 'error creating product',
        })
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
            },
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
    deleteProduct,
}