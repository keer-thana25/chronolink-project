const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  updateProfile,
  searchUsers
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.put('/profile', protect, updateProfile);

module.exports = router;
