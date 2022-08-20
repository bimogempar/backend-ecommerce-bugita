const express = require("express");
const app = express();
const router = require("./routes/route");
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use('/api/v1/', router);

module.exports = app;