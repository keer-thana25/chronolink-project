# ChronoLink - Frontend

A modern Angular application for connecting generations through timeless stories.

## Features

- **Splash Screen**: Animated GSAP-powered introduction
- **Authentication**: JWT-based login/signup with username/password
- **Home Feed**: Social media-style feed with posts from followed users
- **Generation Connection**: Interactive flashcards bridging older and younger generations
- **AI Recommendations**: Personalized content suggestions based on user interests
- **Profile Management**: User profiles with stats, achievements, and interests
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: GSAP-powered transitions and interactions

## Tech Stack

- **Framework**: Angular 17+ (Standalone Components)
- **Styling**: Tailwind CSS
- **Animations**: GSAP (GreenSock Animation Platform)
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS BehaviorSubjects
- **TypeScript**: Strict mode enabled

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Angular CLI

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   ng serve
   ```

3. **Open your browser**:
   Navigate to `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── components/          # Feature components
│   │   ├── auth/           # Authentication component
│   │   ├── home/           # Home feed component
│   │   ├── connect-generations/  # Generation bridging
│   │   ├── ai-recommendations/   # AI suggestions
│   │   ├── profile/        # User profile
│   │   └── splash-screen/  # App introduction
│   ├── services/           # Angular services
│   │   ├── auth.service.ts       # Authentication logic
│   │   ├── posts.service.ts      # Posts API calls
│   │   ├── users.service.ts      # Users API calls
│   │   └── gsap.service.ts       # Animation utilities
│   ├── guards/             # Route guards
│   └── app.config.ts       # App configuration
├── environments/           # Environment configs
└── styles.scss            # Global styles
```

## Key Components

### Splash Screen
- GSAP-powered logo animation
- Zoom and slide transitions
- Auto-navigation to auth page

### Authentication
- Toggle between login/signup modes
- Form validation
- JWT token management
- Demo account information

### Home Feed
- Sidebar navigation
- Post cards with interactions
- Scroll-triggered animations
- Like/comment functionality

### Connect Generations
- Animated generation indicators
- Interactive flashcards
- Flip animations
- Alternating content display

### AI Recommendations
- Category-based filtering
- Personalized suggestions
- Smart content discovery

### Profile
- User statistics display
- Achievement badges
- Personal post history
- Interest tags

## GSAP Animations

The app features extensive GSAP animations:

- **Page Transitions**: Smooth route changes
- **Scroll Animations**: Elements animate on scroll
- **Hover Effects**: Interactive feedback
- **Loading States**: Skeleton animations
- **Card Interactions**: Flip and transform effects

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interactions
- Optimized for all screen sizes

## Development

### Code Style
- ESLint + Prettier configuration
- Angular Style Guide compliance
- Consistent naming conventions

### Performance
- Lazy loading for routes
- OnPush change detection strategy
- Optimized bundle size
- Image optimization

## API Integration

The frontend communicates with a Node.js/Express backend:

- RESTful API endpoints
- JWT authentication
- Real-time data updates
- Error handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if necessary
5. Submit a pull request

## License

This project is licensed under the MIT License.
