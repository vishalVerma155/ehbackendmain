const axios = require('axios');
require('dotenv').config();


const sendSMS = async (otp, recipient, userName) => {
    try {
        const variableValues = `${userName}|${otp}`;

        // Construct the API URL dynamically
        const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.fast2SMS_Api_Key}&route=${process.env.fast2SMS_Route}&sender_id=${process.env.fast2SMS_Sender_ID}&message=${process.env.fast2SMS_Message}&variables_values=${encodeURIComponent(
            variableValues
        )}&flash=0&numbers=${recipient}`;

        // Make the API request
        const response = await axios.get(url);

        console.log("API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Sending SMS:", error.response?.data || error.message)
    }
};

module.exports = { sendSMS };