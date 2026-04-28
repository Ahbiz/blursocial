# Setup Guide for Blur Chat Platform

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the frontend directory:

```bash
cp env.example .env.local
```

### 2. MongoDB Atlas Configuration

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier is sufficient)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Paste the URI into your `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blur_chat?retryWrites=true&w=majority
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Testing the Application

### 1. Create an Account
- Navigate to `http://localhost:3000`
- Click "Get Started" or "Sign Up"
- Create a username and password
- You'll be redirected to the dashboard

### 2. Create a Chat Room
- Click "Create Room" button
- Enter a room name (e.g., "Team Discussion")
- Set a password for the room (e.g., "test123")
- Click "Create Room"
- Copy the room link

### 3. Test Anonymous Chat
- Open the room link in an incognito/private browser window
- Enter the room password
- Start sending messages
- Open the same link in another browser/tab
- Enter the password and see messages in realtime
- Notice that no usernames are shown - completely anonymous!

## Features to Test

### Authentication
- ✅ User registration with validation
- ✅ User login
- ✅ Session persistence
- ✅ Logout functionality

### Room Management
- ✅ Create password-protected rooms
- ✅ View all created rooms
- ✅ Copy room links
- ✅ Open rooms directly

### Chat Functionality
- ✅ Password verification before joining
- ✅ Real-time message sending
- ✅ Real-time message receiving
- ✅ Optimistic UI updates
- ✅ Message history loading
- ✅ Anonymous messaging (no usernames shown)

### UI/UX
- ✅ Responsive design (test on mobile)
- ✅ Smooth animations
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

## Troubleshooting

### MongoDB Connection Issues

**Error**: "MongoServerError: bad auth"
- **Solution**: Check your MongoDB username and password in the connection string

**Error**: "MongooseServerSelectionError"
- **Solution**: 
  1. Check your internet connection
  2. Verify your IP is whitelisted in MongoDB Atlas (Network Access)
  3. Try using `0.0.0.0/0` to allow all IPs (for development only)

### Socket.IO Connection Issues

**Error**: Messages not appearing in real-time
- **Solution**: 
  1. Make sure you're using `pnpm dev` (not `next dev`)
  2. Check browser console for Socket.IO connection errors
  3. Verify the custom server is running (server.js)

### Build Issues

**Error**: Module not found
- **Solution**: Run `pnpm install` again

**Error**: TypeScript errors
- **Solution**: Run `pnpm build` to see detailed errors

## Production Deployment

### Environment Variables
Set the following in your production environment:
```env
MONGODB_URI=your_production_mongodb_uri
NODE_ENV=production
```

### Build and Start
```bash
pnpm build
pnpm start
```

### Platform Requirements
- Must support custom Node.js servers (for Socket.IO)
- Recommended: Railway, Render, DigitalOcean, AWS, or VPS
- Not recommended: Vercel (doesn't support custom servers well)

## Security Notes

- Passwords are hashed using bcrypt
- Sessions are HTTP-only cookies
- Room passwords are also hashed
- No user information is exposed in chat rooms
- Messages are stored in MongoDB with only room reference

## Performance Optimization

- Messages are limited to last 100 per room
- Optimistic UI updates for instant feedback
- Socket.IO for efficient real-time communication
- MongoDB indexes on frequently queried fields (recommended)

## Next Steps

1. Add MongoDB indexes for better performance:
```javascript
// In MongoDB Atlas or MongoDB Compass
db.rooms.createIndex({ slug: 1 }, { unique: true })
db.messages.createIndex({ roomId: 1, timestamp: 1 })
db.users.createIndex({ username: 1 }, { unique: true })
```

2. Consider adding:
   - Message deletion (after X hours)
   - Room expiration
   - Rate limiting
   - User avatars (anonymous but colorful)
   - Typing indicators
   - Online user count

## Support

For issues or questions, check:
- MongoDB Atlas documentation
- Next.js documentation
- Socket.IO documentation
