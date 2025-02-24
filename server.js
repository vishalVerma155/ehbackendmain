const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const affiliateRouter = require('./routes/affiliate/web/affiliate.web.routes.js');
const adminRouter = require('./routes/admin/admin.routes.js');
const vendorRouter = require('./routes/vendor/web/vendor.web.routes.js');
const bankRouter = require('./routes/bankDetails/bankDetails.routes.js');
const upiRouter = require('./routes/bankDetails/upi.routes.js');
const groupRouter = require('./routes/admin/group/group.routes.js')

// Load config from env file
require("dotenv").config();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// DB connection
const dbconnect = require('./config/database.js');

// routes
app.use("/affiliate", affiliateRouter);
app.use("/admin", adminRouter);
app.use("/vendor", vendorRouter);
app.use("/bank", bankRouter);
app.use("/upi", upiRouter);
app.use("/admin/group", groupRouter);


// Start the server
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
    dbconnect(); // call database
});

// Default route
app.get('/', (req, res) => {
    res.send("Default Route");
});
