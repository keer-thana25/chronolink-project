const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get all users with pagination
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const generation = req.query.generation;

    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (generation) query.generation = generation;

    const users = await User.find(query)
      .select('username generation profilePicture bio achievements')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting users' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username generation profilePicture bio achievements createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's post count
    const postCount = await Post.countDocuments({ author: req.params.id });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        postCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting user' });
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Simplified: just return success for now (no followers system implemented)
    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error following user' });
  }
};

// @desc    Unfollow user
// @route   DELETE /api/users/:id/follow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simplified: just return success for now (no followers system implemented)
    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error unfollowing user' });
  }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simplified: return empty array (no followers system implemented)
    res.json({
      success: true,
      followers: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting followers' });
  }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simplified: return empty array (no following system implemented)
    res.json({
      success: true,
      following: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting following' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { bio, interests, achievements } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (interests !== undefined) user.interests = interests;
    if (achievements !== undefined) user.achievements = achievements;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        generation: user.generation,
        bio: user.bio,
        interests: user.interests,
        achievements: user.achievements
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { q, generation } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let query = {
      username: { $regex: q, $options: 'i' },
      isActive: true
    };

    if (generation) query.generation = generation;

    const users = await User.find(query)
      .select('username generation profilePicture bio achievements')
      .limit(20);

    res.json({
      success: true,
      users,
      query: q
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error searching users' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  updateProfile,
  searchUsers
};
