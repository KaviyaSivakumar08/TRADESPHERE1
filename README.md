# TradeSphere

TradeSphere is a MERN agricultural marketplace connecting farmers directly with buyers.

## Start locally

1. Copy `server/.env.example` to `server/.env` and enter your MongoDB URI and JWT secret.
2. Run `npm run install:all` from this folder.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

The API runs on port 5000. Razorpay, Cloudinary, weather, and maps keys are optional integrations; payment creation returns a clear configuration error until Razorpay keys are supplied.

## Included modules

- JWT authentication and Farmer, Buyer, Admin roles
- Crop CRUD with stock control and image URL support
- Marketplace searching, filters, pagination, cart and wishlist
- Checkout, Razorpay order creation/verification, order lifecycle
- Reviews, dashboard analytics, notifications and Socket.io chat

## Production notes

Use a managed MongoDB database, HTTPS, secure production CORS origins, a long random JWT secret, real webhook validation, and a persistent Socket.io adapter before deployment.
