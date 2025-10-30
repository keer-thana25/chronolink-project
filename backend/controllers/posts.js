const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isActive: true })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting posts' });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('likes.user', 'username')
      .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting post' });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, category, mediaType, mediaUrl, mediaBase64, generation } = req.body;

    const postData = {
      imageUrl: req.file ? req.file.path : '',
      caption: content, // Map content to caption as per model requirement
      category,
      title,
      content,
      mediaType,
      mediaUrl,
      mediaBase64,
      generation: generation || req.user.generation || 'young',
      author: req.user._id,
      username: req.user.username,
      profilePicture: req.user.profilePicture
    };

    const post = await Post.create(postData);

    await post.populate('author', 'username profilePicture');

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('author', 'username profilePicture');

    res.json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating post' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error liking post' });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.user', 'username profilePicture');

    res.json({
      success: true,
      comments: post.comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

// @desc    Get feed posts
// @route   GET /api/posts/feed
// @access  Public
const getFeed = async (req, res) => {
  try {
    const posts = await Post.find({ isActive: true })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting feed' });
  }
};

// @desc    Get featured posts
// @route   GET /api/posts/featured
// @access  Public
const getFeaturedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isFeatured: true, isActive: true })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting featured posts' });
  }
};

// @desc    Get generation connection posts
// @route   GET /api/posts/generation-connection
// @access  Public
const getGenerationConnection = async (req, res) => {
  try {
    const posts = await Post.find({ isActive: true })
      .populate('author', 'username profilePicture generation')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting generation connection' });
  }
};

// @desc    Get generation connection for user
// @route   GET /api/posts/generation-connection/me
// @access  Private
const getGenerationConnectionForUser = async (req, res) => {
  try {
    // Get all posts from other users (not the current user)
    const posts = await Post.find({
      author: { $ne: req.user._id }, // Exclude current user's posts
      isActive: true
    })
      .populate('author', 'username profilePicture generation')
      .sort({ createdAt: -1 }); // No limit - show all posts

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting generation connection for user' });
  }
};

// @desc    Get AI recommendations
// @route   GET /api/posts/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
  try {
    const posts = await Post.find({ isActive: true })
      .populate('author', 'username profilePicture')
      .sort({ likes: -1, createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting recommendations' });
  }
};

// @desc    Get posts by user ID
// @route   GET /api/posts/user/:userId
// @access  Public
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({
      author: userId,
      isActive: true
    })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting user posts' });
  }
};

module.exports = {
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
};
