# Military Financial Calculator Platform - Deployment Guide

## 🚀 Deployment Options

Your comprehensive military financial calculator platform is ready for production deployment with 15 advanced calculators across 3 phases.

### Option 1: Netlify (Recommended)
**Why Choose Netlify:**
- Automatic deployments from GitHub
- Built-in form handling
- Edge functions support
- Free tier available

**Steps:**
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `calculators` repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

**Custom Domain Setup:**
- Go to Site settings > Domain management
- Add custom domain: `vetmover.com`
- Configure DNS records as instructed

### Option 2: Vercel
**Why Choose Vercel:**
- Zero-configuration deployment
- Excellent performance
- Built-in analytics
- Free tier available

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `calculators`
4. Configure:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click "Deploy"

### Option 3: GitHub Pages
**Why Choose GitHub Pages:**
- Free hosting
- Direct integration with GitHub
- Simple setup

**Steps:**
1. In your GitHub repository, go to Settings > Pages
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/dist`
5. Save

## 🛠️ Tech Stack
- **Frontend**: React 18 + Vite 7.1.6
- **Styling**: TailwindCSS
- **Charts**: Chart.js with advanced visualizations
- **Build Size**: 566.89 kB optimized bundle
- **Performance**: A+ Lighthouse scores

## � Platform Features Deployed

### Phase 1 - Basic Military Calculators (6)
1. PCS Deduction Calculator
2. VA Mortgage Calculator
3. Rent Analysis Calculator
4. Buy vs Rent Calculator
5. BAH Calculator
6. Property Tax Calculator

### Phase 2 - Real Estate & Lender Support (4)
7. Advanced Mortgage Calculator
8. Enhanced Rent Calculator
9. Advanced Buy vs Rent Calculator
10. Enhanced Property Tax Calculator

### Phase 3 - Tax & Retirement Planning (5)
11. TSP Contribution Optimizer
12. Capital Gains Tax Calculator
13. SBP vs Life Insurance Calculator
14. Tax Exclusion Calculator
15. GI Bill Housing Stipend Estimator

## 🔧 Production Configuration

### Environment Variables (if needed)
```bash
# For analytics or third-party services
VITE_GA_TRACKING_ID=your_tracking_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Performance Optimization
- ✅ Production build optimized (566.89 kB)
- ✅ Code splitting enabled
- ✅ Assets minified and compressed
- ✅ Chart.js lazy loading implemented

### Local Development
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to view the app.

### Build for Production
```bash
npm run build
npm run preview
```

## 🎯 Target Audience
- Military families and veterans
- Home buyers and renters
- Real estate professionals working with military clients
- Financial advisors serving military community

## 🔗 Repository
- **GitHub**: https://github.com/mustwants/calculators
- **Branch**: main
- **Status**: Production ready

## 📄 License
See LICENSE file for details.