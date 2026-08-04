import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      default: 'kg',
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    images: [String],

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    location: {
      village: String,
      district: String,
      state: String,
      coordinates: [Number],
    },

    organic: {
      type: Boolean,
      default: false,
    },

    harvestDate: Date,

    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },

    rating: {
      average: {
        type: Number,
        default: 0,
      },

      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

cropSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
});

export default mongoose.model('Crop', cropSchema);