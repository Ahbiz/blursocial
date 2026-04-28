# Blur Mobile - Complete Project Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Physical device for push notifications testing

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
The `.env` file is already configured with:
```env
API_URL=http://localhost:3000
SOCKET_URL=http://localhost:3000
```

For physical device testing, replace `localhost` with your computer's IP address.

3. **Start the backend server** (in the frontend directory):
```bash
cd ../frontend
npm run dev
```

4. **Start the mobile app**:
```bash
npm start
```

5. **Run on your device**:
- Scan the QR code with Expo Go app (iOS/Android)
- Or press `i` for iOS Simulator
- Or press `a` for Android Emulator

## 📁 Project Structure

```
mobile/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout with providers & fonts
│   ├── index.tsx                # Onboarding screen (animated)
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Registration screen
│   ├── dashboard.tsx            # Room management dashboard
│   └── room/
│       └── [slug].tsx           # Chat room with Socket.IO
├── components/                   # Reusable UI components
│   ├── Button.tsx               # Animated button (3 variants)
│   ├── Input.tsx                # Form input with validation
│   ├── Card.tsx                 # Container component
│   ├── Toast.tsx                # Animated toast notification
│   └── ToastContainer.tsx       # Toast manager
├── contexts/                     # React contexts
│   └── ToastContext.tsx         # Global toast state
├── constants/                    # App constants
│   ├── Colors.ts                # Design system colors
│   └── Config.ts                # API URLs
├── utils/                        # Utility functions
│   ├── storage.ts               # AsyncStorage wrapper
│   └── notifications.ts         # Push notification helpers
└── types/                        # TypeScript types
    └── index.ts                 # Shared interfaces

## 🎨 Design System

### Colors
```typescript
Primary Background: #0B0D0F
Secondary Background: #12161A
Accent Primary: #FF6B9D (Pink)
Accent Secondary: #C44569 (Dark pink/red)
Success: #4ECDC4
Error: #FF6B6B
```

### Typography
- **Font**: Manrope (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Distinctive**: Avoids generic fonts (Inter, Roboto, Arial)

### Animations
- Spring physics for natural movement
- Haptic feedback on all interactions
- Staggered entrance animations
- Smooth transitions (200-400ms)

## 🔔 Push Notifications

### How It Works
1. User joins a chat room
2. After 2 seconds, prompted to enable notifications
3. If accepted, notifications are enabled for that room
4. New messages trigger local notifications
5. Preferences saved per room in AsyncStorage

### Testing
Push notifications require a **physical device**:

```bash
# Build development version
npx expo run:ios
# or
npx expo run:android
```

## 🔌 Socket.IO Integration

### Connection Flow
1. User verifies room password
2. Socket connects to backend server
3. Emits `join-room` event with room slug
4. Listens for `new-message` and `message-reactions-updated`
5. Sends messages with `send-message` event
6. Handles reactions with `react-message` event

### Cross-Platform Compatibility
- Mobile and web users chat in the same rooms
- Same Socket.IO server and events
- Identical message format
- Real-time synchronization

## 📱 Key Features

### Authentication
- Persistent sessions with AsyncStorage
- Form validation with error messages
- Loading states with haptic feedback
- Auto-redirect if already logged in

### Dashboard
- Create rooms with password protection
- Copy room links to clipboard
- Pull-to-refresh room list
- Animated empty states
- Logout functionality

### Chat Room
- Password verification before access
- Real-time messaging via Socket.IO
- Optimistic UI updates
- Message reactions (6 quick emojis)
- Reply to messages
- Push notification opt-in
- Keyboard-aware scrolling
- Message grouping by time

## 🎭 Component Library

### Button
```tsx
<Button 
  onPress={handlePress}
  variant="primary" // primary | secondary | ghost
  size="md"         // sm | md | lg
  isLoading={false}
>
  Click Me
</Button>
```

### Input
```tsx
<Input
  label="Username"
  placeholder="Enter username"
  value={value}
  onChangeText={setValue}
  error={error}
  secureTextEntry={false}
/>
```

### Toast
```tsx
const { showToast } = useToast();
showToast('Success message', 'success', 3000);
showToast('Error message', 'error');
```

## 🔐 Security

- Password hashing handled by backend
- Secure session storage
- Room password verification
- Anonymous messaging (no user IDs in messages)
- HTTPS recommended for production

## 🌐 API Endpoints

All requests use `API_URL` from config:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/rooms` | Get user's rooms |
| POST | `/api/rooms` | Create new room |
| POST | `/api/rooms/:slug/verify` | Verify room password |
| GET | `/api/rooms/:slug/messages` | Get room messages |

## 🧪 Development Tips

### Hot Reload
- Shake device or press `R` to reload
- Changes auto-reload in development

### Debug Menu
- iOS: Shake device or press `Cmd+D`
- Android: Shake device or press `Cmd+M`

### Network Debugging
- Use React Native Debugger
- Or Flipper for advanced debugging
- Check console for Socket.IO events

### Common Issues

**Socket connection fails:**
- Ensure backend is running on port 3000
- Use IP address instead of localhost for physical devices
- Check firewall settings

**Fonts not loading:**
```bash
npx expo start -c  # Clear cache
```

**Build errors:**
```bash
rm -rf node_modules
npm install
```

## 📦 Production Build

### iOS
1. Configure app signing in Xcode
2. Update `app.json` with bundle identifier
3. Build:
```bash
eas build --platform ios
```

### Android
1. Generate keystore
2. Update `app.json` with package name
3. Build:
```bash
eas build --platform android
```

## 🎯 Testing Checklist

- [ ] User registration works
- [ ] User login persists across app restarts
- [ ] Room creation successful
- [ ] Room password verification works
- [ ] Messages send and receive in real-time
- [ ] Web and mobile users can chat together
- [ ] Reactions work correctly
- [ ] Reply functionality works
- [ ] Push notifications prompt appears
- [ ] Notifications work on physical device
- [ ] Haptic feedback on all interactions
- [ ] Animations are smooth
- [ ] Toast messages display correctly
- [ ] Logout clears session

## 🤝 Contributing

This mobile app is designed to work seamlessly with the web frontend:

- Same backend API and database
- Same Socket.IO server
- Compatible message formats
- Shared room system

## 📝 Environment Setup

For development with physical device:

1. Find your computer's IP address:
   - Mac: System Preferences → Network
   - Windows: `ipconfig`
   - Linux: `ifconfig`

2. Update `.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:3000
```

3. Ensure backend allows connections from your IP

## 🎉 What's Special

1. **Production-Ready**: Fully functional, not a prototype
2. **Distinctive Design**: Custom color scheme, Manrope font
3. **Real Haptics**: Tactile feedback everywhere
4. **Smooth Animations**: Spring physics and timing
5. **Push Notifications**: Per-room preferences
6. **Cross-Platform**: Works with web users
7. **Type-Safe**: Full TypeScript coverage
8. **Well-Structured**: Clean architecture

---

**Built with ❤️ using React Native, Expo, and Socket.IO**
