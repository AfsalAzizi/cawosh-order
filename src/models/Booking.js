const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true
    },
    rideId: {
        type: String,
        required: true
    },
    slot: {
        type: Date,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    userDetails: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['payment_pending', 'confirmed', 'cancelled'],
        default: 'payment_pending'
    },
    price: {
        type: Number,
        required: true
    },
    paymentMetadata: {
        stripePaymentIntentId: String,
        stripeClientSecret: String,
        paymentMethod: String,
        paymentStatus: String
    }
}, {
    timestamps: true
});

// Index for geospatial queries
bookingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema); 