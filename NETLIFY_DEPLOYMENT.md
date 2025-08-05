# 🚀 Netlify Deployment Guide

## ✅ **Deploy Frontend to Netlify**

Your Travel Desk frontend is ready to deploy to Netlify!

## 📋 **Prerequisites**

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your code should be on GitHub
3. **Backend Running**: Your backend should be deployed on Render

## 🚀 **Deployment Steps**

### **Method 1: Deploy from GitHub (Recommended)**

1. **Go to Netlify Dashboard**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"

2. **Connect GitHub**
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your repositories

3. **Select Repository**
   - Choose your `travel-desk-frontend` repository
   - Select the `main` branch

4. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

5. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_BASE_URL=https://trawells.onrender.com`

6. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### **Method 2: Manual Deploy**

1. **Build Locally**

   ```bash
   cd travel-desk-frontend
   npm install
   npm run build
   ```

2. **Upload to Netlify**
   - Go to Netlify dashboard
   - Drag and drop the `dist` folder
   - Your site will be live instantly

## 🔧 **Configuration**

### **Environment Variables**

Set these in Netlify dashboard:

```env
VITE_API_BASE_URL=https://trawells.onrender.com
```

### **Custom Domain (Optional)**

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS records

## 🌍 **Result**

Once deployed, you'll have:

- ✅ **Frontend**: `https://your-app-name.netlify.app`
- ✅ **Backend**: `https://trawells.onrender.com`
- ✅ **Complete Application**: Full Travel Desk system

## 🔗 **Connect Frontend to Backend**

The frontend is already configured to use your Render backend:

- API calls go to: `https://trawells.onrender.com`
- CORS is configured on the backend
- Authentication works across domains

## 🎉 **Testing**

After deployment:

1. Visit your Netlify URL
2. Try logging in
3. Test travel request creation
4. Test PDF downloads

**Your Travel Desk application will be live and working globally!** 🌍✨
