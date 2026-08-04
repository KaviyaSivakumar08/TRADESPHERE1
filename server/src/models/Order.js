import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    unit: String,

    // Only the farmer who owns this crop can change this status.
    sellerStatus: {
      type: String,
      enum: [
        'pending',
        'approved',
        'processing',
        'shipped',
        'delivered',
        'rejected',
      ],
      default: 'pending',
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [itemSchema],

    shippingAddress: {
      label: String,
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },

    subtotal: Number,
    shipping: { type: Number, default: 0 },
    total: Number,

    status: {
      type: String,
      enum: [
        'pending',
        'partial',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },

    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'cod'],
        default: 'cod',
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model('Order', orderSchema);