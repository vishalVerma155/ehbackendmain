const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { initSocket } = require('./socket');

const server = http.createServer(app);
initSocket(server);

const affiliateRouter = require('./routes/affiliate/web/affiliate.web.routes.js');
const adminRouter = require('./routes/admin/admin.routes.js');
const vendorRouter = require('./routes/vendor/web/vendor.web.routes.js');
const bankRouter = require('./routes/bankDetails/bankDetails.routes.js');
const upiRouter = require('./routes/bankDetails/upi.routes.js');
const groupRouter = require('./routes/admin/group/group.routes.js');
const impersonateRouter = require('./routes/admin/impersonateAsUser/impersonate.routes.js');
const programRouter = require('./routes/vendor/marketTools/program/program.routes.js');
const campaignRouter = require('./routes/vendor/marketTools/campaign/campaign.routes.js');
const commissionRouter = require('./routes/commission/commission.routes.js');
const queryRouter = require('./routes/contectToAdmin/query.routes.js');
const walletRouter = require('./routes/wallet/wallet.routes.js');
const depositRouter = require('./routes/vendor/deposit/depositReceipt.routes.js');
const mlmRouter = require('./routes/vendor/MLM/MLM.routes.js');
const distributionRouter = require('./routes/vendor/commissionDistribution/commissionDistribution.routes.js');
const withdrawalRouter = require('./routes/vendor/withdrawal/withdrawal.routes.js');
const clubRouter = require("./routes/affiliate/affiliateClub/affiliateClub.routes.js");
const membershipModelRouter = require("./routes/vendor/membershipModel/vendorMembership.routes.js");
const phonePeRouter = require("./routes/phonePe/phonePe.routes.js");
const saleEventRouter = require('./routes/saleEvent/saleEvent.routes.js');
const notificationRouter = require('./routes/notification/notification.routes.js')


// Load config from env file
require("dotenv").config();
const PORT = process.env.PORT || 4000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5501', 'https://4eca-49-43-133-246.ngrok-free.app'];

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

// app.use(cors({origin : "*"}))

// DB connection
const dbconnect = require('./config/database.js');

// routes
app.use("/affiliate", affiliateRouter);
app.use("/affiliate", clubRouter);
app.use("/admin", adminRouter);
app.use("/vendor", vendorRouter);
app.use("/bank", bankRouter);
app.use("/upi", upiRouter);
app.use("/admin/group", groupRouter);
app.use("/admin/impersonate", impersonateRouter);
app.use("/vendor", programRouter);
app.use("/vendor", campaignRouter);
app.use("/withdrawal", withdrawalRouter);
app.use("/commission", commissionRouter);
app.use("/commission", distributionRouter);
app.use('/contectAdmin', queryRouter);
app.use("/wallet", walletRouter);
app.use("/deposit", depositRouter);
app.use("/MLM", mlmRouter);
app.use("/membership", membershipModelRouter);
app.use("/phone", phonePeRouter);
app.use("/saleEvent", saleEventRouter);
app.use("/notification", notificationRouter);



// Start the server
server.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
    dbconnect(); // call database
});

// Default route
app.get('/', (req, res) => {
    res.send("Default Route");
});