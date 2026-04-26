# 🚀 Quick Start - Get Running in 5 Minutes

## Step 1: Install Dependencies (1 min)
```bash
pnpm install
```

## Step 2: Set Up MongoDB (2 min)

### Option A: MongoDB Atlas (Recommended - Free)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

### Option B: Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
# or download from https://www.mongodb.com/try/download/community
```

## Step 3: Configure Environment (30 sec)
```bash
# Create .env.local file
echo 'MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blur_chat' > .env.local

# Replace with your actual MongoDB URI
```

## Step 4: Run the App (30 sec)
```bash
pnpm dev
```

## Step 5: Test It Out! (1 min)

1. **Open** http://localhost:3000
2. **Click** "Get Started"
3. **Create** an account (username: test, password: test123)
4. **Create** a room (name: "Test Room", password: "1234")
5. **Copy** the room link
6. **Open** the link in incognito mode
7. **Enter** the password (1234)
8. **Chat** anonymously! 🎉

---

## What You Just Built

✅ Secure user authentication  
✅ Password-protected chat rooms  
✅ Real-time messaging with Socket.IO  
✅ Complete anonymity in chats  
✅ Beautiful, responsive UI  
✅ Optimistic updates for instant feedback  

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed configuration
- Read [README.md](./README.md) for full documentation
- Customize colors in `app/globals.css`
- Deploy to production (see README.md)

## Need Help?

**MongoDB connection not working?**
- Check your username/password in the URI
- Whitelist your IP in MongoDB Atlas (Network Access → Add IP Address → Allow Access from Anywhere for testing)

**Socket.IO not connecting?**
- Make sure you're using `pnpm dev` (not `next dev`)
- Check browser console for errors

**Other issues?**
- Check [SETUP.md](./SETUP.md) troubleshooting section
