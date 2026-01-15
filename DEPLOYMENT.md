# Server Installation Guide for Ubuntu VPS

This guide provides step-by-step instructions for deploying the Appofas task management application on an Ubuntu VPS.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Database Configuration](#database-configuration)
- [Application Deployment](#application-deployment)
- [Web Server Configuration](#web-server-configuration)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Process Management](#process-management)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Ubuntu Server 20.04 LTS or later
- Root or sudo access to the server
- Domain name (optional, but recommended for SSL)
- Minimum 1GB RAM, 1 CPU core, 10GB storage

## Server Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js and npm

Install Node.js 20.x (LTS version):

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x or later
```

### 3. Install Build Tools

```bash
sudo apt install -y build-essential git
```

### 4. Create Application User

For security, create a dedicated user for running the application:

```bash
sudo useradd -m -s /bin/bash appofas
sudo usermod -aG sudo appofas  # Optional: if you need sudo access
```

## Database Configuration

This application uses GitHub Spark's KV (Key-Value) store for data persistence, which is built into the application. No separate database installation is required.

### Spark KV Storage

The application stores data using `window.spark.kv` which persists data locally in the browser. For production deployments, consider:

**Option 1: Use as-is (Browser Storage)**
- Data is stored in the user's browser
- No server-side database needed
- Suitable for single-user or small team deployments

**Option 2: Add Backend Database (Future Enhancement)**

If you need centralized data storage, you can add a backend API with one of these databases:

#### PostgreSQL (Recommended for Production)

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE appofas;
CREATE USER appofas_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE appofas TO appofas_user;
\q
EOF
```

#### MongoDB (Alternative)

```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Application Deployment

### 1. Clone the Repository

```bash
# Switch to appofas user
sudo su - appofas

# Clone the repository
cd /home/appofas
git clone https://github.com/Antoniskp/appofas.git
cd appofas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file for environment-specific configuration:

```bash
cat > .env << EOF
NODE_ENV=production
PORT=3000
# Add other environment variables as needed
EOF
```

### 4. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### 5. Test the Build

```bash
npm run preview
```

Access the application at `http://your-server-ip:4173` to verify the build works correctly.

## Web Server Configuration

### Option 1: Nginx (Recommended)

#### Install Nginx

```bash
sudo apt install -y nginx
```

#### Configure Nginx

Create a new site configuration:

```bash
sudo nano /etc/nginx/sites-available/appofas
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    root /home/appofas/appofas/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable logging for favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    # Disable logging for robots.txt
    location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
    }
}
```

#### Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/appofas /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Option 2: Apache

#### Install Apache

```bash
sudo apt install -y apache2
```

#### Configure Apache

```bash
sudo nano /etc/apache2/sites-available/appofas.conf
```

Add the following configuration:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com

    DocumentRoot /home/appofas/appofas/dist

    <Directory /home/appofas/appofas/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Enable SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/appofas_error.log
    CustomLog ${APACHE_LOG_DIR}/appofas_access.log combined
</VirtualHost>
```

#### Enable the Site

```bash
# Enable required modules
sudo a2enmod rewrite
sudo a2enmod headers

# Enable the site
sudo a2ensite appofas.conf

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
sudo systemctl enable apache2
```

## SSL/TLS Configuration

### Using Let's Encrypt (Certbot)

#### Install Certbot

For Nginx:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

For Apache:
```bash
sudo apt install -y certbot python3-certbot-apache
```

#### Obtain SSL Certificate

For Nginx:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

For Apache:
```bash
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

#### Auto-renewal

Certbot automatically sets up renewal. Test it with:

```bash
sudo certbot renew --dry-run
```

The renewal timer runs automatically:

```bash
sudo systemctl status certbot.timer
```

## Process Management

### Using systemd (for development server)

If you want to run the Vite development server in production (not recommended, use the built static files instead):

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/appofas.service
```

Add the following:

```ini
[Unit]
Description=Appofas Task Management Application
After=network.target

[Service]
Type=simple
User=appofas
WorkingDirectory=/home/appofas/appofas
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm run preview
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable appofas
sudo systemctl start appofas
sudo systemctl status appofas
```

### Using PM2 (Alternative)

Install PM2:

```bash
sudo npm install -g pm2
```

Start the application:

```bash
cd /home/appofas/appofas
pm2 start npm --name "appofas" -- run preview
pm2 save
pm2 startup
```

## Monitoring and Maintenance

### Check Application Logs

For systemd:
```bash
sudo journalctl -u appofas -f
```

For PM2:
```bash
pm2 logs appofas
```

For Nginx:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitor System Resources

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running services
sudo systemctl status nginx
sudo systemctl status appofas  # if using systemd
```

### Update Application

```bash
# Switch to appofas user
sudo su - appofas

# Navigate to application directory
cd /home/appofas/appofas

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild application
npm run build

# If using systemd, restart the service
sudo systemctl restart appofas

# If using PM2, restart the process
pm2 restart appofas

# Clear Nginx cache if needed
sudo systemctl reload nginx
```

### Backup

Create a backup script:

```bash
nano /home/appofas/backup.sh
```

Add the following:

```bash
#!/bin/bash
BACKUP_DIR="/home/appofas/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/appofas/appofas"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/appofas_$DATE.tar.gz -C /home/appofas appofas

# Keep only last 7 days of backups
find $BACKUP_DIR -name "appofas_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/appofas_$DATE.tar.gz"
```

Make it executable and schedule with cron:

```bash
chmod +x /home/appofas/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
# 0 2 * * * /home/appofas/backup.sh
```

### Firewall Configuration

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
# Or for Apache:
# sudo ufw allow 'Apache Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Troubleshooting

### Application won't start

1. Check logs: `sudo journalctl -u appofas -n 50`
2. Verify Node.js version: `node --version`
3. Check if port is already in use: `sudo netstat -tulpn | grep :3000`
4. Verify file permissions: `ls -la /home/appofas/appofas`

### Nginx returns 502 Bad Gateway

1. Check if application is running: `sudo systemctl status appofas`
2. Verify Nginx configuration: `sudo nginx -t`
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### SSL certificate issues

1. Verify certificate status: `sudo certbot certificates`
2. Test renewal: `sudo certbot renew --dry-run`
3. Check Nginx/Apache configuration for SSL settings

## Security Recommendations

1. **Keep system updated**: Run `sudo apt update && sudo apt upgrade` regularly
2. **Use strong passwords**: For database users and system accounts
3. **Enable firewall**: Configure UFW to only allow necessary ports
4. **Regular backups**: Automate daily backups
5. **Monitor logs**: Set up log monitoring for suspicious activity
6. **Use HTTPS**: Always use SSL/TLS certificates
7. **Limit SSH access**: Use SSH keys instead of passwords
8. **Keep Node.js updated**: Regularly update to the latest LTS version
9. **Run security audits**: Use `npm audit` to check for vulnerabilities
10. **Implement rate limiting**: Configure Nginx/Apache to prevent abuse

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

## Support

For issues specific to this application, please open an issue on the GitHub repository.
