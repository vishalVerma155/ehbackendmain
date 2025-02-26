const User = require('../../../models/user/web/user.model.js');
const generateJWT = require('../../../utils/jwt.js');

const createImpersonate = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only Admins can impersonate Users." });
    }

    const { userId, googleId } = req.body;
  
    try {
        const user = await User.findOne({ $or: [{ _id: userId }, { googleId: googleId }] });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const payload = { id: user._id, email: user.email, role: "user", impersonatedByAdmin: true };
        // Generate JWT token for the impersonated user
        const userToken = generateJWT(payload);

        // Store the admin JWT before switching
        res.cookie("admin_jwt", req.cookies.AccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });

        // Set the new user token in cookies
        res.cookie("AccessToken", userToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });

    
       return res.status(200).json({ message: "Impersonation started", redirectUrl: " " });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const restoreAdmin = async (req, res) => {
    const adminToken = req.cookies.admin_jwt; // Get the stored admin token

    if (!adminToken) {
        return res.status(401).json({ message: "No Admin session found" });
    }

    // Decode the admin JWT
    const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECURITY_KEY);

    // Restore admin session
    res.cookie("AccessToken", adminToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
    });

    // Remove the stored Admin token
    res.clearCookie("admin_jwt");

    res.json({ message: "Admin session restored" });
};

module.exports = {createImpersonate}