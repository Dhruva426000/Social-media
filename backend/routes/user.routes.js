import exprees from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import {  getUserProfile,followUnfollowUser,getSuggestedUsers,updateUser } from '../controllers/user.controller.js';

const router = exprees.Router();

router.get('/profile/:username', protectRoute ,getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.post('/follow/:id', protectRoute, followUnfollowUser);
router.put('/update', protectRoute, updateUser);


export default router;