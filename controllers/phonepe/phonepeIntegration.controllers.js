const { randomUUID } = require('crypto');
const {
    StandardCheckoutClient,
    StandardCheckoutPayRequest,
    MetaInfo,
    Env
} = require('pg-sdk-node'); // replace with actual import

const PaymentOrder = require('../../models/paymentModel/paymentOrder.model.js');

const clientId = process.env.CLINT_ID;
const clientSecret = process.env.CLINT_SECRET;
const clientVersion = process.env.CLINT_VERSION || 1;
const environment = Env.SANDBOX;



const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, environment);
const metaInfo = MetaInfo.builder()
    .udf1("udf1")
    .udf2("udf2")
    .build();


const createpayment = async (req, res) => {
    try {
        console.log("ENENENENterrrrr");
        const { amount } = req.body;
        const convertedAmount = Number(amount) * 100;


        if (!clientId || !clientSecret) {
            return res.status(400).json({ success: false, error: 'Missing CLIENT_ID or CLIENT_SECRET in environment variables' });
        }


        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }


        const merchantOrderId = randomUUID();


        const redirectUrl = process.env.REDIRECT_URL;


        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(convertedAmount)
            .redirectUrl(`${redirectUrl}/${merchantOrderId}`)
            .metaInfo(metaInfo)
            .build();


        const response = await client.pay(request);


        const order = new PaymentOrder({
            merchantOrderId,
            amount,
            status: 'PENDING',
            phonepeResponse: response
        })

        await order.save();


        res.status(200).json({
            success: true,
            paymentUrl: response.redirectUrl,
            orderId: merchantOrderId
        });

    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment', error: error.message });
    }
};

const status = async (req, res) => {

    const { orderId } = req.params;
    
    if (!orderId) {
        return res.status(404).json({ success: false, error: 'Order not found' });
    }


    try {
        // const response = await client.getOrderStatus(orderId);


        // const state = response.state;

        const order = await PaymentOrder.findOne({merchantOrderId : orderId});

        // order.status = state;
        // order.phonepeResponse = response;

        // await order.save();

        if (order.status === "PENDING") {
            res.send('Payment Pending')
        }

        if (order.status === "FAILED") {
            res.send('Payment failed')
        }

        if (order.status === "COMPLETED") {
            res.send(`payment completed`)
        }

        // res.send(response);

        // res.status(200).json({
        //     success: true,
        //     orderId,
        //     state,
        //     message:
        //         state === "PENDING" ? "Payment is pending" :
        //             state === "FAILED" ? "Payment failed" :
        //                 state === "COMPLETED" ? "Payment completed" :
        //                     "Unknown payment state"
        // });
    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve order status', error: error.message });
    }
};

const callback = async (req, res) => {
    try {
        const authorizationHeaderData = req.headers['x-verify'];
        const phonepeS2SCallbackResponseBodyString = JSON.stringify(req.body);

        const usernameConfigured = process.env.MERCHANT_USERNAME;
        const passwordConfigured = process.env.MERCHANT_PASSWORD;

        const callbackResponse = client.validateCallback(
            usernameConfigured,
            passwordConfigured,
            authorizationHeaderData,
            phonepeS2SCallbackResponseBodyString
        );

        const { orderId, state } = callbackResponse.payload;

        const order = await PaymentOrder.findOne({ merchantOrderId: orderId });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = state;
        order.phonepeResponse = callbackResponse;
        await order.save();

        res.status(200).json({ success: true, message: 'Callback processed' });

    } catch (error) {
        console.error('Callback processing error:', error);
        res.status(500).json({ success: false, message: 'Failed to process callback', error: error.message });
    }
};

module.exports = { createpayment, status, callback };
