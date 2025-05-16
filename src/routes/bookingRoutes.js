const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const router = express.Router();

// Create booking (draft)
router.post('/',
    [
        body('serviceId').notEmpty(),
        body('rideId').notEmpty(),
        body('slot').isISO8601(),
        body('location.coordinates').isArray().isLength(2),
        body('location.address').notEmpty(),
        body('userDetails.name').notEmpty(),
        body('userDetails.email').isEmail(),
        body('userDetails.phone').notEmpty(),
        body('price').isNumeric()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const booking = new Booking({
                ...req.body,
                status: 'payment_pending'
            });

            await booking.save();
            res.status(201).json(booking);
        } catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).json({ error: 'Failed to create booking' });
        }
    }
);

// Get payment methods for service
router.get('/payment-methods', async (req, res) => {
    try {
        const { serviceId } = req.query;
        if (!serviceId) {
            return res.status(400).json({ error: 'Service ID is required' });
        }

        // This could be fetched from a database based on service settings
        // For now, returning static data
        const paymentMethods = ['card', 'apple_pay', 'paypal'];
        res.json({ paymentMethods });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
});

module.exports = router; 