const { randomUUID } = require('crypto');
const {
    StandardCheckoutClient,
    StandardCheckoutPayRequest,
    MetaInfo,
    Env
} = require('pg-sdk-node'); // replace with actual import

const clientId = process.env.CLINT_ID;
const clientSecret = process.env.CLINT_SECRET;
const clientVersion = process.env.CLINT_VERSION || 1;
const environment = process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.SANDBOX;

if (!clientId || !clientSecret) {
    console.error("Missing CLIENT_ID or CLIENT_SECRET in environment variables");
    process.exit(1);
}

const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, environment);
const metaInfo = MetaInfo.builder()
    .udf1("udf1")
    .udf2("udf2")
    .build();

// Simulated in-memory store (replace with DB or cache in production)
const orderStore = new Map();

const createpayment = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const merchantOrderId = randomUUID();
        const redirectUrl = process.env.REDIRECT_URL;

        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(amount)
            .redirectUrl(`${redirectUrl}/${merchantOrderId}`)
            .metaInfo(metaInfo)
            .build();

        const response = await client.pay(request);

        // Store order in memory (for demo; use a DB in production)
        orderStore.set(merchantOrderId, { amount, createdAt: new Date() });

        res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment', error: error.message });
    }
};

const status =  async (req, res) => {
    const { orderId } = req.params;

    if (!orderId || !orderStore.has(orderId)) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    try {
        const response = await client.getOrderStatus(orderId);
        const state = response.state;

        res.status(200).json({
            success: true,
            orderId,
            state,
            message:
                state === "PENDING" ? "Payment is pending" :
                state === "FAILED" ? "Payment failed" :
                state === "COMPLETED" ? "Payment completed" :
                "Unknown payment state"
        });
    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve order status', error: error.message });
    }
};

module.exports = {createpayment, status};
