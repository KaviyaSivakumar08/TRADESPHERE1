import { Router } from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', async (req, res) => {
  const items = await Notification.find({
    recipient: req.user.id,
  })
    .sort({ createdAt: -1 })
    .limit(30);

  const unread = await Notification.countDocuments({
    recipient: req.user.id,
    read: false,
  });

  res.json({ items, unread });
});

router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { read: true },
    { new: true },
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json({ notification });
});

export default router;