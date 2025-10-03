# Deploy Code-Server on Railway

## Step 1: Prepare Files

1. Create these files in your project:
   - `Dockerfile` (already created)
   - `railway.json` (already created)

## Step 2: Deploy to Railway

### Method A: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Method B: Using Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the Dockerfile and deploy

## Step 3: Configure Environment Variables

In Railway Dashboard:
- Go to your project → Settings → Variables
- Add: `PORT=8080`
- Add: `PASSWORD=your-secure-password` (if using auth)

## Step 4: Access Your Code-Server

1. Get your Railway URL from the dashboard
2. Visit: `https://your-app-name.railway.app`
3. You'll have a full VS Code environment in your browser!

## Step 5: Mount Your Code (Optional)

To work with your actual project code:

### Option A: Clone in Code-Shared
```bash
# Once Code-Server starts, use terminal in browser:
git clone https://github.com/yourusername/your-project.git
cd your-project
npm install
npm run dev
```

### Option B: Deploy with Repository Mount
```dockerfile
# Modified Dockerfile for project mounting
FROM codercom/code-server:latest

USER root
RUN apt-get update && apt-get install -y git curl wget

WORKDIR /home/coder/projects
RUN git clone https://github.com/yourusername/your-project.git

USER coder
WORKDIR /home/coder/projects/your-project

EXPOSE 8080
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "--disable-telemetry", "."]
```

## Benefits:
- ✅ Access from anywhere
- ✅ Always-on development environment  
- ✅ Automatic HTTPS
- ✅ Easy scaling
- ✅ Free tier available
- ✅ Persistent storage

## Pro Tips:
1. **No Auth**: Using `--auth none` for easy access
2. **Telemetry Off**: `--disable-telemetry` for privacy
3. **Bind to 0.0.0.0**: Required for Railway's networking
4. **Use PORT env var**: Railway automatically assigns ports
