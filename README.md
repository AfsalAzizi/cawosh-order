# Cawosh Order Backend

A Node.js Express backend for handling ride/service bookings with Stripe payment integration.

## Features

- Create booking drafts
- Get payment methods for services
- Create Stripe PaymentIntents
- Handle Stripe webhooks
- MongoDB integration for data persistence

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/cawosh-order
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NODE_ENV=development
   ```

4. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Bookings

- `POST /bookings` - Create a new booking draft
- `GET /bookings/payment-methods?serviceId=...` - Get payment methods for a service

### Payments

- `POST /payments/create-intent` - Create a Stripe PaymentIntent
- `POST /payments/webhook` - Handle Stripe webhooks

## Security

- Uses Stripe SDK for secure payment processing
- No raw card data is handled by the server
- Environment variables for sensitive data
- Input validation using express-validator

## Error Handling

The API includes comprehensive error handling for:

- Invalid input data
- Database operations
- Stripe API calls
- Webhook signature verification

## Development

To run the server in development mode with auto-reload:

```bash
npm run dev
```
