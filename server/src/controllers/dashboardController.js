import Crop from '../models/Crop.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const dashboard = async (req, res) => {
  if (req.user.role === 'farmer') {
    const [crops, orders] = await Promise.all([
      Crop.countDocuments({
        farmer: req.user._id,
      }),
      Order.find({
        'items.farmer': req.user._id,
        status: { $ne: 'cancelled' },
      }),
    ]);

    const revenue = orders.reduce(
      (sum, order) =>
        sum +
        order.items
          .filter((item) => item.farmer.toString() === req.user.id)
          .reduce(
            (subtotal, item) =>
              subtotal + item.price * item.quantity,
            0
          ),
      0
    );

    return res.json({
      role: 'farmer',
      stats: {
        crops,
        orders: orders.length,
        revenue,
      },
      recentOrders: orders.slice(0, 5),
    });
  }

  if (req.user.role === 'admin') {
    const paidOrders = await Order.find({
      'payment.status': 'paid',
    });

    return res.json({
      role: 'admin',
      stats: {
        users: await User.countDocuments(),
        crops: await Crop.countDocuments(),
        orders: await Order.countDocuments(),
        revenue: paidOrders.reduce(
          (sum, order) => sum + order.total,
          0
        ),
      },
    });
  }

  const orders = await Order.find({
    buyer: req.user._id,
  });

  res.json({
    role: 'buyer',
    stats: {
      orders: orders.length,
      spent: orders
        .filter((order) => order.payment.status === 'paid')
        .reduce((sum, order) => sum + order.total, 0),
      wishlist: req.user.wishlist.length,
    },
    recentOrders: orders.slice(0, 5),
  });
};