const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('../config/multer-cloudinary')
const cloudinaryv2 = require('cloudinary').v2;
const fs = require('fs')

const getAllProducts = async (req, res) => {
    let { search, orderBy } = req.query
    if (search) {
        search = search.split(" ").join(" & ");
    }

    // pagination
    const query = req.query;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const last_page = req.query.last_page;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = {};
    const totalCount = await prisma.product.count();
    const totalPage = Math.ceil(totalCount / limit);
    const currentPage = page || 0;

    const mySearch = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } }
        ]
    } : {}

    try {
        if (page < 0) {
            return res.status(400).json('Not provided')
        } else if (page === 1 && !last_page) {
            result.totalCount = totalCount;
            result.totalPage = totalPage;
            result.currentPage = currentPage;
            result.next = {
                page: page + 1,
                limit: limit,
            };
            result.paginateData = await prisma.product.findMany({
                where: {
                    ...mySearch
                },
                take: limit,
                skip: startIndex,
                orderBy: {
                    updatedAt: orderBy || "desc",
                },
                include: {
                    category: true,
                    productsImage: true,
                },
            });
            res.paginatedResult = result;
            result.currentCountPerPage = Object.keys(result.paginateData).length;
            result.range = currentPage * limit;
            return res.status(200).json(result);
        } else if (endIndex < totalCount && !last_page) {
            result.totalCount = totalCount;
            result.totalPage = totalPage;
            result.currentPage = currentPage;
            result.next = {
                page: page + 1,
                limit: limit,
            };
            result.paginateData = await prisma.product.findMany({
                where: {
                    ...mySearch
                },
                take: limit,
                skip: startIndex,
                orderBy: {
                    updatedAt: orderBy || "desc",
                },
                include: {
                    category: true,
                    productsImage: {
                        select: {
                            path: true
                        }
                    }
                },
            });
            res.paginatedResult = result;
            result.currentCountPerPage = Object.keys(result.paginateData).length;
            result.range = currentPage * limit;
            return res.status(200).json(result);
        } else if (startIndex > 0 && !last_page) {
            result.totalCount = totalCount;
            result.totalPage = totalPage;
            result.currentPage = currentPage;
            result.previous = {
                page: page - 1,
                limit: limit,
            };
            result.paginateData = await prisma.product.findMany({
                where: {
                    ...mySearch
                },
                take: limit,
                skip: startIndex,
                orderBy: {
                    updatedAt: orderBy || "desc",
                },
                include: {
                    category: true,
                    productsImage: {
                        select: {
                            path: true
                        }
                    }
                },
            });
            res.paginatedResult = result;
            result.currentCountPerPage = Object.keys(result.paginateData).length;
            result.range = currentPage * limit;
            return res.status(200).json(result);
        } else if (last_page === "true" && page === totalPage) {
            result.totalCount = totalCount;
            result.totalPage = totalPage;
            result.currentPage = totalPage;
            result.last = {
                page: totalPage,
                limit: limit,
            };
            result.paginateData = await prisma.product.findMany({
                where: {
                    ...mySearch
                },
                take: limit,
                skip: startIndex,
                orderBy: {
                    updatedAt: orderBy || "desc",
                },
                include: {
                    category: true,
                    productsImage: {
                        select: {
                            path: true
                        }
                    }
                },
            });
            res.paginatedResult = result;
            result.currentCountPerPage = Object.keys(result.paginateData).length;
            result.range = totalCount;
            return res.status(200).json(result);
        } else {
            return res.status(404).json({ error: "Resource not found" });
        }
    } catch (error) {
        console.log(error)
        return res.send(404).json({ error: error.message })
    }
}

const getSingleProduct = async (req, res) => {
    const productId = parseInt(req.params.productId)
    try {
        const product = await prisma.product.findUniqueOrThrow({
            where: {
                id: productId
            },
            include: {
                category: true,
                productsImage: true,
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
    const categoryName = req.body.category?.name

    if (req.files) {
        for (const file of req.files) {
            const { path, filename } = file
            urls.push({ path, filename })
        }
    }

    if (categoryName) {
        product = {
            name,
            slug,
            description,
            price,
            category: {
                create: {
                    name: categoryName,
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
        res.status(200).send({
            message: 'Product created successfully',
            createProduct
        })
    } catch (error) {
        res.status(500).send({
            message: 'Error creating product',
            error: error.message
        })
    }
}

const updateProduct = async (req, res) => {
    console.log('this req body', req.body)
    const productId = parseInt(req.params.productId)
    const categoryId = parseInt(req.body.categoryId)

    const imagesProduct = await prisma.productImage.findMany({
        where: {
            productId: productId
        }
    })

    if (imagesProduct.length > 0 && req.files.length > 0 || req.body.image === '0') {
        for (const img of imagesProduct) {
            cloudinaryv2.uploader.destroy(img.filename, async function (error, result) {
                console.log({ result })
                console.log(parseInt(img.id))
                const imgId = parseInt(img.id)
                const deleteImage = await prisma.productImage.delete({ where: { id: imgId } })
                console.log({ deleteImage })
            })
        }
    }

    const urls = []
    if (req.files) {
        console.log(req.files)
        for (const file of req.files) {
            const { path, filename } = file
            urls.push({ path, filename })
        }
    }
    console.log('this urls', urls)

    try {
        const updateProduct = await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                name: req.body.name,
                description: req.body.description,
                categoryId: categoryId,
                productsImage: {
                    createMany: {
                        data: urls
                    }
                }
            },
            include: {
                category: true,
                productsImage: true,
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