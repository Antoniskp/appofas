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

This application uses Supabase (PostgreSQL + Auth + REST) for authentication and data storage. You can use Supabase Cloud or self-host the stack on your VPS.

### Option A: Supabase Cloud

1. Create a Supabase project at https://supabase.com.
2. Enable the GitHub OAuth provider in **Authentication → Providers**.
3. Create the tables used by the app:

```sql
create table if not exists tasks (
  id text primary key,
  title text not null,
  description text not null,
  status text not null,
  priority text not null,
  assigneeId text,
  assigneeName text,
  assigneeAvatar text,
  dueDate text,
  createdAt text not null,
  updatedAt text not null,
  createdBy text not null
);

create table if not exists team_members (
  id text primary key,
  name text not null,
  avatar text not null,
  role text not null
);
```

4. Configure environment variables on your server (or in a `.env` file):

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Option B: Self-hosted Supabase (Postgres)

Use the Supabase CLI to run the Docker stack on your server and point the frontend to the public API URL.

1. Install Docker and the Supabase CLI (Ubuntu/Debian example below; for other platforms, see the Docker and Supabase CLI docs). If you prefer not to install globally, use `npx supabase@latest` or download the CLI binary from the docs.

```bash
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
npm install -g supabase
```

2. Initialize and start the stack from the repository root:

```bash
supabase init
supabase start
```

3. Configure GitHub OAuth and your app URL in `supabase/config.toml` (for example, set `auth.site_url` and `auth.additional_redirect_urls` and add the GitHub provider):

```toml
[auth]
site_url = "https://app.your-domain.com"
additional_redirect_urls = ["https://app.your-domain.com"]

[auth.external.github]
enabled = true
client_id = "env(GITHUB_CLIENT_ID)"
secret = "env(GITHUB_SECRET)"
```

Store `GITHUB_CLIENT_ID` and `GITHUB_SECRET` in `supabase/.env` (created by `supabase init`) or provide them via the environment for the Supabase containers.
4. Create the tables used by the app using the SQL that creates the `tasks` and `team_members` tables in the **Option A: Supabase Cloud** section above (Supabase Studio is available at `http://localhost:54323` on the server).
5. Run `supabase status` and use the API URL and anon key to set:

```bash
VITE_SUPABASE_URL=https://your-supabase-api-domain
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Make sure the Supabase API URL is reachable by browsers. For production, prefer a dedicated subdomain reverse proxy (for example, `server_name supabase.your-domain.com` with `location / { proxy_pass http://127.0.0.1:54321; }`), terminate HTTPS using the [SSL/TLS Configuration](#ssltls-configuration) section, and restrict direct port access with firewall rules if you expose port `54321`.

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

You can also run the deployment script from the repository root to install dependencies and build the app in one step:

```bash
./deploy.sh
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

Add the following configuration (initial setup for HTTP - will be upgraded to HTTPS in SSL section):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Note: This is the initial HTTP configuration. After SSL setup with Let's Encrypt,
    # this will be automatically modified to redirect to HTTPS.

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

### Recommended: Serve Static Files with Nginx/Apache

The recommended approach is to serve the built static files directly from Nginx or Apache as configured in the [Web Server Configuration](#web-server-configuration) section above. No additional process management is needed as the files are served directly by the web server.

### Alternative: Node.js HTTP Server

If you need to serve the application using Node.js (for example, during testing or in specific deployment scenarios), you can use a simple HTTP server or PM2.

#### Using PM2 for Node.js HTTP Server

If you need to run a Node.js server:

Install PM2 and serve:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Install serve package locally in the project
cd /home/appofas/appofas
npm install -g serve

# Start serving the built files
pm2 start serve --name "appofas" -- dist -s -p 3000

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Then run the command PM2 outputs
```

Note: This is only needed if you're not using Nginx/Apache to serve the static files directly.

## Monitoring and Maintenance

### Check Application Logs

For Nginx:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

For Apache:
```bash
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

For PM2 (if using Node.js server):
```bash
pm2 logs appofas
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
sudo systemctl status nginx  # or apache2
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

# If using PM2 for Node.js server, restart it
pm2 restart appofas  # Only if using PM2

# For Nginx/Apache serving static files, just reload the web server
sudo systemctl reload nginx  # or: sudo systemctl reload apache2
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

# Add to crontab (daily at 2 AM with logging)
crontab -e
# Add this line to run backup daily at 2 AM and log output:
# 0 2 * * * /home/appofas/backup.sh >> /var/log/appofas_backup.log 2>&1
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

### Static files not loading

1. Verify the build was successful: `ls -la /home/appofas/appofas/dist`
2. Check Nginx/Apache configuration points to correct directory
3. Verify file permissions: `sudo chmod -R 755 /home/appofas/appofas/dist`
4. Check web server error logs

### Nginx/Apache returns 404 errors

1. Verify Nginx configuration: `sudo nginx -t` (or `sudo apache2ctl configtest`)
2. Check that the site is enabled in sites-enabled
3. Verify the document root path is correct
4. Check Nginx/Apache error logs: `sudo tail -f /var/log/nginx/error.log`

### PM2 application won't start (if using Node.js server)

1. Check PM2 logs: `pm2 logs appofas`
2. Verify Node.js version: `node --version`
3. Check if port is already in use: `sudo netstat -tulpn | grep :3000`
4. Verify file permissions: `ls -la /home/appofas/appofas`

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
