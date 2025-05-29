const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (to, otp) => {

    console.log("Enter")

  const respo =  await transporter.verify();
    console.log("Server is ready to take our messages", respo);

    const res = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your OTP Code',
        html: `<h3>Your OTP is: <b>${otp}</b></h3><p>It expires in 10 minutes.</p>`
    });


};

module.exports = { sendOTPEmail };
