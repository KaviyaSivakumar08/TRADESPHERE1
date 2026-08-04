import { Router } from 'express';
import {
  createOrder,
  listOrders,
  updateSellerStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// Every logged-in user can see their buying and selling orders.
router.get('/', listOrders);

// Every logged-in user can buy crops.
router.post('/', createOrder);

// A user can approve only products that belong to them.
router.patch('/:id/seller-status', updateSellerStatus);

export default router;