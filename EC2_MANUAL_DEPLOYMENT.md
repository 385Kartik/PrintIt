# Manual Deployment Guide for AWS EC2

This guide details the step-by-step process to deploy the PrintIt application manually on an AWS EC2 instance (Ubuntu).

## Prerequisites
1.  **AWS Account**: An active AWS account.
2.  **Domain Name**: A domain name (e.g., `printit.com` or `app.printit.com`) pointing to your EC2 instance's Public IP.
3.  **Third-Party Credentials**:
    -   MongoDB Connection URI (Atlas recommended).
    -   AWS S3 Credentials (Access Key, Secret, Bucket Name, Region).
    -   Razorpay Keys (Key ID, Secret).
    -   Mail Server Credentials (Host, Port, Username, Password).

---

## Step 1: Launch and Configure EC2 Instance

1.  **Launch Instance**:
    -   OS: **Ubuntu Server 22.04 LTS** (or 24.04).
    -   Instance Type: `t2.micro` (free tier) or `t3.small` (recommended for prod).
    -   Key Pair: Create/Select a key pair (`.pem`) for SSH access.
2.  **Configure Security Group**:
    -   Allow **SSH** (Port 22) from your IP.
    -   Allow **HTTP** (Port 80) from Anywhere (0.0.0.0/0).
    -   Allow **HTTPS** (Port 443) from Anywhere (0.0.0.0/0).

---

## Step 2: Server Preparation

SSH into your instance:
```bash
ssh -i "path/to/key.pem" ubuntu@<EC2-PUBLIC-IP>
```

Run the following commands to update the system and install necessary tools:

```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install other essentials
sudo apt install -y nginx git build-essential poppler-utils

# Install PM2 (Process Manager for Node.js) globaly
sudo npm install -g pm2
```

---

## Step 3: Clone Repository

Setup the directory and clone your code.

```bash
# Create directory
sudo mkdir -p /var/www/printit
sudo chown -R $USER:$USER /var/www/printit

# Clone your repository (Replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/PrintIt.git /var/www/printit
# OR if you are uploading files manually, use SCP/SFTP to upload them to this folder.
```

*Ensure your folder structure in `/var/www/printit` looks like:*
```
/var/www/printit
├── Backend
├── Frontend
├── Admin Frontend
├── deploy
└── ...
```

---

## Step 4: Backend Setup

1.  **Install & Build**:
    ```bash
    cd /var/www/printit/Backend
    npm install
    npm run build
    ```

2.  **Configure Environment**:
    Create a `.env` file:
    ```bash
    nano .env
    ```
    Paste the following (fill in your values):
    ```env
    PORT=5000
    MONGODB_URI=mongodb+srv://...
    JWT_SECRET=your_super_secret_key
    NODE_ENV=production

    # AWS S3
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
    AWS_REGION=ap-south-1
    AWS_BUCKET_NAME=...

    # Payment
    RAZORPAY_KEY_ID=...
    RAZORPAY_KEY_SECRET=...

    # Mail Server Configuration
    MAIL_HOST=your_mail_server_host
    MAIL_PORT=587
    MAIL_USER=your_mail_user
    MAIL_PASS=your_mail_password
    MAIL_FROM_EMAIL=noreply@printit.app
    MAIL_FROM_NAME=PrintIt
    ```
    *Save and exit (Ctrl+X, Y, Enter)*.

3.  **Start with PM2**:
    ```bash
    pm2 start ecosystem.config.cjs
    pm2 save
    pm2 startup
    # (Copy user-specified command output from 'pm2 startup' and run it if asked)
    ```

---

## Step 5: Frontend Setup

1.  **Configure Environment**:
    ```bash
    cd /var/www/printit/Frontend
    nano .env
    ```
    Add:
    ```env
    VITE_API_URL=/api
    VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
    ```
    *(Note: Using `/api` allows Nginx to handle the routing)*

2.  **Install & Build**:
    ```bash
    npm install
    npm run build
    ```
    This creates a `dist/` folder.

3.  **Prepare for Nginx**:
    The Nginx configuration expects files in a lowercase `frontend` directory.
    ```bash
    # Create directory
    sudo mkdir -p /var/www/printit/frontend/dist
    
    # Copy build files
    sudo cp -r dist/* /var/www/printit/frontend/dist/
    ```

---

## Step 6: Admin Frontend Setup

**Critical Step**: The Admin panel is served at `/admin/`. We need to ensure assets are loaded correctly.

1.  **Update Config** (if not already done in code):
    Open `vite.config.ts`:
    ```bash
    cd "/var/www/printit/Admin Frontend"
    nano vite.config.ts
    ```
    Add `base: '/admin/',` to the configuration object:
    ```typescript
    export default defineConfig({
      base: '/admin/',  // <--- ADD THIS LINE
      plugins: [react()],
      // ... rest of config
    })
    ```

2.  **Configure Environment**:
    Creating `.env`:
    ```bash
    nano .env
    ```
    Add:
    ```env
    VITE_API_URL=/api
    ```

3.  **Install & Build**:
    ```bash
    npm install
    npm run build
    ```

4.  **Prepare for Nginx**:
    The Nginx configuration expects files in a lowercase `admin` directory.
    ```bash
    # Create directory
    sudo mkdir -p /var/www/printit/admin/dist
    
    # Copy build files
    sudo cp -r dist/* /var/www/printit/admin/dist/
    ```

---

## Step 7: Nginx Configuration

1.  **Prepare Config File**:
    The repository already has a config file at `deploy/nginx.printit.conf`. You can use it directly.

2.  **Copy and Enable**:
    ```bash
    sudo cp /var/www/printit/deploy/nginx.printit.conf /etc/nginx/sites-available/printit
    
    # Create symlink
    sudo ln -s /etc/nginx/sites-available/printit /etc/nginx/sites-enabled/
    
    # Remove default nginx config if exists
    sudo rm /etc/nginx/sites-enabled/default
    ```

3.  **Test and Reload**:
    ```bash
    sudo nginx -t
    # If test is successful:
    sudo systemctl restart nginx
    ```

---

## Step 8: SSL Certification (HTTPS)

Secure your application with a free Let's Encrypt SSL certificate.

1.  **Install Certbot**:
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    ```

2.  **Obtain Certificate**:
    ```bash
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```
    Follow the prompts (Enter email, Agree to TOS). Select "2" to Redirect HTTP to HTTPS if asked.

---

## Verification

-   **Frontend**: Visit `https://yourdomain.com`
-   **Admin Panel**: Visit `https://yourdomain.com/admin/`
-   **Backend API**: `https://yourdomain.com/api/health` should return `{"status":"OK"...}`

## Troubleshooting

-   **Check Backend Logs**: `pm2 logs`
-   **Check Nginx Logs**: `sudo tail -f /var/log/nginx/error.log`
-   **Permissions**: Ensure `/var/www/printit` is readable by the `www-data` user (Nginx default) or that the files have world-read permissions (`chmod -R 755 /var/www/printit`).
