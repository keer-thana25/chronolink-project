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
  seedVisuals
} = require('../controllers/posts');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ✅ Base URL setup
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://chronolink-project-1.onrender.com'
    : 'http://localhost:5000';

// 🔹 Middleware to fix image URLs before sending response
const fixImageUrls = (req, res, next) => {
  // Wrap res.json to intercept the data before sending
  const originalJson = res.json;
  res.json = function (data) {
    // If the data has posts
    if (data && data.posts && Array.isArray(data.posts)) {
      data.posts = data.posts.map(post => ({
        ...post,
        imageUrl: post.imageUrl?.startsWith('http')
          ? post.imageUrl
          : `${BASE_URL}${post.imageUrl}`,
      }));
    }

    // If the data has a single post
    if (data && data.post && data.post.imageUrl) {
      data.post.imageUrl = data.post.imageUrl.startsWith('http')
        ? data.post.imageUrl
        : `${BASE_URL}${data.post.imageUrl}`;
    }

    return originalJson.call(this, data);
  };
  next();
};

// Public routes
router.get('/', fixImageUrls, getAllPosts);
router.get('/featured', fixImageUrls, getFeaturedPosts);
router.get('/generation-connection', fixImageUrls, getGenerationConnection);
router.get('/generation-connection/me', protect, fixImageUrls, getGenerationConnectionForUser);
router.get('/recommendations', fixImageUrls, getRecommendations);
router.get('/seed-visuals', seedVisuals); // Dev only
router.get('/feed', protect, fixImageUrls, getFeed);
router.get('/:id', fixImageUrls, getPostById);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);

// Admin routes
router.put('/:id/feature', protect, authorize('admin'), updatePost);

module.exports = router;
