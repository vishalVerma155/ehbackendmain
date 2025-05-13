const jwt = require('jsonwebtoken');
const User = require('../models/user/web/user.model.js');
const {comparePassword} = require('../utils/bcrypt.js');


const verifyJWT = async (req, res, next) => {
    const token = req.cookies.AccessToken;

    if (!token) return res.status(401).json({ Message: "Token not found" });

    const user = jwt.verify(token, process.env.JWT_SECURITY_KEY, async (error, decoded) => {
        if (error) return res.status(401).json({success: false, Message: "Unauthorized" });

        const userToken = await User.findById(decoded._id).select('tokenVersion');

        if (!user) return res.status(401).json({success: false, Message: "User not found" });

        const isMatched = await comparePassword(decoded.tokenVersion, userToken.tokenVersion);

        if(!isMatched){
            return res.status(401).json({success: false, Message: "Token version not matched." })
        }

        req.user = decoded;

        // Check if an admin is impersonating a user
        if (req.cookies.admin_jwt) {
            req.user.impersonatedByAdmin = true;
        }
        next()
    });
}

module.exports = verifyJWT;