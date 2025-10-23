const mongoose = require('mongoose');
const Post = require('./models/Post');
require('dotenv').config();

const samplePosts = [
  {
    imageUrl: 'https://i.postimg.cc/SsVzBqJK/3D-objects-3D-illustration-3D-art-3D-clipart.jpg',
    caption: 'Arjuna had Krishna. We have AI.',
    category: 'blend',
    generation: 'young',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=1',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://i.ibb.co/1G2hgZCN/3D-objects-3D-illustration-3D-art-3D-clipart.jpg',
    caption: 'From dharma to data — the evolution of wisdom.',
    category: 'blend',
    generation: 'old',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=2',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://i.postimg.cc/SsVzBqJK/3D-objects-3D-illustration-3D-art-3D-clipart.jpg',
    caption: 'Karma in code — where Bhagavad Gita meets AI.',
    category: 'blend',
    generation: 'young',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=3',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://picsum.photos/800/800?random=4',
    caption: 'Past wisdom, future vision.',
    category: 'blend',
    generation: 'old',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=4',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://picsum.photos/800/800?random=5',
    caption: 'Bridging time, one swipe at a time.',
    category: 'blend',
    generation: 'young',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=5',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://picsum.photos/800/800?random=6',
    caption: 'Ancient scriptures meet modern algorithms.',
    category: 'blend',
    generation: 'old',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=6',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://picsum.photos/800/800?random=7',
    caption: 'Wisdom of the ages in the palm of your hand.',
    category: 'blend',
    generation: 'young',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=7',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://picsum.photos/800/800?random=8',
    caption: 'From Vedas to VR — the journey of knowledge.',
    category: 'blend',
    generation: 'old',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=8',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://picsum.photos/800/800?random=9',
    caption: 'Sacred texts and smart tech.',
    category: 'blend',
    generation: 'young',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=9',
    likes: [],
    comments: []
  },
  {
    imageUrl: 'https://picsum.photos/800/800?random=10',
    caption: 'Eternal truths in digital form.',
    category: 'blend',
    generation: 'old',
    createdBy: 'system',
    username: 'system',
    profilePicture: 'https://picsum.photos/100/100?random=10',
    likes: [],
    comments: []
  }
];

async function seedPosts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing posts
    await Post.deleteMany({});
    console.log('Cleared existing posts');

    // Insert sample posts
    const posts = await Post.insertMany(samplePosts);
    console.log(`Seeded ${posts.length} posts`);

    console.log('Posts seeded successfully');
  } catch (error) {
    console.error('Error seeding posts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedPosts();
