const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Post = require('./models/Post');

const seedData = async () => {
  try {
    console.log('🌱 Starting seed process...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create sample users
    const users = [
      {
        username: 'grandpa_john',
        password: 'password123',
        role: 'user',
        generation: 'older',
        bio: '80 years of wisdom to share. Love telling stories about the old days.',
        interests: ['Heritage', 'History', 'Literature'],
        achievements: ['Best Storyteller', 'Cultural Keeper']
      },
      {
        username: 'wisdom_sarah',
        password: 'password123',
        role: 'user',
        generation: 'older',
        bio: 'Retired teacher with a passion for literature and inspiring young minds.',
        interests: ['Literature', 'Inspiration', 'Art'],
        achievements: ['Wisdom Sharer', 'Inspiration Giver']
      },
      {
        username: 'young_maya',
        password: 'password123',
        role: 'user',
        generation: 'younger',
        bio: 'College student studying technology and history. Love connecting past and present.',
        interests: ['Technology', 'History', 'Heritage'],
        achievements: ['Bridge Builder']
      },
      {
        username: 'creative_alex',
        password: 'password123',
        role: 'user',
        generation: 'younger',
        bio: 'Digital artist exploring traditional art forms through modern technology.',
        interests: ['Art', 'Technology', 'Inspiration'],
        achievements: ['Cultural Keeper']
      },
      {
        username: 'admin_user',
        password: 'admin123',
        role: 'admin',
        generation: 'older',
        bio: 'Platform administrator ensuring quality content and community guidelines.',
        interests: ['Literature', 'Art', 'Heritage'],
        achievements: ['Best Storyteller', 'Cultural Keeper', 'Wisdom Sharer']
      }
    ];

    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create sample posts
    const posts = [
      // Older generation posts
      {
        title: 'The Lost Art of Letter Writing',
        content: 'In my time, we used to write letters by hand. Each word was carefully chosen, each sentence crafted with love. There was something magical about receiving a handwritten letter in the mail. The paper would carry the scent of the sender, and you could almost hear their voice as you read. Today, everything is instant, but we\'ve lost that personal touch. Young people, I encourage you to try writing a letter to someone you love. You might be surprised by how meaningful it feels.',
        category: 'Literature',
        generation: 'older',
        author: createdUsers.find(u => u.username === 'grandpa_john')._id,
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center'
      },
      {
        title: 'Lessons from the Great Depression',
        content: 'I was just a child during the Great Depression, but those years taught me valuable lessons about resilience and gratitude. We had very little, but we made do with what we had. I learned that happiness doesn\'t come from material possessions, but from the relationships we build and the simple joys in life. When I see young people today struggling with modern pressures, I want to tell them: you are stronger than you think, and the most important things in life aren\'t things at all.',
        category: 'Heritage',
        generation: 'older',
        author: createdUsers.find(u => u.username === 'wisdom_sarah')._id,
        mediaType: 'text'
      },
      {
        title: 'Traditional Recipes That Tell Our Family Story',
        content: 'Every Sunday, my grandmother would make her famous apple pie. The recipe wasn\'t written down - it was passed from generation to generation through hands-on teaching. I still remember the smell of cinnamon and fresh apples filling the kitchen. These recipes aren\'t just about food; they\'re about preserving our family history and the love that went into every meal. I\'ve started teaching my grandchildren these same recipes, ensuring our traditions continue.',
        category: 'Heritage',
        generation: 'older',
        author: createdUsers.find(u => u.username === 'grandpa_john')._id,
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center'
      },
      {
        title: 'The Power of Patience in a Fast World',
        content: 'When I was young, we didn\'t have instant everything. If you wanted to talk to someone far away, you wrote a letter and waited weeks for a response. If you wanted to learn something, you went to the library and searched through books. This taught us patience and the value of anticipation. Today, everything is instant, but I wonder if we\'ve lost something precious. Sometimes, waiting makes the reward that much sweeter.',
        category: 'Inspiration',
        generation: 'older',
        author: createdUsers.find(u => u.username === 'wisdom_sarah')._id,
        mediaType: 'text'
      },

      // Younger generation posts
      {
        title: 'Bridging the Digital Divide',
        content: 'As a young person passionate about technology, I\'ve made it my mission to help older adults learn digital skills. I volunteer at a local senior center, teaching everything from video calls to social media. The joy on their faces when they connect with distant grandchildren for the first time is priceless. Technology should bring us together, not create barriers between generations. I believe we young people have a responsibility to share our digital knowledge while learning from the wisdom of our elders.',
        category: 'Technology',
        generation: 'younger',
        author: createdUsers.find(u => u.username === 'young_maya')._id,
        mediaType: 'text'
      },
      {
        title: 'Digital Art Meets Traditional Crafts',
        content: 'I\'ve been experimenting with combining traditional art techniques with digital tools. Using my grandmother\'s embroidery patterns as inspiration, I create digital illustrations that blend the old with the new. It\'s fascinating how technology can preserve and transform traditional art forms. I\'ve started an online community where young artists share their digital interpretations of traditional crafts. The feedback from older artisans has been incredible - they see it as a way to keep their traditions alive in the modern world.',
        category: 'Art',
        generation: 'younger',
        author: createdUsers.find(u => u.username === 'creative_alex')._id,
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center'
      },
      {
        title: 'Why History Matters More Than Ever',
        content: 'Studying history isn\'t just about memorizing dates and events - it\'s about understanding how we got here and learning from the past to build a better future. As a history major, I\'m constantly amazed by how the challenges we face today echo those of previous generations. I\'ve started interviewing older family members about their life experiences, and their stories have completely changed my perspective on current events. We need to listen to our elders - they\'ve lived through what we\'re only reading about in books.',
        category: 'History',
        generation: 'younger',
        author: createdUsers.find(u => u.username === 'young_maya')._id,
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center'
      },
      {
        title: 'The Future of Sustainable Living',
        content: 'Growing up, I heard stories from my grandparents about how things used to be made to last. In our throwaway culture, I think we\'ve lost that appreciation for quality and sustainability. I\'ve been learning traditional skills like mending clothes, growing vegetables, and preserving food - not just for nostalgia, but because these skills are becoming essential again. By combining traditional wisdom with modern innovation, I believe we can create a more sustainable future. My grandparents are my greatest teachers in this journey.',
        category: 'Inspiration',
        generation: 'younger',
        author: createdUsers.find(u => u.username === 'creative_alex')._id,
        mediaType: 'text'
      }
    ];

    const createdPosts = await Post.create(posts);
    console.log(`✅ Created ${createdPosts.length} posts`);

    // Note: Followers system not implemented in current version
    console.log('✅ Users created successfully (followers system not implemented)');

    // Feature some posts (admin action)
    const admin = createdUsers.find(u => u.username === 'admin_user');
    if (admin) {
      // Feature a couple of posts from each generation
      await Post.findByIdAndUpdate(createdPosts[0]._id, { isFeatured: true }); // Letter writing post
      await Post.findByIdAndUpdate(createdPosts[4]._id, { isFeatured: true }); // Digital divide post
      console.log('✅ Featured some posts');
    }

    console.log('🎉 Seed process completed successfully!');
    console.log('\n📋 Sample Accounts Created:');
    console.log('Older Generation:');
    console.log('- grandpa_john / password123');
    console.log('- wisdom_sarah / password123');
    console.log('\nYounger Generation:');
    console.log('- young_maya / password123');
    console.log('- creative_alex / password123');
    console.log('\nAdmin:');
    console.log('- admin_user / admin123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
};

// Run seed if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
