const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const router = express.Router();

// Create Stripe PaymentIntent
router.post('/create-intent', async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status !== 'payment_pending') {
            return res.status(400).json({ error: 'Booking is not in payment pending state' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(booking.price * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                bookingId: booking._id.toString()
            }
        });

        // Update booking with payment intent details
        booking.paymentMetadata = {
            stripePaymentIntentId: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
            paymentStatus: 'pending'
        };
        await booking.save();

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handlePaymentFailure(failedPayment);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

async function handlePaymentSuccess(paymentIntent) {
    try {
        const booking = await Booking.findOne({
            'paymentMetadata.stripePaymentIntentId': paymentIntent.id
        });

        if (booking) {
            booking.status = 'confirmed';
            booking.paymentMetadata.paymentStatus = 'succeeded';
            await booking.save();
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

async function handlePaymentFailure(paymentIntent) {
    try {
        const booking = await Booking.findOne({
            'paymentMetadata.stripePaymentIntentId': paymentIntent.id
        });

        if (booking) {
            booking.paymentMetadata.paymentStatus = 'failed';
            await booking.save();
        }
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}

module.exports = router; 