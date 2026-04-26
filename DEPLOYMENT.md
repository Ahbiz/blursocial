# Deployment Guide

## ⚠️ Important Note

This application uses a **custom Node.js server** for Socket.IO support. It **cannot** be deployed to serverless platforms like Vercel or Netlify in the standard way.

## ✅ Recommended Platforms

### 1. Railway (Easiest)
**Best for**: Quick deployment with minimal configuration

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add environment variables:
```bash
railway variables set MONGODB_URI="your_mongodb_uri"
railway variables set NODE_ENV="production"
```

4. Deploy:
```bash
railway up
```

**Pros**: Easy, automatic HTTPS, good free tier  
**Cons**: Can be pricey at scale

---

### 2. Render (Recommended)
**Best for**: Free tier with good performance

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Environment**: Node
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production
6. Click "Create Web Service"

**Pros**: Free tier available, reliable  
**Cons**: Cold starts on free tier

---

### 3. DigitalOcean App Platform
**Best for**: Scalable production apps

1. Create account at [digitalocean.com](https://www.digitalocean.com)
2. Go to App Platform
3. Create new app from GitHub
4. Configure:
   - **Build Command**: `pnpm install && pnpm build`
   - **Run Command**: `pnpm start`
5. Add environment variables
6. Deploy

**Pros**: Reliable, scalable, good pricing  
**Cons**: No free tier

---

### 4. Heroku
**Best for**: Traditional deployment

1. Install Heroku CLI:
```bash
npm install -g heroku
```

2. Login and create app:
```bash
heroku login
heroku create your-app-name
```

3. Add environment variables:
```bash
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set NODE_ENV="production"
```

4. Deploy:
```bash
git push heroku main
```

**Pros**: Well-documented, reliable  
**Cons**: No free tier anymore

---

### 5. VPS (Advanced)
**Best for**: Full control, custom configuration

Platforms: AWS EC2, DigitalOcean Droplet, Linode, Vultr

#### Setup on Ubuntu VPS:

1. **SSH into your server**:
```bash
ssh root@your-server-ip
```

2. **Install Node.js and pnpm**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

3. **Install PM2** (process manager):
```bash
npm install -g pm2
```

4. **Clone your repository**:
```bash
git clone your-repo-url
cd your-repo/frontend
```

5. **Install dependencies and build**:
```bash
pnpm install
pnpm build
```

6. **Create .env.local**:
```bash
nano .env.local
# Add: MONGODB_URI=your_uri
```

7. **Start with PM2**:
```bash
pm2 start server.js --name blur-chat
pm2 save
pm2 startup
```

8. **Set up Nginx** (reverse proxy):
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/blur
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/blur /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Add SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Pros**: Full control, cheapest at scale  
**Cons**: Requires server management skills

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Use strong MongoDB password
- [ ] Whitelist only necessary IPs in MongoDB Atlas
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (SSL certificate)
- [ ] Set secure cookie settings in production
- [ ] Add rate limiting (optional but recommended)
- [ ] Set up monitoring and logging
- [ ] Configure CORS properly
- [ ] Use environment variables (never commit secrets)

---

## 📊 MongoDB Atlas Production Setup

1. **Create Production Cluster**:
   - Go to MongoDB Atlas
   - Create new cluster (M2+ for production)
   - Choose region closest to your server

2. **Network Access**:
   - Add your server's IP address
   - Or use `0.0.0.0/0` (less secure but easier)

3. **Database User**:
   - Create user with strong password
   - Grant read/write access to `blur_chat` database

4. **Connection String**:
   - Use SRV connection string
   - Add to environment variables

5. **Indexes** (Recommended):
```javascript
// Connect to your database and run:
db.rooms.createIndex({ slug: 1 }, { unique: true })
db.messages.createIndex({ roomId: 1, timestamp: 1 })
db.users.createIndex({ username: 1 }, { unique: true })
```

---

## 🚀 Deployment Checklist

- [ ] Build succeeds locally (`pnpm build`)
- [ ] Environment variables configured
- [ ] MongoDB Atlas connection works
- [ ] Custom server runs (`pnpm start`)
- [ ] Socket.IO connects properly
- [ ] Test all features in production
- [ ] Set up domain name (optional)
- [ ] Configure SSL certificate
- [ ] Set up monitoring
- [ ] Configure backups

---

## 🔍 Monitoring & Logging

### Recommended Tools:
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Analytics**: Plausible, Umami (privacy-friendly)
- **Logs**: Papertrail, Logtail

### PM2 Monitoring (VPS):
```bash
pm2 monit
pm2 logs blur-chat
pm2 restart blur-chat
```

---

## 🐛 Troubleshooting Production Issues

### Socket.IO not connecting
- Check WebSocket support on platform
- Verify proxy configuration (Nginx/Apache)
- Check firewall rules
- Ensure custom server is running

### MongoDB connection timeout
- Check IP whitelist in Atlas
- Verify connection string
- Check network connectivity
- Verify credentials

### Build fails
- Check Node.js version (18+)
- Clear `.next` folder
- Reinstall dependencies
- Check for TypeScript errors

### App crashes
- Check logs (`pm2 logs` or platform logs)
- Verify environment variables
- Check memory limits
- Monitor CPU usage

---

## 💰 Cost Estimates

### Free Tier Options:
- **Render**: Free (with limitations)
- **MongoDB Atlas**: Free M0 cluster
- **Total**: $0/month

### Production Setup:
- **Render/Railway**: $7-20/month
- **MongoDB Atlas**: $9/month (M2)
- **Domain**: $10-15/year
- **Total**: ~$20-30/month

### VPS Setup:
- **DigitalOcean Droplet**: $6/month
- **MongoDB Atlas**: $9/month (M2)
- **Domain**: $10-15/year
- **Total**: ~$15-20/month

---

## 📈 Scaling Considerations

When your app grows:

1. **Database**: Upgrade MongoDB cluster
2. **Server**: Increase RAM/CPU
3. **Caching**: Add Redis for sessions
4. **CDN**: Use Cloudflare for static assets
5. **Load Balancing**: Multiple server instances
6. **Message Cleanup**: Auto-delete old messages
7. **Rate Limiting**: Prevent abuse

---

## 🎉 Post-Deployment

After successful deployment:

1. Test all features thoroughly
2. Share your app with users
3. Monitor performance and errors
4. Collect feedback
5. Iterate and improve

---

**Need help?** Check platform-specific documentation or community forums.
