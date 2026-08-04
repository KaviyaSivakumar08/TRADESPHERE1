import User from '../models/User.js';
import { signToken } from '../utils/token.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.avatar,
  farmName: user.farmName,
  addresses: user.addresses,
  wishlist: user.wishlist,
});

const respond = (res, user, status = 200) =>
  res.status(status).json({
    token: signToken(user._id, user.role),
    user: publicUser(user),
  });

export const register = async (req, res) => {
  const { name, email, password, role, phone, farmName } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required',
    });
  }

  if (role === 'admin') {
    return res.status(403).json({
      message: 'Admin accounts cannot be self-registered',
    });
  }

  const exists = await User.findOne({ email });

  if (exists) {
    return res.status(409).json({
      message: 'Email is already registered',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    farmName,
  });

  respond(res, user, 201);
};

export const login = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email?.toLowerCase(),
  }).select('+password');

  if (
    !user ||
    !(await user.matchesPassword(req.body.password || ''))
  ) {
    return res.status(401).json({
      message: 'Incorrect email or password',
    });
  }

  respond(res, user);
};

export const me = async (req, res) => {
  res.json({
    user: publicUser(req.user),
  });
};

export const updateProfile = async (req, res) => {
  const fields = [
    'name',
    'phone',
    'avatar',
    'farmName',
    'addresses',
  ];

  fields.forEach((key) => {
    if (req.body[key] !== undefined) {
      req.user[key] = req.body[key];
    }
  });

  await req.user.save();

  res.json({
    user: publicUser(req.user),
  });
};

export const toggleWishlist = async (req, res) => {
  const id = req.params.cropId;

  const exists = req.user.wishlist.some(
    (item) => item.toString() === id
  );

  req.user.wishlist = exists
    ? req.user.wishlist.filter(
        (item) => item.toString() !== id
      )
    : [...req.user.wishlist, id];

  await req.user.save();

  res.json({
    wishlist: req.user.wishlist,
  });
};