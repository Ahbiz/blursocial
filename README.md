# Blur - Anonymous Chat Platform

A modern, realtime anonymous chat platform built with Next.js and MongoDB. Create secure, password-protected chat rooms and share them instantly for anonymous conversations.

## Features

- 🔐 **Secure Authentication** - User registration and login with bcrypt password hashing
- 💬 **Realtime Messaging** - Instant message delivery using Socket.IO
- 🎭 **Complete Anonymity** - No one knows who's speaking in chat rooms
- 🔒 **Password-Protected Rooms** - Each room requires a password to join
- 📱 **Fully Responsive** - Optimized for mobile-first experience
- ✨ **Modern UI/UX** - Clean, minimal design with smooth animations
- ⚡ **Optimistic Updates** - Messages appear instantly with optimistic UI
- 🎨 **Custom Design System** - Unique dark theme with CSS variables

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Custom CSS Variables
- **Realtime**: Socket.IO
- **Database**: MongoDB Atlas
- **Authentication**: Cookie-based sessions with bcrypt
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blur/frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Add your MongoDB Atlas URI to `.env.local`:
```env
MONGODB_URI=your_mongodb_atlas_uri_here
```

### Running the Application

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── rooms/        # Room management endpoints
│   ├── dashboard/        # User dashboard
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── room/[slug]/      # Chat room page
│   ├── globals.css       # Global styles and design system
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── lib/
│   ├── mongodb.ts        # Database connection
│   ├── auth.ts           # Authentication utilities
│   └── models/           # TypeScript interfaces
└── server.js             # Custom server for Socket.IO
```

## How It Works

1. **User Registration/Login**: Users create an account to manage chat rooms
2. **Create Room**: Authenticated users can create password-protected rooms
3. **Share Link**: Room creators get a shareable link with a unique slug
4. **Anonymous Access**: Anyone with the link and password can join anonymously
5. **Realtime Chat**: Messages are sent and received instantly via Socket.IO

## Design System

The application uses a custom dark theme with CSS variables for easy customization:

- **Colors**: Pink/red gradient accent colors
- **Typography**: Outfit font family
- **Animations**: Fade-in, slide-up, scale-in effects
- **Responsive**: Mobile-first approach with breakpoints

### Color Variables

Edit colors in `app/globals.css`:
```css
--accent-primary: #FF6B9D;
--accent-secondary: #C44569;
--bg-primary: #0B0D0F;
--text-primary: #F0F4F8;
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms/[slug]/verify` - Verify room password
- `GET /api/rooms/[slug]/messages` - Get room messages

## Socket.IO Events

### Client → Server
- `join-room` - Join a chat room
- `leave-room` - Leave a chat room
- `send-message` - Send a message

### Server → Client
- `new-message` - Receive new message
- `error` - Error notification

## Deployment

The application uses a custom Node.js server for Socket.IO support. Deploy to platforms that support custom servers:

1. Build the application:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

## Environment Variables

- `MONGODB_URI` - MongoDB Atlas connection string
- `NODE_ENV` - Environment (development/production)

## License

MIT
