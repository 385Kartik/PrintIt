# EC2 Deployment (CI/CD)

This repo includes a GitHub Actions workflow and a deploy script that:
- Pulls latest `main`
- Builds Backend + Frontend + Admin Frontend
- Restarts backend with PM2
- Copies static dist files for nginx

## 1) GitHub Secrets
Add these repository secrets:
- `EC2_HOST`: your EC2 public host (e.g. `ec2-3-108-217-27.ap-south-1.compute.amazonaws.com`)
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: private key content from `pit.pem`

## 2) EC2 folder and permissions (one-time)
SSH to the instance and run:
- Create the repo directory: `/var/www/printit`
- Ensure `ubuntu` owns it

## 3) Install nginx config (one-time)
Copy [deploy/nginx.printit.conf](deploy/nginx.printit.conf) to `/etc/nginx/sites-available/printit.conf`, then enable it:
- Symlink into `/etc/nginx/sites-enabled/`
- Reload nginx

## 4) First deploy
Push to `main`. The workflow will:
- Clone the repo if missing
- Run [scripts/deploy.sh](scripts/deploy.sh)

## Notes
- Backend listens on `PORT` (default `5000`).
- Frontend served at `/` and admin at `/admin/`.
- Add your `.env` on the EC2 instance under `/var/www/printit/Backend/.env`.
