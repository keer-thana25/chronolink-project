const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getFeed,
  getFeaturedPosts,
  getGenerationConnection,
  getGenerationConnectionForUser,
  getRecommendations,
  getUserPosts
} = require('../controllers/posts');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');


// Public routes
router.get('/', getAllPosts);
router.get('/feed', getFeed);
router.get('/featured', getFeaturedPosts);
router.get('/generation-connection', getGenerationConnection);
router.get('/generation-connection/me', protect, getGenerationConnectionForUser);
router.get('/recommendations', getRecommendations);
router.get('/user/:userId', getUserPosts);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/:id', getPostById);
router.post('/', upload.single('image'), createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/comment', addComment);

module.exports = router;
