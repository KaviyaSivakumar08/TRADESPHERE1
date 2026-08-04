import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Unique review per buyer per crop
reviewSchema.index(
  {
    crop: 1,
    buyer: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model('Review', reviewSchema);