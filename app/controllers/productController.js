const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('../config/cloudinary')
const fs = require('fs')

const getAllProducts = async (req, res) => {
    let { search, skip, take, orderBy } = req.query
    if (search) {
        search = search.split(" ").join(" & ");
    }
    const mySearch = search ? {
        OR: [
            { name: { search: search } },
            { description: { search: search } },
            { category: { name: { search: search } } }
        ]
    } : {}
    const products = await prisma.product.findMany({
        where: {
            ...mySearch
        },
        take: Number(take) || 10,
        skip: Number(skip) || 0,
        include: {
            category: true,
            productsImage: {
                select: {
                    path: true
                }
            }
        },
        orderBy: {
            updatedAt: orderBy || undefined,
        },
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
    let price = req.body.price
    price = parseInt(price, 10)
    const { name, description, categoryId, } = req.body
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

    if (req.body.category.name !== '') {
        product = {
            name,
            slug,
            description,
            price,
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
            price,
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
        res.send(200, {
            message: 'Product created successfully',
            createProduct
        })
    } catch (error) {
        res.send(500, {
            message: 'Error creating product',
            error: error.message
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