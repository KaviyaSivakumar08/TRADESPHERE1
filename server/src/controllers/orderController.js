import Order from '../models/Order.js';
import Crop from '../models/Crop.js';
import Notification from '../models/Notification.js';

const updateOrderStatus = (order) => {
  const statuses = order.items.map((item) => item.sellerStatus);

  if (statuses.every((status) => status === 'rejected')) {
    order.status = 'cancelled';
  } else if (statuses.every((status) => status === 'delivered')) {
    order.status = 'delivered';
  } else if (statuses.some((status) => status === 'pending')) {
    order.status =
      statuses.some((status) => status !== 'pending') ? 'partial' : 'pending';
  } else if (statuses.some((status) => status === 'shipped')) {
    order.status = 'shipped';
  } else if (statuses.some((status) => status === 'processing')) {
    order.status = 'processing';
  } else {
    order.status = 'confirmed';
  }
};

// BUYER: Place an order
export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

  if (!items?.length || !shippingAddress?.line1) {
    return res.status(400).json({
      message: 'Items and shipping address are required',
    });
  }

  const cropIds = items.map((item) => item.cropId);

  const crops = await Crop.find({
    _id: { $in: cropIds },
    status: 'active',
  });

  if (crops.length !== cropIds.length) {
    return res.status(400).json({
      message: 'One or more crops are unavailable',
    });
  }

  let subtotal = 0;

  const orderItems = items.map((item) => {
    const crop = crops.find((currentCrop) => currentCrop.id === item.cropId);

    if (!crop || item.quantity < 1 || item.quantity > crop.quantity) {
      throw Object.assign(
        new Error(`Insufficient stock for ${crop?.name || 'crop'}`),
        { statusCode: 400 },
      );
    }

    subtotal += crop.price * item.quantity;

    return {
      crop: crop._id,
      farmer: crop.farmer,
      name: crop.name,
      image: crop.images?.[0] || '',
      price: crop.price,
      quantity: item.quantity,
      unit: crop.unit,
      sellerStatus: 'pending',
    };
  });

  const shipping = subtotal >= 1000 ? 0 : 80;

  const order = await Order.create({
    buyer: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    shipping,
    total: subtotal + shipping,
    payment: {
      method: paymentMethod,
      status: 'pending',
    },
  });

  for (const item of orderItems) {
    await Crop.findByIdAndUpdate(item.crop, {
      $inc: { quantity: -item.quantity },
    });
  }

  // Send each seller only their own products.
  const farmerIds = [
    ...new Set(orderItems.map((item) => item.farmer.toString())),
  ];

  const notifications = await Notification.insertMany(
    farmerIds.map((farmerId) => {
      const farmerProducts = orderItems
        .filter((item) => item.farmer.toString() === farmerId)
        .map((item) => `${item.quantity} ${item.unit} ${item.name}`)
        .join(', ');

      return {
        recipient: farmerId,
        type: 'new_order',
        title: 'New order waiting for approval',
        message: `Order #${order.id.slice(-6)}: ${farmerProducts}. Delivery to ${shippingAddress.city}, ${shippingAddress.state}.`,
        order: order._id,
      };
    }),
  );

  const io = req.app.get('io');

  notifications.forEach((notification) => {
    io?.to(notification.recipient.toString()).emit(
      'notification:new',
      notification,
    );
  });

  res.status(201).json({ order });
};

// BUYER: sees only their own orders.
// FARMER: sees only orders containing their crops.
export const listOrders = async (req, res) => {
  const items = await Order.find({
    $or: [
      { buyer: req.user._id }, // Products this user bought
      { 'items.farmer': req.user._id }, // Products this user sold
    ],
  })
    .populate('buyer', 'name email phone')
    .populate('items.farmer', 'name farmName phone')
    .sort({ createdAt: -1 });

  res.json({ items });
};

// FARMER: approves/rejects only their own items.
export const updateSellerStatus = async (req, res) => {
  const allowedStatuses = [
    'approved',
    'processing',
    'shipped',
    'delivered',
    'rejected',
  ];

  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const farmerItems = order.items.filter(
    (item) => item.farmer.toString() === req.user.id,
  );

  if (!farmerItems.length) {
    return res.status(403).json({
      message: 'You cannot update another seller’s items',
    });
  }

  farmerItems.forEach((item) => {
    item.sellerStatus = status;
  });

  updateOrderStatus(order);
  await order.save();

  const productDetails = farmerItems
    .map((item) => `${item.quantity} ${item.unit} ${item.name}`)
    .join(', ');

  const sellerName = req.user.farmName || req.user.name;

  const buyerNotification = await Notification.create({
    recipient: order.buyer,
    type: 'order_status',
    title: `Order ${status}`,
    message: `${sellerName} has ${status} your items: ${productDetails}.`,
    order: order._id,
  });

  const io = req.app.get('io');

  io?.to(order.buyer.toString()).emit(
    'notification:new',
    buyerNotification,
  );

  res.json({
    message: `Your items were ${status}`,
    order,
  });
};