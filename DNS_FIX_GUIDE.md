# DNS Verification Fix Guide for vetmover.com

## Current Status
✅ Domain reaches Netlify servers (confirmed)
❌ SSL certificate verification failing
❌ Netlify can't verify domain ownership

## IMMEDIATE FIXES (Choose One)

### Option 1: Use www.vetmover.com (FASTEST - 5 minutes)
1. **Netlify Dashboard**:
   - Site settings → Domain management
   - Remove `vetmover.com`
   - Add `www.vetmover.com`
   - SSL will provision automatically

2. **DNS Settings** (at your registrar):
   ```
   Type: CNAME
   Name: www
   Value: vetmover.netlify.app
   TTL: 3600
   ```

3. **Redirect Setup**:
   - Keep A records for vetmover.com pointing to Netlify
   - Add redirect rule in netlify.toml

### Option 2: Fix Apex Domain DNS (More Complex)
The issue might be conflicting DNS records. 

**Check your current DNS at your registrar**:
- Do you have BOTH A records AND CNAME records?
- Are there old hosting records mixed in?

**Clean DNS Setup**:
1. **Delete ALL existing records for vetmover.com**
2. **Add ONLY these A records**:
   ```
   vetmover.com → 75.2.60.5
   vetmover.com → 99.83.190.102
   vetmover.com → 198.185.159.144
   vetmover.com → 198.185.159.145
   ```
3. **Add CNAME for www**:
   ```
   www.vetmover.com → vetmover.netlify.app
   ```

### Option 3: Use Netlify DNS (Nuclear Option)
1. **Netlify Dashboard**:
   - Add domain with Netlify DNS
   - Get Netlify nameservers

2. **At your registrar**:
   - Change nameservers to Netlify's
   - Let Netlify manage all DNS

## Why This Happens
- Apex domains (without www) are harder to verify
- DNS propagation timing issues
- Conflicting records at registrar
- Domain registrar not fully releasing control

## Quick Test Commands
```bash
# Test if DNS is clean
curl -I http://vetmover.com
curl -I http://www.vetmover.com

# Should both show Netlify servers
```

## Timeline
- **www subdomain**: 5-15 minutes
- **Apex domain fix**: 2-24 hours
- **Netlify DNS**: 24-48 hours

## Recommended Action
**START WITH OPTION 1** - www.vetmover.com works immediately and you can always fix the apex domain later!