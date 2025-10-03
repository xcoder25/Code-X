# Code-Server Production Setup Guide

## SSH into your production server
```bash
ssh username@your-server-ip
```

## Install Code-Server
```bash
curl -fsSL https://code-server.dev/install.sh | sh
```

## Create startup script
```bash
# Create service file
sudo nano /etc/systemd/system/code-server.service
```

Add this content:
```ini
[Unit]
Description=Code-Server
After=network.target

[Service]
Type=simple
User=coder
WorkingDirectory=/home/coder
ExecStart=/usr/bin/code-server --bind-addr 0.0.0.0:8080 --auth password --cert
Restart=always

[Install]
WantedBy=multi-user.target
```

## Enable and start service
```bash
sudo systemctl enable code-server
sudo systemctl start code-server
sudo systemctl status code-server
```

## Configure firewall
```bash
sudo ufw allow 8080
sudo ufw status
```

## Set password (first run only)
```bash
sudo code-server --bind-addr 0.0.0.0:8080 --auth password
# Set your password when prompted
```

## Access from browser
Visit: `http://your-server-ip:8080`

## SSL Setup (Optional)
```bash
# Install nginx
sudo apt install nginx

# Install certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables
```bash
# Export password
export PASSWORD="your-secure-password"

# Start with environment variable
code-server --bind-addr 0.0.0.0:8080 --auth password
```

## Backup your project
```bash
# Deploy your Next.js app to server
git clone https://github.com/yourusername/your-repo.git
cd your-repo
npm install
npm run build
```

## Alternative: Use existing cloud IDEs
- **GitHub Codespaces**: Browser-based VS Code
- **Replit**: Online development environment  
- **CodeSandbox**: Web-based code editor
- **Coding.com**: Development in the cloud
