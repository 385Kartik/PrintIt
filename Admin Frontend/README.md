# PrintIt Admin Frontend

Modern black and white themed admin panel for managing PrintIt print requests.

## Features

- 🔐 Secure admin authentication (username/password)
- 📋 View all print requests with client details
- 👁️ **File Preview**: Preview PDF and image files directly in the browser before printing
- 📥 Download files individually, all at once, or as ZIP
- 🖨️ **Status Management**: Update status (pending/processing/printed/delivered/collected/cancelled)
- ✅ Mark print requests as delivered/collected (auto-deletes files from S3)
- 📊 Real-time statistics (Total, Pending, Printed, Delivered)
- 🎓 **Filter by Delivery Type**: View college pickup or home delivery requests separately
- 🔍 **Search by PIN**: Find requests using Collection PIN
- 🎨 Clean, minimal black & white UI theme
- 🔴 Red deadline warnings for urgent requests
- 📱 Fully responsive design
- 📄 View special pages info (certificate, index, cover)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

## Admin Credentials

Default admin credentials (configure in Backend `.env`):
- Username: `admin`
- Password: `admin123`

**Important:** Change these credentials in production by updating:
- `ADMIN_USERNAME` in Backend `.env`
- `ADMIN_PASSWORD` in Backend `.env`

## Features Overview

### Authentication
- Token-based authentication
- Auto-login on page refresh if token exists
- Secure logout with token removal

### Print Request Management
Each request card displays:
- Client name, email, and phone
- Request status (Pending/Printed/Delivered)
- Deadline (highlighted in red if within 24 hours)
- Print details (pages, type, copies, amount)
- List of all files with page counts and preview options

### File Downloads & Previews
- **Preview**: Click the eye icon to preview PDFs and images
- **Download Individual Files**: Click download icon on any file
- **Download All**: Downloads all files sequentially
- **Download ZIP**: Creates and downloads a ZIP file with all documents

### Mark as Delivered
- Marks the request as delivered
- Automatically deletes all files from AWS S3
- Requires confirmation before execution
- Updates the request list immediately

### Filters
- All requests
- Pending only
- Printed only
- Delivered only

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for build tooling
- **Tailwind CSS 4** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **JSZip** for creating ZIP archives
- **date-fns** for date formatting
- **React Hot Toast** for notifications
- **file-saver** for download handling

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
