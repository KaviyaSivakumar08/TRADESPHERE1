import { Router } from 'express';
import * as cropController from '../controllers/cropController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', cropController.listCrops);

router.get('/mine', protect, cropController.myCrops);

router.post('/', protect, cropController.createCrop);

router.get('/:id', cropController.getCrop);

router.patch('/:id', protect, cropController.updateCrop);

router.delete('/:id', protect, cropController.deleteCrop);

// Backend checks that this buyer received the product first.
router.post('/:id/reviews', protect, cropController.addReview);

export default router;