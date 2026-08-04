import { Router } from 'express';

import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const r = Router();

r.use(protect);

r.get('/:userId', async (req, res) => {
  const items = await Message.find({
    participants: {
      $all: [req.user.id, req.params.userId],
    },
  })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 });

  res.json({ items });
});

r.post('/:userId', async (req, res) => {
  const message = await Message.create({
    participants: [req.user.id, req.params.userId],
    sender: req.user.id,
    text: req.body.text,
  });

  req.app
    .get('io')
    .to(req.params.userId)
    .emit('message:new', message);

  res.status(201).json({ message });
});

export default r;