const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ✅ Trust proxy (needed for Render + rate limiting)
app.set('trust proxy', 1);

// ✅ Rate Limiting (safe defaults)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000,
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// ✅ CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:4201',
      'http://localhost:5000',
      'https://chronolink-project.onrender.com',
      'https://chronolink-project-1.onrender.com'
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🧭 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// ✅ Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// ✅ Serve Angular frontend in production
if (process.env.NODE_ENV === 'production') {
  // Try more robust frontend path detection for Render deployment
  let frontendPath = path.resolve(__dirname, '../frontend/dist/chronolink-frontend');

  const possiblePaths = [
    path.resolve(__dirname, '../frontend/dist/chronolink-frontend'),
    path.resolve(__dirname, './frontend/dist/chronolink-frontend'),
    path.resolve(__dirname, '../../frontend/dist/chronolink-frontend'),
    path.resolve(process.cwd(), 'frontend/dist/chronolink-frontend'),
    path.resolve(process.cwd(), 'dist/chronolink-frontend')
  ];

  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      frontendPath = testPath;
      break;
    }
  }

  console.log('🧭 Current working directory:', process.cwd());
  console.log('🧭 __dirname:', __dirname);
  console.log('🧭 Tested frontend paths:', possiblePaths);
  console.log('🧭 Serving frontend from:', frontendPath);
  console.log('🧭 Frontend path exists:', fs.existsSync(frontendPath));

  if (fs.existsSync(frontendPath)) {
    const files = fs.readdirSync(frontendPath);
    console.log('🧭 Files in frontend path (first 10):', files.slice(0, 10));
    console.log('🧭 Looking for main.*.js files:', files.filter(f => f.startsWith('main.') && f.endsWith('.js')));
  }

  // Custom middleware to serve static files with proper MIME types BEFORE API routes
  app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
      const filePath = path.join(frontendPath, req.path);
      if (fs.existsSync(filePath)) {
        console.log('🧭 Serving JS file:', req.path, 'with MIME type: application/javascript');
        res.setHeader('Content-Type', 'application/javascript');
        return res.sendFile(filePath);
      }
    }
    if (req.path.endsWith('.css')) {
      const filePath = path.join(frontendPath, req.path);
      if (fs.existsSync(filePath)) {
        console.log('🧭 Serving CSS file:', req.path, 'with MIME type: text/css');
        return res.sendFile(filePath);
      }
    }
    next();
  });

  app.use(express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.json')) res.setHeader('Content-Type', 'application/json');
      if (filePath.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
    }
  }));

  // ✅ API Routes (AFTER static file middleware)
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/posts', require('./routes/posts'));
  app.use('/api/users', require('./routes/users'));

  // ✅ Fallback route for Angular
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')) {
      const indexPath = path.join(frontendPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not found');
      }
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  });
} else {
  // ✅ API Routes (dev mode)
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/posts', require('./routes/posts'));
  app.use('/api/users', require('./routes/users'));

  // ✅ Dev mode
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.json({
        message: 'ChronoLink API Server',
        status: 'Backend running locally',
        frontend: 'http://localhost:4200',
        docs: 'API endpoints available at /api/*'
      });
    }
  });
}

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
