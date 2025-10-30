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

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following list of current user
    currentUser.following.push(req.params.id);
    await currentUser.save();

    // Add to followers list of target user
    userToFollow.followers.push(req.user.id);
    await userToFollow.save();

    res.json({
      success: true,
      message: 'User followed successfully',
      following: currentUser.following.length,
      followers: userToFollow.followers.length
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

    // Check if actually following
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    await currentUser.save();

    // Remove from followers list of target user
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id);
    await userToUnfollow.save();

    res.json({
      success: true,
      message: 'User unfollowed successfully',
      following: currentUser.following.length,
      followers: userToUnfollow.followers.length
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
    const user = await User.findById(req.params.id)
      .populate('followers', 'username generation profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      followers: user.followers
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
    const user = await User.findById(req.params.id)
      .populate('following', 'username generation profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      following: user.following
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
