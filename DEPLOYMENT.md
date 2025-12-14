# 🌐 Deployment Guide

## For Production Use

### Option 1: Local Network Deployment (Recommended for Small Business)

#### 1. Build the Application
```bash
cd /home/haokha/workspace/lensy-cam
npm run build
```

#### 2. Update Environment
Create/edit `.env`:
```env
PORT=8899
JWT_SECRET=change-this-to-a-long-random-string-abc123xyz
NODE_ENV=production
```

#### 3. Start Production Server
```bash
npm start
```

#### 4. Access from Other Computers
Find your local IP address:
```bash
# On Linux/macOS
hostname -I

# On Windows
ipconfig
```

Other computers on the same network can access:
```
http://YOUR_IP_ADDRESS:8899
```

### Option 2: Cloud Deployment

#### Deploy to Heroku
```bash
# Install Heroku CLI first
heroku login
heroku create your-rental-app
heroku config:set JWT_SECRET=your-secret-key
git push heroku main
```

#### Deploy to DigitalOcean/AWS/Azure
1. Set up a VM with Node.js
2. Clone your repository
3. Run `npm run build`
4. Use PM2 to keep server running:
```bash
npm install -g pm2
pm2 start server/index.js
pm2 save
pm2 startup
```

### Option 3: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
WORKDIR /app/client
RUN npm install && npm run build
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 8899
CMD ["node", "server/index.js"]
```

Build and run:
```bash
docker build -t lensy-cam .
docker run -p 8899:8899 -v $(pwd)/rental.db:/app/rental.db lensy-cam
```

## Security Checklist for Production

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS (use nginx or Let's Encrypt)
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Limit access to authorized users only
- [ ] Keep dependencies updated (`npm update`)

## Backup Strategy

### Manual Backup
```bash
# Backup database
cp rental.db rental.db.backup.$(date +%Y%m%d)

# Backup to external location
scp rental.db user@backup-server:/backups/
```

### Automated Backup (Linux/macOS)
Add to crontab (`crontab -e`):
```bash
# Backup daily at 2 AM
0 2 * * * cp /path/to/lensy-cam/rental.db /path/to/backups/rental.db.$(date +\%Y\%m\%d)
```

## Performance Tips

1. **Use PM2 for production:**
```bash
npm install -g pm2
pm2 start server/index.js --name lensy-cam
pm2 monit  # Monitor performance
```

2. **Enable compression** (add to server/index.js):
```javascript
const compression = require('compression');
app.use(compression());
```

3. **Use nginx as reverse proxy** for better performance and HTTPS

## Monitoring

### Check Application Status
```bash
pm2 status
pm2 logs lensy-cam
```

### Database Size
```bash
ls -lh rental.db
```

### Restart Server
```bash
pm2 restart lensy-cam
```

## Updating the Application

```bash
# Stop server
pm2 stop lensy-cam

# Backup database first!
cp rental.db rental.db.backup

# Pull updates (if using git)
git pull

# Update dependencies
npm install
cd client && npm install && npm run build

# Restart
pm2 restart lensy-cam
```

## Common Production Issues

### Database Permissions
```bash
chmod 644 rental.db
chown www-data:www-data rental.db  # If using nginx/apache
```

### Environment Variables Not Loading
- Ensure .env is in the root directory
- Check file permissions
- Verify NODE_ENV is set correctly

### Port Already in Use
```bash
# Find process using port 8899
lsof -i :8899
# Kill it
kill -9 PID
```

## Access Control

For production, consider adding:
1. IP whitelist in nginx
2. VPN access requirement
3. Additional authentication layers
4. Rate limiting to prevent abuse

## Maintenance Window

Best practices:
- Schedule updates during low-usage times
- Always backup before updates
- Test in development first
- Keep rollback plan ready

---

**Remember:** This is a single-user system. For multi-user scenarios, additional security measures are needed.
