# Backend Integration Setup Guide

## 🔧 Environment Variables

Create a `.env.local` file in the root of your project:

```bash
# Pinata Configuration
PINATA_JWT=your_pinata_jwt_token_here
NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway_domain_here

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Privy Configuration (for wallet authentication)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Neynar Configuration (if using Farcaster features)
NEYNAR_API_KEY=your_neynar_api_key_here

# Vercel URL
NEXT_PUBLIC_URL=http://localhost:3000
```

## 🗄️ Database Setup

1. Run the SQL commands in `database-schema.sql` in your Supabase SQL Editor
2. The schema includes:
   - `users` table for wallet addresses
   - `memory_forms` table for form data
   - `form_owners` table for multiple owners per form
   - `photos` table for Pinata URLs and metadata

## ✅ Backend Integration Features

### 1. **User Management**
- Automatically creates user when wallet connects
- API: `POST /api/users` with `{ wallet_address }`

### 2. **File Upload to Pinata**
- Real-time upload when files are selected/captured
- API: `POST /api/files` with FormData
- Returns: `{ url, cid, fileName, fileSize, mimeType }`

### 3. **Memory Form Creation**
- Complete form submission with all data
- API: `POST /api/memory-forms` with form data
- Includes: title, description, owners, photos array

### 4. **Camera Integration**
- Live camera capture with permission handling
- Photos automatically uploaded to Pinata
- Seamless integration with form submission

## 🚀 How It Works

1. **Connect Wallet** → User created in database
2. **Select/Capture Images** → Uploaded to Pinata instantly
3. **Fill Form** → Title, description, additional owners
4. **Submit** → Complete memory form stored in database

## 🔧 API Endpoints

- `GET/POST /api/users` - User management
- `POST /api/files` - Pinata file upload
- `GET/POST /api/memory-forms` - Memory form CRUD

## 📱 Mobile-First Design

- Responsive layout for all screen sizes
- Touch-friendly camera interface
- Progressive file upload feedback
- Loading states and error handling

## 🎯 Next Steps

1. Set up environment variables
2. Run database migrations
3. Test file upload functionality
4. Verify form submission flow 