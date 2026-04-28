# Blur Mobile - Quick Start Guide

Get the mobile app running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Backend Server

In a separate terminal, navigate to the frontend directory and start the server:

```bash
cd ../frontend
npm run dev
```

The backend should be running on `http://localhost:3000`

## Step 3: Configure for Physical Device (Optional)

If testing on a physical device, update `.env` with your computer's IP address:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
EXPO_PUBLIC_SOCKET_URL=http://YOUR_IP:3000
```

Replace `YOUR_IP` with your actual IP address (e.g., `192.168.1.100`)

## Step 4: Start the Mobile App

```bash
npm start
```

## Step 5: Run on Device

Choose one option:

### Option A: Expo Go (Easiest)
1. Install Expo Go app on your phone
2. Scan the QR code from the terminal
3. App will load on your device

### Option B: iOS Simulator
Press `i` in the terminal

### Option C: Android Emulator
Press `a` in the terminal

## Step 6: Test the App

1. **Onboarding**: See the animated welcome screen
2. **Register**: Create a new account
3. **Create Room**: Make your first chat room
4. **Chat**: Send messages and see them in real-time
5. **Notifications**: Enable push notifications when prompted

## Testing Cross-Platform

1. Open the web app at `http://localhost:3000`
2. Login with the same account
3. Join the same room
4. Send messages from both web and mobile
5. Watch them sync in real-time! 🎉

## Common Issues

**"Network request failed"**
- Ensure backend is running
- Check your IP address in `.env`
- Make sure phone and computer are on the same network

**Fonts not loading**
```bash
npx expo start -c
```

**Socket not connecting**
- Verify backend is running on port 3000
- Check firewall settings
- Use IP address instead of localhost for physical devices

## Next Steps

- Read `PROJECT_GUIDE.md` for detailed documentation
- Explore the codebase structure
- Test push notifications on a physical device
- Customize the design system in `constants/Colors.ts`

## Features to Try

✅ Create multiple chat rooms  
✅ React to messages with emojis  
✅ Reply to specific messages  
✅ Enable push notifications  
✅ Test with web users  
✅ Experience haptic feedback  
✅ Enjoy smooth animations  

---

**Happy coding! 🚀**
