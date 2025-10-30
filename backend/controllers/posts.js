const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts with pagination
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const generation = req.query.generation;

    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (category) query.category = category;
    if (generation) query.generation = generation;

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting posts' });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('likes.user', 'username')
      .populate('comments.user', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting post' });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // Handle uploaded file
    let mediaUrl = '';
    let imageUrl = '';
    if (req.file && req.file.path) {
      mediaUrl = req.file.path; // Cloudinary gives full HTTPS URL
    imageUrl = mediaUrl;
    }


    // Keep the category as-is since we now support all categories
    let mappedCategory = category;

    // Set generation based on user profile (fallback to 'young')
    const userGeneration = req.user?.generation || 'young';

    // Map content to caption for the model
    const caption = content || title || 'New post';

    const post = await Post.create({
      title: title || caption,
      content: content || caption,
      caption: caption, // Required field
      imageUrl: imageUrl, // Required field
      mediaType: req.file ? 'image' : 'text',
      mediaUrl,
      category: mappedCategory,
      generation: userGeneration,
      author: req.user.id,
      createdBy: req.user.username || 'user'
    });

    await post.populate('author', 'username');

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      message: 'Server error creating post',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content, mediaType, mediaUrl, mediaBase64, category, isFeatured } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (mediaType) post.mediaType = mediaType;
    if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;
    if (mediaBase64 !== undefined) post.mediaBase64 = mediaBase64;
    if (category) post.category = category;
    if (isFeatured !== undefined) {
      post.isFeatured = isFeatured;
    }

    await post.save();
    await post.populate('author', 'username');

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating post' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
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

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    console.log('Attempting to like/unlike post. User ID:', req.user?.id); // Debug log
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    } else {
      // Like the post
      post.likes.push({ user: req.user.id });
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes.length,
      isLiked: likeIndex === -1
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
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user.id,
      text
    });

    await post.save();
    await post.populate('comments.user', 'username');

    res.json({
      success: true,
      comments: post.comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

// @desc    Get user feed
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    // Simplified user model doesn't have following field
    // For now, just return user's own posts

    const posts = await Post.find({
      author: req.user.id,
      isActive: true
    })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(20);

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
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting featured posts' });
  }
};

// @desc    Get generation connection posts (alternating young/old)
// @route   GET /api/posts/generation-connection
// @access  Public
const getGenerationConnection = async (req, res) => {
  try {
    // Get all posts including user posts (no limit for unlimited posts)
    const allPosts = await Post.find({
      isActive: true
    })
      .populate('author', 'username generation')
      .sort({ createdAt: -1 });

    // Separate posts by generation
    const youngPosts = allPosts.filter(post => post.generation === 'young');
    const oldPosts = allPosts.filter(post => post.generation === 'old');
    const unknownPosts = allPosts.filter(post => post.generation === 'Unknown');

    // Combine all posts, prioritizing user posts (Unknown generation)
    const alternatingPosts = [...unknownPosts, ...youngPosts, ...oldPosts];

    res.json({
      success: true,
      posts: alternatingPosts // Return all posts without limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting generation connection posts' });
  }
};

// @desc    Get generation connection posts for a logged-in user
// @route   GET /api/posts/generation-connection/me
// @access  Private
const getGenerationConnectionForUser = async (req, res) => {
  try {
    const allPosts = await Post.find({ isActive: true })
      .populate('author', 'username generation')
      .sort({ createdAt: -1 })
      .lean();

    const postsWithLikeStatus = allPosts.map(post => ({
      ...post,
      id: post._id.toString(), // Explicitly map _id to id
      isLiked: post.likes.some(like => like.user.toString() === req.user.id)
    }));

    const youngPosts = postsWithLikeStatus.filter(p => p.generation === 'young');
    const oldPosts = postsWithLikeStatus.filter(p => p.generation === 'old');
    const unknownPosts = postsWithLikeStatus.filter(p => p.generation === 'Unknown');

    const alternatingPosts = [...unknownPosts, ...youngPosts, ...oldPosts];

    res.json({
      success: true,
      posts: alternatingPosts // Return all posts without limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting generation connection posts' });
  }
};

// @desc    Get AI recommendations based on user interests
// @route   GET /api/posts/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
  try {
    const userId = req.query.userId;
    const selectedCategory = req.query.category; // New parameter for selected category

    let categories = [];

    if (selectedCategory) {
      // If a specific category is selected, show posts from that category
      categories = [selectedCategory];
    } else {
      // Default to popular categories if no specific category selected
      categories = ['Spirituality', 'Literature', 'Art', 'Heritage', 'Inspiration'];
    }

    const posts = await Post.find({
      category: { $in: categories },
      isActive: true,
      ...(userId && { author: { $ne: userId } }) // Exclude user's own posts
    })
      .populate('author', 'username')
      .sort({ likes: -1, createdAt: -1 })
      .limit(20); // Increased limit for better recommendations

    res.json({
      success: true,
      posts,
      basedOn: selectedCategory ? `category_${selectedCategory}` : 'popular_categories'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting recommendations' });
  }
};

// @desc    Seed demo posts for Connect page
// @route   GET /api/posts/seed-visuals
// @access  Public (dev only)
const seedVisuals = async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Seeding not allowed in production' });
    }

    const force = req.query.force === 'true';

    // Check if posts already exist
    const existingPosts = await Post.countDocuments();
    if (existingPosts > 0 && !force) {
      return res.json({
        success: true,
        message: 'Posts already exist. Use ?force=true to reseed',
        inserted: 0
      });
    }

    // Clear existing posts if forcing
    if (force) {
      await Post.deleteMany({});
    }

    // Seed posts
    const samplePosts = [
      {
        imageUrl: 'https://ibb.co/1G2hgZCN',
        caption: 'Arjuna had Krishna. We have AI.',
        category: 'blend',
        generation: 'young',
        createdBy: 'system',
        username: 'system',
        profilePicture: 'https://source.unsplash.com/100x100/?avatar&sig=1',
        likes: [],
        comments: []
      },
      {
        imageUrl: 'https://source.unsplash.com/800x800/?meditation,temple&sig=2',
        caption: 'From dharma to data — the evolution of wisdom.',
        category: 'blend',
        generation: 'old',
        createdBy: 'system',
        username: 'system',
        profilePicture: 'https://source.unsplash.com/100x100/?avatar&sig=2',
        likes: [],
        comments: []
      },
      {
        imageUrl: 'https://source.unsplash.com/800x800/?coding,meditation&sig=3',
        caption: 'Karma in code — where Bhagavad Gita meets AI.',
        category: 'blend',
        generation: 'young',
        createdBy: 'system',
        username: 'system',
        profilePicture: 'https://source.unsplash.com/100x100/?avatar&sig=3',
        likes: [],
        comments: []
      },
      {
        imageUrl: 'https://source.unsplash.com/800x800/?wisdom,future&sig=4',
        caption: 'Past wisdom, future vision.',
        category: 'blend',
        generation: 'old',
        createdBy: 'system',
        username: 'system',
        profilePicture: 'https://source.unsplash.com/100x100/?avatar&sig=4',
        likes: [],
        comments: []
      },
      {
        imageUrl: 'https://source.unsplash.com/800x800/?smartphone,ancient&sig=5',
        caption: 'Bridging time, one swipe at a time.',
        category: 'blend',
        generation: 'young',
        createdBy: 'system',
        username: 'system',
        profilePicture: 'https://source.unsplash.com/100x100/?avatar&sig=5',
        likes: [],
        comments: []
      }
    ];

    const posts = await Post.insertMany(samplePosts);

    res.json({
      success: true,
      message: 'Demo visuals added',
      inserted: posts.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error seeding posts' });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  getGenerationConnectionForUser,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getFeed,
  getFeaturedPosts,
  getGenerationConnection,
  getRecommendations,
  seedVisuals
};
