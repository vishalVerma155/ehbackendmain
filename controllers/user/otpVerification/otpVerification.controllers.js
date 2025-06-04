const User = require("../../../models/user/web/user.model.js");
const generateOTP = require("../../../utils/otpGenerater.js");
const { comparePassword, hashPassword } = require("../../../utils/bcrypt.js");
const { sendOTPEmail } = require("../../../utils/emailServices.js");
const { sendSMS } = require("../../../utils/phoneOtpServices.js")
const jwt = require('jsonwebtoken');

const generateJWT = (user) => {
    return jwt.sign(user, process.env.JWT_SECURITY_KEY, { expiresIn: '10m' });
}

const verifyJwt = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECURITY_KEY);
    return decoded;
}

const verifyEmailAndPhone = async (req, res) => {

    try {
        const { email, phoneNumber } = req.body;

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes


        const hashedOTP = await hashPassword(otp);
        const jwtOtp = generateJWT({hashedOTP});
        

        if (email && email.trim() !== "") {
            await sendOTPEmail(email, otp);

            res.cookie("EmailToken", { jwtOtp, otpExpires }, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });

            return res.status(200).json({ success: true, message: `Otp sent on ${email}` });
        }

        if (phoneNumber) {

            // otp, recipient, userName
            await sendSMS(otp, phoneNumber, "User");

            res.cookie("PhoneToken", { jwtOtp, otpExpires }, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });

            return res.status(200).json({ success: true, message: `Otp sent on phone number : ${phoneNumber}` });
        }

            return res.status(200).json({ success: false, message: `Phone number or email id is required` });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




const verifyOTP = async (req, res) => {
    try {
        const { otp, type } = req.body; // type = "email" or "phone"
        if (!otp || !type) {
            return res.status(400).json({ success: false, error: "OTP and type are required." });
        }

        const tokenCookie = type === "email" ? req.cookies.EmailToken : req.cookies.PhoneToken;

        if (!tokenCookie || !tokenCookie.jwtOtp || !tokenCookie.otpExpires) {
            return res.status(400).json({ success: false, error: "OTP token not found or expired. Please request again." });
        }

        const { jwtOtp, otpExpires } = tokenCookie;

        const decodeToken = verifyJwt(jwtOtp);

        if (Date.now() > otpExpires) {
            return res.status(400).json({ success: false, error: "OTP has expired." });
        }

        const isMatch = await comparePassword(otp, decodeToken.hashedOTP);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Invalid OTP." });
        }

        // Clear the cookie after successful verification
        res.clearCookie(type === "email" ? "EmailToken" : "PhoneToken", {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        return res.status(200).json({ success: true, message: "OTP verified successfully." });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Error verifying OTP", error: error.message });
    }
};



module.exports = { verifyEmailAndPhone, verifyOTP };