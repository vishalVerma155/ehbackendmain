const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')


// Load config from env file
require("dotenv").config();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());

// DB connection
const dbconnect = require('./config/database.js');

// routes


// Start the server
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
    dbconnect();
});

// Default route
app.get('/', (req, res) => {
    res.send("Default Route");
});
