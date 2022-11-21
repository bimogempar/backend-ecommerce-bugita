const express = require("express");
const app = express();
const router = require("./routes/route");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.redirect('/api/v1/')
});
app.use('/api/v1/', router);

module.exports = app;