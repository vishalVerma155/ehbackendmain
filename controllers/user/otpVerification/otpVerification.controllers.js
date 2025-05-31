const User = require("../../../models/user/web/user.model.js");
const generateOTP = require("../../../utils/otpGenerater.js");
const { comparePassword, hashPassword } = require("../../../utils/bcrypt.js");
const { sendOTPEmail } = require("../../../utils/emailServices.js");
const { sendSMS } = require("../../../utils/phoneOtpServices.js")



const verifyEmailAndPhone = async (req, res) => {

    try {
        const { email, phoneNumber } = req.body;

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        

        const hashedOTP = await hashPassword(otp);
        

        if (email && email.trim() !== "") {
            await sendOTPEmail(email, otp);

            res.cookie("EmailToken", {hashedOTP, otpExpires}, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });

            return res.status(200).json({ success: true, message: `Otp sent on ${email}` });
        }

        if (phoneNumber) {
            console.log("Enter in phone")

            // otp, recipient, userName
            await sendSMS(otp, phoneNumber, "User");

            res.cookie("PhoneToken", {hashedOTP, otpExpires}, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });

            return res.status(200).json({ success: true, message: `Otp sent on phone number : ${phoneNumber}` });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending Otp', error: error.message });
    }
};



const checkEmailAndPhone = async (req, res) => {

    try {
        const { email, phoneNumber, otp } = req.body;
        const token = req.cookies.AccessToken;


        if (email && email.trim() !== "") {
            await sendOTPEmail(email, otp);

            res.cookie("EmailToken", hashedOTP, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });

            return res.status(200).json({ success: true, message: `Otp sent on ${email}` });
        }

        if (phoneNumber) {
            console.log("Enter in phone")

            // otp, recipient, userName
            await sendSMS(otp, phoneNumber, "User");

            res.cookie("PhoneToken", hashedOTP, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });

            return res.status(200).json({ success: true, message: `Otp sent on phone number : ${phoneNumber}` });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending Otp', error: error.message });
    }
};


module.exports = { verifyEmailAndPhone };