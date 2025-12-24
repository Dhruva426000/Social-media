import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost,deletePost,likeunlikePost,commentOnPost,deleteComment,getAllPosts,getLikedPosts ,getFollowingPost,getUserPosts} from '../controllers/post.controller.js';

const router = express.Router();

router.get('/all',protectRoute,getAllPosts);
router.get('/following',protectRoute,getFollowingPost);
router.get('/likes/:id',protectRoute,getLikedPosts);
router.get('/user/:username',protectRoute,getUserPosts);
router.post('/create',protectRoute,createPost);
router.post('/like/:id',protectRoute,likeunlikePost);
router.post('/comment/:id',protectRoute,commentOnPost);
router.delete('/:id',protectRoute,deletePost);
router.delete("/:id/comments/:commentId", protectRoute, deleteComment);


export default router;