# PrintIt

A comprehensive document printing service platform with user authentication, file management, payment integration, and admin controls.

## 📚 Documentation

- [Main README](./README.md) - Project overview (this file)
- [Backend Documentation](./Backend/README.md) - API setup and endpoints
- [API Features](./Backend/API_FEATURES.md) - Rate limiting, caching, health checks
- [Changelog](./CHANGELOG.md) - Recent updates and changes
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions

## Project Structure

```
PrintIt/
├── Backend/          # Node.js + TypeScript API server
├── Frontend/         # React + TypeScript user interface
├── Admin Frontend/   # React admin panel
├── deploy/           # Nginx configuration
└── scripts/          # Deployment scripts
```

## Features

### User Features
- 🔐 Secure authentication with OTP (via custom mail server)
- 📤 File upload with drag & drop support
- 💰 Real-time cost calculation based on print options
- 💳 Razorpay payment integration
- 🎟️ Token system for discounts with caching for better performance
- 📊 Dashboard to track orders
- 🔢 4-digit Collection PIN for order pickup
- 🚚 Delivery options: College Pickup or Home Delivery
- 📄 Support for special pages (certificate, index, cover)

### Admin Features
- 📋 Manage all print requests
- 🔄 Update print status (pending/processing/printed/delivered/cancelled/collected)
- 📥 Download/preview files
- 📊 View statistics
- ✅ Mark orders as delivered (auto-deletes files from S3)
- 🎓 Filter by delivery type (college pickup/home delivery)
- 🔍 Search requests by Collection PIN
- 👁️ File preview modal for PDFs and images

### Backend Features
- 🛡️ Per-user rate limiting with Token Bucket algorithm
- 💚 Health check endpoint for monitoring
- ⚡ Token count caching for optimized performance
- 🔒 JWT-based authentication
- 📧 Custom mail server integration for OTP delivery

### Print Options
- Print Side: Single/Double
- Color Mode: B&W/Color
- Paper Size: A4/A3/Letter
- Number of copies

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- AWS S3 for file storage
- Razorpay for payments
- Custom mail server for OTP emails
- JWT authentication

### Frontend
- React 19 + TypeScript
- Vite build tool
- Tailwind CSS
- Custom OTP authentication (via custom mail server)
- Zustand state management
- React Hot Toast notifications

## Quick Start

### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Configure .env with your credentials
npm run dev
```

**Required Environment Variables:**
- MongoDB connection
- AWS S3 credentials
- Razorpay API keys
- Custom mail server credentials
- JWT secret

### Frontend Setup
```bash
cd Frontend
npm install
# Configure .env with API URL and Razorpay key
npm run dev
```

### Admin Frontend Setup
```bash
cd "Admin Frontend"
npm install
npm run dev
```

## Email & OTP System

### Custom Mail Server Integration
The platform uses a custom mail server for OTP delivery:

**Setup:**
1. Configure your mail server (SMTP)
2. Get credentials: Host, Port, Username, Password
3. Add to Backend `.env`:
```env
MAIL_HOST=your_mail_server_host
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
MAIL_FROM_EMAIL=noreply@printit.app
MAIL_FROM_NAME=PrintIt
```

### OTP & PIN Types
- **Authentication OTP**: 6-digit code for signup/login (sent via email)
- **Collection PIN**: 4-digit/3-digit code for order pickup (shown in dashboard)
  - College Pickup: Day-based 3-digit code (e.g., "252" for Feb 25)
  - Home Delivery: Random 4-digit PIN

## Token System

Users earn tokens based on their spending:
- Configurable rate via `TOKENS_PER_RUPEE` (default: 0.1)
- Tokens can be used for future print orders
- Reduces payment amount

## Deadline Calculation

Automatic deadline assignment:
- **Monday-Thursday orders**: Next day by 11:59 PM
- **Friday-Sunday orders**: Monday by 11:59 PM

## Print Status Workflow

1. **Pending**: After payment confirmation
2. **Processing**: (Optional) Order being processed
3. **Printed**: Physical copy ready
4. **Delivered/Collected**: Handed to user (triggers S3 file deletion)
   - **Delivered**: For home delivery orders
   - **Collected**: For college pickup orders
5. **Cancelled**: Order cancelled by user or admin

Additional statuses: `completed` (legacy)

## API Documentation

See [Backend README](./Backend/README.md) for detailed API endpoints.

### Key Endpoints
- `POST /api/auth/request-signup-otp` - Request signup OTP
- `POST /api/auth/verify-signup-otp` - Verify and create account
- `POST /api/print/upload` - Upload files
- `POST /api/print/create-order` - Create print order
- `POST /api/print/verify-payment` - Verify Razorpay payment
- `GET /api/print/my-requests` - View user's orders

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for EC2 deployment with GitHub Actions.

### Production Build

**Backend:**
```bash
cd Backend
npm run build
npm start
```

**Frontend:**
```bash
cd Frontend
npm run build
```

**Admin Frontend:**
```bash
cd "Admin Frontend"
npm run build
```

## Environment Configuration

### Backend `.env` Example
```env
# Database
MONGODB_URI=mongodb://localhost:27017/printit

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET_NAME=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Mail Server Configuration (for OTP emails)
MAIL_HOST=your_mail_server_host
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
MAIL_FROM_EMAIL=noreply@printit.app
MAIL_FROM_NAME=PrintIt

# JWT
JWT_SECRET=your_secret_key

# Server
PORT=5000
```

### Frontend `.env` Example
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=
```

## Development

### Backend Development
```bash
cd Backend
npm run dev  # Runs with ts-node
```

### Frontend Development
```bash
cd Frontend
npm run dev  # Runs Vite dev server
```

### Testing
```bash
# Backend
cd Backend
npm run test:pdf  # Test PDF processing

# Frontend - manual testing
# Visit http://localhost:5173
```

## Security Features

- JWT-based authentication
- OTP verification for signup/login
- Secure file upload to S3
- Payment verification with Razorpay
- Admin-only routes protection
- File deletion after delivery for privacy

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

ISC

## Support

For issues or questions, use the contact form in the application or check the individual README files:
- [Backend README](./Backend/README.md)
- [Frontend README](./Frontend/README.md)
- [Admin Frontend README](./Admin%20Frontend/README.md)
