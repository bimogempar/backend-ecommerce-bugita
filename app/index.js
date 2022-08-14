require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { parse } = require('dotenv');

const prisma = new PrismaClient();

app.use(express.json());
app.use(cors())

app.get('/', async (req, res) => {
    const users = await prisma.User.findMany();
    res.send(users);
})

app.post('/add', async (req, res) => {
    const user = await prisma.User.create({
        data: {
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            no_hp: req.body.no_hp,
            address: req.body.address,
        }
    })
    res.send(user)
})


module.exports = app