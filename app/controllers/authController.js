const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const authorize = async (req, res, next) => {
    try {
        const auth = req.headers.authorization
        if (!auth) {
            return res.status(401).json({
                message: 'Invalid authorization header',
            })
        }

        const token = auth.split(" ")[1]
        const decoded = decodeToken(token)
        req.user = decoded
        next()
    } catch (error) {
        res.send(error)
    }
}

const me = async (req, res) => {
    try {
        const auth = req.headers.authorization
        if (!auth) {
            return res.status(401).json({
                message: 'Invalid authorization header',
            })
        }
        const token = auth.split(" ")[1]
        const decoded = decodeToken(token)
        console.log(token)
        const findUser = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            }
        })
        const user = exclude(findUser, 'password')
        res.send(200, user)
    } catch (error) {
        res.send(401, {
            error,
            message: "Unauthorized access_token",
        })
    }
}

const signUp = async (req, res) => {
    try {
        const { email, password, name, no_hp, address, role, avatar } = req.body
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (user) {
            return res.send({
                message: "Email already in registered"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 15)
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role ? role : "user",
                no_hp,
                address,
                avatar,
            }
        })
        res.send(200, {
            message: "Successfully created user",
            user: newUser
        })
    } catch (error) {
        res.send(500, {
            message: "Failed to create user",
            error
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (!user) {
            return res.send(404, {
                message: "Email not found"
            })
        }

        const isPasswordValid = await verfiyPassword(password, user.password)
        if (!isPasswordValid) {
            return res.send(404, {
                message: "Password does not match"
            })
        }

        const token = await createToken(user)
        return res.send(200, {
            message: "Successfully logged in user",
            user: user,
            access_token: token
        })
    } catch (error) {
        res.send(500, {
            message: "Failed to login",
            error
        })
    }
}

const verfiyPassword = async (password, encryptedPassword) => {
    return await bcrypt.compare(password, encryptedPassword)
}

const createToken = async (user) => {
    return jwt.sign({
        id: user.id,
    },
        process.env.JWT_SECRET
    )
}

const decodeToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

const exclude = (user, ...keys) => {
    for (let key of keys) {
        delete user[key]
    }
    return user
}

module.exports = {
    signUp,
    login,
    authorize,
    me
}