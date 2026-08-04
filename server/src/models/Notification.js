import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['new_order', 'order_status'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Notification', notificationSchema);