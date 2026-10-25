# PrintIt Frontend

A modern, user-friendly React application for the PrintIt document printing service. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🏠 **Landing Page**: Beautiful landing page showcasing services and pricing.
- 🔐 **Authentication**: Secure OTP-based authentication via custom mail server (Email-based signup/login).
- 📤 **File Upload**: Drag-and-drop file upload support for PDF and other document formats.
- 💰 **Cost Calculation**: Real-time cost calculation based on:
  - Number of pages
  - Print side (Single/Double)
  - Color mode (B&W/Color)
  - Paper size (A4/A3/Letter)
  - Number of copies
- 💳 **Payment Integration**: Seamless payment processing via Razorpay.
- 📊 **Dashboard**: "My Prints" section to track order status with Collection PIN display.
- 🚚 **Delivery Options**: Choose between College Pickup or Home Delivery.
- 🔢 **Collection PIN**: View your unique pickup PIN for order verification.
- 📱 **Responsive Design**: Fully responsive UI that works on desktop, tablet, and mobile.
- 🌓 **Theme**: Clean, modern UI with Tailwind CSS.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Auth**: Custom OTP (custom mail server backend)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable UI components
│   ├── auth/       # Authentication related components
│   ├── ui/         # Generic UI components (Button, Card, Input, etc.)
│   └── ...         # Feature specific components
├── lib/            # Utility functions
├── services/       # API services
├── store/          # Global state management (Zustand)
├── App.tsx         # Main application component
└── main.tsx        # Entry point
```

## Key Features

### Print Options
Users can customize their print requests with various options:
- **Print Side**: Single-sided or Double-sided
- **Color**: Black & White or Color
- **Paper Size**: A4, A3, or Letter
- **Copies**: Number of copies required

### Order Tracking
The "My Prints" dashboard allows users to:
- View all past and current orders
- Check status updates (Pending -> Processing -> Printed -> Delivered/Collected)
- See Collection PIN for pickup verification
- View delivery type (College Pickup or Home Delivery)
- See cost breakdown, file details, and deadline
- Cancel pending orders before printing

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

