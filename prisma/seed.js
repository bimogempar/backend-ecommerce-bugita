const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { faker } = require("@faker-js/faker")
const bcrypt = require('bcrypt')

const seedProduct = async () => {
    const password = await bcrypt.hash('password', 10)
    try {
        console.log('Start Seeding...')
        await prisma.user.create({
            data: {
                email: "bimo@example.com",
                password: password,
                role: 'user',
                name: 'Bimo',
                no_hp: "08819417402",
                address: "Malang"
            }
        })

        await prisma.user.create({
            data: {
                email: "admin@example.com",
                password: password,
                role: 'admin',
                name: 'Admin',
                no_hp: "123456789",
                address: "Malang"
            }
        })

        for (let i = 0; i < 6; i++) {
            await prisma.category.create({
                data: {
                    name: faker.commerce.department(),
                }
            })
        }

        for (let i = 0; i < 100; i++) {
            await prisma.product.create({
                data: {
                    name: faker.commerce.productName(),
                    slug: faker.lorem.slug(3),
                    description: faker.lorem.sentence(),
                    categoryId: faker.datatype.number({ 'min': 1, 'max': 5 }),
                    price: parseInt(faker.commerce.price(100, 1000000, 0)),
                    // productsImage: {
                    //     createMany: {
                    //         data: {
                    //             path: faker.image.abstract()
                    //         }
                    //     }
                    // }
                }
            })
        }
    } catch (error) {
        console.log(error)
        process.exit(1)
    } finally {
        console.log('Successfully seeding...')
        await prisma.$disconnect()
    }
}

seedProduct()