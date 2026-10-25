# PrintIt Backend

A Node.js + TypeScript backend for the PrintIt document printing service.

## Features

- User authentication with JWT
- File upload to AWS S3
- Razorpay payment integration
- Print token system
- Admin panel for managing print requests
- Automatic deadline calculation
- **Per-user rate limiting with Token Bucket algorithm**
- **Health check endpoint for monitoring**
- **Token count caching for optimized performance**

## Documentation

- [API Features Documentation](./API_FEATURES.md) - Rate limiting, health checks, and caching
- Main README (this file) - Setup and basic API reference

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - MongoDB connection string
   - AWS S3 credentials
   - Razorpay API keys
   - JWT secret
   - Custom mail server credentials (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`)

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status (no authentication required)

### Authentication
- `POST /api/auth/request-signup-otp` - Request OTP for signup (rate limited)
- `POST /api/auth/verify-signup-otp` - Verify OTP and register user (rate limited)
- `POST /api/auth/request-login-otp` - Request OTP for login (rate limited)
- `POST /api/auth/verify-login-otp` - Verify OTP and login (rate limited)
- `GET /api/auth/profile` - Get user profile (protected, rate limited)
- `PUT /api/auth/profile` - Update user profile (protected, rate limited)

### Print Requests
- `POST /api/print/upload` - Upload files to S3 (protected, rate limited)
- `POST /api/print/calculate-cost` - Calculate cost for uploaded files (protected, rate limited)
- `POST /api/print/calculate-cost-from-files` - Calculate cost from file upload (protected, rate limited)
- `POST /api/print/create-order` - Create Razorpay order (protected, rate limited)
- `POST /api/print/verify-payment` - Verify payment and create print request (protected, rate limited)
- `POST /api/print/cancel-pending` - Cancel pending request (protected, rate limited)
- `GET /api/print/my-requests` - Get user's print requests (protected, rate limited)
- `GET /api/print/preview/:s3Key` - Get file preview URL (protected, rate limited)

### User
- `GET /api/user/tokens` - Get token balance (protected, rate limited)

### Support
- `POST /api/support/contact` - Submit contact form message (rate limited)

### Admin
- `POST /api/admin/login` - Admin login (rate limited)
- `GET /api/admin/print-requests` - Get all print requests (admin only, rate limited)
- `GET /api/admin/print-requests/college-pickup` - Get college pickup requests only (admin only, rate limited)
- `GET /api/admin/print-requests/pin/:pin` - Get request by Collection PIN (admin only, rate limited)
- `PATCH /api/admin/print-requests/:id/status` - Update print status (admin only, rate limited)
- `PATCH /api/admin/print-requests/:id/deliver` - Mark request as delivered and delete files from S3 (admin only, rate limited)
- `GET /api/admin/download/:s3Key` - Download a file (admin only, rate limited)
- `GET /api/admin/preview/:s3Key` - Get a temporary preview URL for a file (admin only, rate limited)
- `GET /api/admin/statistics` - Get dashboard statistics (admin only, rate limited)

> **Note:** All endpoints marked as "rate limited" have per-user rate limiting applied. See [API_FEATURES.md](./API_FEATURES.md) for details.

## Print Status Workflow

The print request lifecycle follows this flow:
1. **Pending**: Initial state after payment/creation.
2. **Processing**: (Optional) Admin marks as being processed.
3. **Printed**: Admin marks as printed when the physical copy is ready.
4. **Delivered/Collected**: Admin marks as delivered (home delivery) or collected (college pickup) when handed over to the user. This action triggers the deletion of files from S3 for privacy/storage management.
5. **Cancelled**: Order cancelled by user or admin.

Status options: `pending`, `processing`, `printed`, `delivered`, `collected`, `cancelled`, `completed` (legacy).

## Token System

Users earn tokens when they pay for print requests:
- Tokens per rupee: 0.1 (configurable via `TOKENS_PER_RUPEE` env variable)
- Tokens can be used for future payments
- Tokens reduce the amount to be paid via Razorpay

## Special Pages Feature

The system supports special pricing for specific types of pages:
- **Certificate Page**: Professional quality printing for certificates
- **Index Page**: Color printing for document indices
- **Cover Page**: High-quality cover page printing

Each special page type can have custom pricing configured in the cost calculation utility. Special pages are tracked separately in the print request with their page numbers.

## Deadline System

Print deadlines are automatically calculated:
- Monday to Thursday: Next day by 11:59 PM
- Friday, Saturday, Sunday: Monday by 11:59 PM

## Email System

Uses a custom mail server for sending OTP emails:
- **Signup/Login OTPs**: 6-digit codes sent via email
- **Collection PINs**: 4-digit/3-digit codes generated for order pickup (shown in dashboard)

**Setup Custom Mail Server:**
1. Prepare your mail server credentials (SMTP host, port, username, password)
2. Add to `.env`:
   ```env
   MAIL_HOST=your_mail_server_host
   MAIL_PORT=587
   MAIL_USER=your_mail_user
   MAIL_PASS=your_mail_password
   MAIL_FROM_EMAIL=noreply@printit.app
   MAIL_FROM_NAME=PrintIt
   ```

## Collection PIN System

Each print order generates a unique Collection PIN based on delivery type:

### College Pickup
- Day-based 3-digit PIN (e.g., "252" for February 25)
- Format: Last digit of month + day of month
- Used to identify and group pickup batches

### Home Delivery
- Random 4-digit PIN
- Unique identifier for individual deliveries

**Features:**
- Displayed in user's dashboard
- Used for order pickup/delivery verification
- Automatically generated on order creation
- Stored in `PrintRequest.collection_pin` field
- Searchable by admin via `/api/admin/print-requests/pin/:pin` endpoint
