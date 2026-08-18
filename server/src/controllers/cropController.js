import Crop from '../models/Crop.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

export const listCrops = async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    organic,
    page = 1,
    limit = 12,
    sort = 'newest',
  } = req.query;

  // Show both available and unavailable products in marketplace.
  const filter = {};

  if (q && q.trim() !== '') {
    filter.$or = [
      {
        name: {
          $regex: q.trim(),
          $options: 'i',
        },
      },
      {
        description: {
          $regex: q.trim(),
          $options: 'i',
        },
      },
      {
        category: {
          $regex: q.trim(),
          $options: 'i',
        },
      },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {
      $gte: Number(minPrice) || 0,
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }

  if (organic === 'true') {
    filter.organic = true;
  }

  const order =
    {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    }[sort] || { createdAt: -1 };

  const currentPage = Number(page);
  const pageLimit = Number(limit);

  const [items, total] = await Promise.all([
    Crop.find(filter)
      .populate('farmer', 'name farmName avatar')
      .sort(order)
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit),

    Crop.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page: currentPage,
    pages: Math.ceil(total / pageLimit),
  });
};

export const getCrop = async (req, res) => {
  const crop = await Crop.findById(req.params.id).populate(
    'farmer',
    'name farmName avatar phone',
  );

  if (!crop) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  const reviews = await Review.find({
    crop: crop._id,
  })
    .populate('buyer', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({
    crop,
    reviews,
  });
};

export const createCrop = async (req, res) => {
  const crop = await Crop.create({
    ...req.body,
    farmer: req.user._id,
    status: 'active',
  });

  res.status(201).json({
    crop,
  });
};

export const updateCrop = async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  if (
    crop.farmer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can edit only your own product',
    });
  }

  Object.assign(crop, req.body);

  await crop.save();

  res.json({
    crop,
  });
};

export const deleteCrop = async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  if (
    crop.farmer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'You can delete only your own product',
    });
  }

  await crop.deleteOne();

  res.status(204).send();
};

export const myCrops = async (req, res) => {
  const items = await Crop.find({
    farmer: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    items,
  });
};

// A buyer can review only after this exact product is delivered.
// A buyer can submit only one review per product.
export const addReview = async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  const rating = Number(req.body.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: 'Please select a rating from 1 to 5 stars',
    });
  }

  const deliveredOrder = await Order.exists({
    buyer: req.user._id,
    items: {
      $elemMatch: {
        crop: crop._id,
        sellerStatus: 'delivered',
      },
    },
  });

  if (!deliveredOrder) {
    return res.status(403).json({
      message:
        'You can review this product only after it has been delivered.',
    });
  }

  const existingReview = await Review.findOne({
    crop: crop._id,
    buyer: req.user._id,
  });

  if (existingReview) {
    return res.status(409).json({
      message: 'You have already rated this product.',
    });
  }

  const review = await Review.create({
    crop: crop._id,
    buyer: req.user._id,
    rating,
    comment: req.body.comment?.trim() || '',
  });

  // Calculate rating visible to all users.
  const stats = await Review.aggregate([
    {
      $match: {
        crop: crop._id,
      },
    },
    {
      $group: {
        _id: null,
        average: {
          $avg: '$rating',
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  crop.rating = {
    average: stats[0]?.average || 0,
    count: stats[0]?.count || 0,
  };

  await crop.save();

  res.status(201).json({
    message: 'Review submitted successfully.',
    review,
  });
};