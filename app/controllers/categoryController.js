const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const addCategory = async (req, res) => {
    const { name } = req.body
    try {
        const category = await prisma.category.create({
            data: {
                name
            }
        })
        res.send(201, {
            message: 'Category added successfully',
            data: category
        })
    } catch (error) {
        res.send(500, error)
    }
}

const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany()
        res.send(200, {
            message: "Successfully",
            data: categories
        })
    } catch (error) {
        res.send(500, error)
    }
}

const getSingleCategories = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId)
    try {
        const categories = await prisma.category.findUniqueOrThrow({
            where: {
                id: categoryId
            },
            include: {
                products: true
            }
        })
        res.send(200, {
            message: "Successfully",
            data: categories
        })
    } catch (error) {
        res.send(404, error)
    }
}

const updateCategory = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId)
    const { name } = req.body
    try {
        const categories = await prisma.category.update({
            where: {
                id: categoryId
            },
            data: {
                name
            },
        })
        res.send(200, {
            message: "Successfully updated",
            data: categories
        })
    } catch (error) {
        res.send(500, error)
    }
}

const deleteCategory = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId)
    try {
        const categories = await prisma.category.delete({
            where: {
                id: categoryId
            },
        })
        res.send(200, {
            message: "Successfully deleted",
            data: categories
        })
    } catch (error) {
        res.send(500, error)
    }
}

module.exports = {
    addCategory,
    getAllCategories,
    getSingleCategories,
    updateCategory,
    deleteCategory
}