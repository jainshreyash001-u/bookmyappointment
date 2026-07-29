const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
// Import Airtable or other DB functions here if needed

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// POST /api/payment/create-order (For Frontend to trigger payment)
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, plan } = req.body;
    
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: plan
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("[Razorpay Create Order Error]", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/payment/verify (To verify payment signature after frontend success)
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is authentic
      // TODO: Update Airtable user record with active subscription
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error) {
    console.error("[Razorpay Verify Error]", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/webhook/razorpay (For Razorpay background Webhooks)
const webhookRouter = express.Router();
webhookRouter.post('/', express.json(), (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  // Verify Webhook Signature
  const signature = req.headers['x-razorpay-signature'];
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body.event;
  
  switch (event) {
    case 'payment.captured':
      console.log('Payment Captured:', req.body.payload.payment.entity);
      break;
    case 'payment.failed':
      console.log('Payment Failed:', req.body.payload.payment.entity);
      break;
    case 'subscription.charged':
      console.log('Subscription Charged:', req.body.payload.subscription.entity);
      break;
    default:
      console.log(`Unhandled event type ${event}`);
  }

  res.json({ status: 'ok' });
});

module.exports = { paymentRouter: router, webhookRouter };
