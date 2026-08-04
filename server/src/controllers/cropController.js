import Crop from '../models/Crop.js';
import Review from '../models/Review.js';

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

  const filter = {
    status: 'active',
  };

  if (q) {
    filter.$text = { $search: q };
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

  const [items, total] = await Promise.all([
    Crop.find(filter)
      .populate('farmer', 'name farmName avatar')
      .sort(order)
      .skip((page - 1) * limit)
      .limit(Number(limit)),

    Crop.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
};

export const getCrop = async (req, res) => {
  const crop = await Crop.findById(req.params.id).populate(
    'farmer',
    'name farmName avatar phone'
  );

  if (!crop) {
    return res.status(404).json({
      message: 'Crop not found',
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
  });

  res.status(201).json({ crop });
};

export const updateCrop = async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    return res.status(404).json({
      message: 'Crop not found',
    });
  }

  if (
    crop.farmer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'Not your listing',
    });
  }

  Object.assign(crop, req.body);

  await crop.save();

  res.json({ crop });
};

export const deleteCrop = async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    return res.status(404).json({
      message: 'Crop not found',
    });
  }

  if (
    crop.farmer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      message: 'Not your listing',
    });
  }

  await crop.deleteOne();

  res.status(204).send();
};

export const myCrops = async (req, res) => {
  const items = await Crop.find({
    farmer: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({ items });
};

export const addReview = async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    return res.status(404).json({
      message: 'Crop not found',
    });
  }

  const review = await Review.findOneAndUpdate(
    {
      crop: crop._id,
      buyer: req.user._id,
    },
    {
      rating: req.body.rating,
      comment: req.body.comment,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

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
    average: stats[0].average,
    count: stats[0].count,
  };

  await crop.save();

  res.status(201).json({ review });
};