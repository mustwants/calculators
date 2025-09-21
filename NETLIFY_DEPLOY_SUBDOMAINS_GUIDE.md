# VetMover Netlify Deploy Subdomains Configuration

## 🚀 Current Deployment Setup

### Production Environment
- **Domain**: https://vetmover.com
- **Netlify URL**: https://vetmover.netlify.app
- **Branch**: `main`
- **Status**: ✅ Active with HTTPS

### Deploy Previews
- **URL Pattern**: `deploy-preview-[PR#]--vetmover.netlify.app`
- **Trigger**: Automatically created for all pull requests
- **Purpose**: Preview changes before merging to main
- **Example**: `deploy-preview-42--vetmover.netlify.app`

### Branch Deploys
- **URL Pattern**: `[branch-name]--vetmover.netlify.app`
- **Current Status**: Available but not configured
- **Purpose**: Deploy specific branches for testing/staging

## 🛠️ Recommended Configuration

### 1. Enable Branch Deploys
**Navigate to**: Site Settings → Build & Deploy → Deploy contexts

**Configuration Options**:
```yaml
Production Branch: main
Branch Deploys: 
  - staging
  - development
  - demo
Deploy Previews: All pull requests (recommended)
```

### 2. Branch Strategy
```
main (production)     → vetmover.com
staging               → staging--vetmover.netlify.app
development           → development--vetmover.netlify.app
demo                  → demo--vetmover.netlify.app
feature/seo-update    → feature-seo-update--vetmover.netlify.app
```

### 3. Custom Domain Options (Advanced)

#### Option A: Subdomain Strategy
- **Production**: `vetmover.com`
- **Staging**: `staging.vetmover.com`
- **Preview**: `preview.vetmover.com`

#### Option B: Branch-based Subdomains
- **Production**: `vetmover.com`
- **Staging**: `staging--vetmover.netlify.app`
- **Features**: `[feature]--vetmover.netlify.app`

## 🔧 Setup Instructions

### Step 1: Configure Branch Deploys
1. Go to **Site Settings** → **Build & Deploy**
2. Scroll to **Deploy contexts**
3. Under **Branch deploys**, select your strategy:
   - **None**: Only production branch deploys
   - **All**: Every branch gets deployed
   - **Let me add individual branches**: Custom selection (recommended)

### Step 2: Add Staging Branch (Recommended)
```bash
# Create staging branch from main
git checkout main
git checkout -b staging
git push origin staging
```

### Step 3: Environment Variables per Context
Set different environment variables for each context:

**Production (main)**:
```
NODE_ENV=production
VITE_APP_ENV=production
VITE_ANALYTICS_ID=GA-PROD-ID
```

**Staging**:
```
NODE_ENV=staging
VITE_APP_ENV=staging
VITE_ANALYTICS_ID=GA-STAGING-ID
```

**Deploy Previews**:
```
NODE_ENV=preview
VITE_APP_ENV=preview
VITE_ANALYTICS_ID=
```

### Step 4: Build Configuration per Context
In `netlify.toml`, add context-specific settings:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[context.production]
  command = "npm run build:production"

[context.staging]
  command = "npm run build:staging"

[context.deploy-preview]
  command = "npm run build:preview"

[context.branch-deploy]
  command = "npm run build:branch"
```

## 🎯 Use Cases for Each Environment

### Production (`vetmover.com`)
- **Purpose**: Live site for end users
- **Analytics**: Full Google Analytics tracking
- **Features**: All production features enabled
- **Audience**: Military families and veterans

### Staging (`staging--vetmover.netlify.app`)
- **Purpose**: Pre-production testing
- **Analytics**: Staging analytics only
- **Features**: Test new features before production
- **Audience**: Internal testing team

### Deploy Previews (`deploy-preview-[#]--vetmover.netlify.app`)
- **Purpose**: Pull request reviews
- **Analytics**: Disabled or minimal
- **Features**: Specific feature being reviewed
- **Audience**: Developers and reviewers

### Feature Branches (`[feature]--vetmover.netlify.app`)
- **Purpose**: Individual feature development
- **Analytics**: Disabled
- **Features**: Experimental or in-development
- **Audience**: Feature developers

## 🔍 Testing & QA Workflow

### 1. Feature Development
```bash
git checkout -b feature/new-calculator
# Make changes
git push origin feature/new-calculator
# View at: feature-new-calculator--vetmover.netlify.app
```

### 2. Pull Request Review
```bash
# Create PR from feature branch to main
# Automatic deploy preview created
# Review at: deploy-preview-[PR#]--vetmover.netlify.app
```

### 3. Staging Deployment
```bash
# Merge approved features to staging
git checkout staging
git merge feature/new-calculator
git push origin staging
# Test at: staging--vetmover.netlify.app
```

### 4. Production Release
```bash
# Merge staging to main after QA approval
git checkout main
git merge staging
git push origin main
# Live at: vetmover.com
```

## 📊 Monitoring & Analytics

### URL Tracking Strategy
- **Production**: Full analytics and monitoring
- **Staging**: Limited analytics for performance testing
- **Previews**: Minimal or no analytics
- **Features**: Development analytics only

### SEO Considerations
- **Production**: Full SEO optimization (current implementation)
- **Staging**: `noindex, nofollow` meta tags
- **Previews**: `noindex, nofollow` meta tags
- **Features**: `noindex, nofollow` meta tags

## 🚀 Benefits of This Setup

### For Development Team
- **Isolated Testing**: Each feature gets its own URL
- **Easy Sharing**: Send preview links to stakeholders
- **Risk Reduction**: Test before production deployment
- **Parallel Development**: Multiple features can be developed simultaneously

### For QA/Testing
- **Dedicated Staging**: Stable environment for testing
- **Preview Reviews**: Review pull requests before merge
- **Performance Testing**: Test performance in staging environment
- **User Acceptance**: Stakeholder review of features

### For MustWants Brand
- **Professional Workflow**: Proper staging and review process
- **Quality Assurance**: Thorough testing before production
- **Client Demos**: Show features on dedicated URLs
- **Risk Management**: Prevent broken deployments to production

## 🔒 Security Considerations

### Password Protection (Optional)
Enable password protection for non-production deploys:
1. Site Settings → Access control
2. Add password protection for:
   - Staging branches
   - Deploy previews
   - Feature branches

### Environment Secrets
- **Production**: Real API keys and sensitive data
- **Staging**: Staging/test API keys
- **Previews**: Mock or test data only
- **Features**: Development credentials only

## 📝 Next Steps

1. **Enable Branch Deploys** in Netlify dashboard
2. **Create staging branch** for pre-production testing
3. **Configure environment variables** per context
4. **Update build scripts** for different environments
5. **Set up monitoring** for each environment
6. **Document workflow** for team members

This setup will provide a robust deployment pipeline for the VetMover platform while maintaining the high-quality standards expected for the MustWants brand.