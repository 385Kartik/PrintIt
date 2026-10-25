# PrintIt Admin Panel - Quick Reference

## 🚀 Quick Start

```powershell
cd "Admin Frontend"
npm install
npm run dev
```

Access at: **http://localhost:5173**

## 🔑 Default Login

- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ Change these in Backend `.env` before production!

## 📋 Features

### Dashboard
- ✅ View all print requests
- ✅ Filter by status (All/Pending/Printed/Delivered)
- ✅ Filter by delivery type (College Pickup/Home Delivery)
- ✅ Search by Collection PIN
- ✅ Real-time statistics
- ✅ Client contact information
- ✅ Deadline warnings (red if <24hrs)
- ✅ View special pages info

### File Management
- 📥 **Download Individual Files** - Click icon on any file
- 📥 **Download All** - Downloads all files sequentially
- 📦 **Download ZIP** - Bundles all files into one archive

### Order Fulfillment  
- ✅ **Mark as Delivered** - Updates status + deletes files from S3
- 🔴 **Confirmation Required** - Prevents accidental delivery marking

## 🎨 UI Theme

**Black & White Design**
- Background: Pure Black (#000)
- Text: Pure White (#FFF)  
- Status Colors:
  - Pending: Yellow
  - Delivered: Green
  - Urgent: Red

## 🔧 Configuration

### Environment (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend Admin Credentials (.env)
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 📦 Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Lucide React (icons)
- Axios (API calls)
- JSZip (ZIP creation)
- date-fns (date formatting)

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin authentication |
| GET | `/api/admin/print-requests` | Get all requests |
| GET | `/api/admin/print-requests/college-pickup` | Get college pickup only |
| GET | `/api/admin/print-requests/pin/:pin` | Search by Collection PIN |
| GET | `/api/admin/download/:s3Key` | Download file from S3 |
| GET | `/api/admin/preview/:s3Key` | Get file preview URL |
| PATCH | `/api/admin/print-requests/:id/status` | Update request status |
| PATCH | `/api/admin/print-requests/:id/deliver` | Mark as delivered |
| GET | `/api/admin/statistics` | Get dashboard stats |

## 🐛 Troubleshooting

### Can't Login
1. Check backend is running (port 5000)
2. Verify credentials in Backend `.env`
3. Clear localStorage in browser

### Can't Download Files
1. Check AWS credentials in Backend `.env`
2. Verify S3 bucket permissions
3. Check CORS configuration

### Requests Not Showing
1. Verify API_URL in `.env`
2. Check backend API is accessible
3. Look for errors in browser console

## 📚 Documentation

- **Full Guide**: See `ADMIN_DOCUMENTATION.md`
- **Startup Guide**: See `../STARTUP_GUIDE.md`
- **Implementation**: See `../IMPLEMENTATION_GUIDE.md`

## 🔒 Security Checklist

- [ ] Change default admin username
- [ ] Change default admin password  
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Implement IP whitelisting
- [ ] Set up rate limiting
- [ ] Enable CloudFront/CDN
- [ ] Monitor access logs

## 🚢 Production Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder** to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static host

3. **Update Environment**:
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```

## 💡 Tips

- Use filters to quickly find pending orders
- Download as ZIP for bulk orders
- Check deadline colors for priority
- Confirm delivery only after printing complete
- Refresh to see latest requests

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify all environment variables
3. Review network tab for API failures
4. Check backend logs

---

**Happy Managing! 🖨️**
