// server.js
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors()); // production mein origin restrict kar dena

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// create order endpoint
app.post('/create-order', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const options = {
      amount: 29900, // paise: ₹299
      currency: "INR",
      receipt: `rec_${Date.now()}`,
      payment_capture: 1
    };
    const order = await razorpay.orders.create(options);
    // aap yahan DB / Google Sheet mein order + user store kar sakte ho
    res.json({ success: true, orderId: order.id, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not create order' });
  }
});

// verify payment endpoint
app.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, phone } = req.body;

    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // payment verified
      const whatsappInviteLink = "https://chat.whatsapp.com/KYV3avhrc3VC48y96C69vf?mode=wwt"; // <-- replace
      // aap yahan DB update karo ki user paid ho gaya (name/email/phone + payment id)
      res.json({ success: true, message: 'Payment verified', invite: whatsappInviteLink });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Verification error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));

