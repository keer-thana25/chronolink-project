# ChronoLink - Backend

A Node.js/Express backend API for the ChronoLink application - connecting generations through timeless stories.

## Features

- **Authentication**: JWT-based user authentication with username/password
- **User Management**: User profiles, followers/following, achievements
- **Post Management**: Create, read, update, delete posts with media support
- **Generation Connection**: Specialized endpoints for bridging generations
- **AI Recommendations**: Smart content suggestions based on user interests
- **Media Handling**: Support for text, image, and video posts
- **Rate Limiting**: API protection against abuse
- **Data Validation**: Comprehensive input validation and sanitization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Mongoose schemas with built-in validation
- **Security**: bcrypt for password hashing, rate limiting
- **Media**: Multer for file uploads (base64 support)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env` and configure:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

3. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **For development**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Posts
- `GET /api/posts` - Get all posts (with pagination, filtering)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `GET /api/posts/feed` - Get user's feed
- `GET /api/posts/featured` - Get featured posts
- `GET /api/posts/generation-connection` - Get alternating generation posts
- `GET /api/posts/recommendations` - Get AI recommendations

### Users
- `GET /api/users` - Get all users (with pagination, filtering)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search` - Search users
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get user followers
- `GET /api/users/:id/following` - Get user following

## Data Models

### User Model
```javascript
{
  username: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin']),
  generation: String (enum: ['older', 'younger']),
  profilePicture: String,
  bio: String,
  interests: [String],
  achievements: [String],
  followers: [ObjectId],
  following: [ObjectId],
  isActive: Boolean
}
```

### Post Model
```javascript
{
  title: String (required),
  content: String (required),
  mediaType: String (enum: ['text', 'image', 'video']),
  mediaUrl: String,
  mediaBase64: String,
  category: String (required),
  generation: String (required),
  author: ObjectId (ref: User),
  likes: [{ user: ObjectId, createdAt: Date }],
  comments: [{ user: ObjectId, text: String, createdAt: Date }],
  isFeatured: Boolean,
  views: Number
}
```

## Authentication

The API uses JWT (JSON Web Token) authentication:

1. **Register/Login** to get a token
2. **Include token** in request headers:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## Sample Data

The seed script creates sample users and posts:

### Demo Accounts
- **Older Generation**:
  - `grandpa_john` / `password123`
  - `wisdom_sarah` / `password123`

- **Younger Generation**:
  - `young_maya` / `password123`
  - `creative_alex` / `password123`

- **Admin**:
  - `admin_user` / `admin123`

## Project Structure

```
backend/
├── controllers/          # Route controllers
│   ├── auth.js          # Authentication logic
│   ├── posts.js         # Post management
│   └── users.js         # User management
├── middleware/          # Custom middleware
│   └── auth.js          # JWT authentication
├── models/             # Mongoose models
│   ├── User.js         # User schema
│   └── Post.js         # Post schema
├── routes/             # API routes
│   ├── auth.js         # Auth routes
│   ├── posts.js        # Post routes
│   └── users.js        # User routes
├── .env               # Environment variables
├── seed.js           # Database seeding script
└── server.js         # Main server file
```

## Key Features

### Generation-Based Content
- Posts are categorized by generation (older/younger)
- Specialized endpoints for cross-generation content
- Dynamic color themes based on generation

### Smart Recommendations
- AI-powered content suggestions
- Based on user interests and categories
- Personalized feed algorithm

### Media Support
- Text, image, and video posts
- Base64 encoding for media storage
- File upload handling with Multer

### Social Features
- Follow/unfollow users
- Like and comment on posts
- User profiles with achievements
- Interest-based matching

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Express rate limiting middleware
- **Input Validation**: Mongoose schema validation
- **CORS Protection**: Configured CORS policies
- **Error Handling**: Comprehensive error responses

## Development

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chronolink
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### Database Seeding
```bash
npm run seed
```

This creates sample users, posts, and relationships for testing.

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","generation":"younger"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## Deployment

### Production Checklist
- [ ] Set strong JWT secret
- [ ] Configure production MongoDB URI
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (nginx)

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name "chronolink-backend"
pm2 startup
pm2 save
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if necessary
5. Submit a pull request

## License

This project is licensed under the MIT License.
