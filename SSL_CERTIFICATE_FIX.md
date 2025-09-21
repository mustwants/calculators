# SSL Certificate Fix for vetmover.com

## Issue
Netlify cannot provision a Let's Encrypt certificate because DNS records are not properly pointing to Netlify's servers.

## Quick Fix Steps

### 1. Verify Current DNS Settings
Check your domain registrar (GoDaddy, Namecheap, etc.) for these records:

**Required DNS Records:**
```
Type: A
Name: @ (or vetmover.com)
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-netlify-site.netlify.app
```

### 2. Update DNS Records
In your domain registrar's DNS management:

1. **Delete existing A records** pointing elsewhere
2. **Add new A record**:
   - Type: `A`
   - Name: `@` or `vetmover.com`
   - Value: `75.2.60.5`
   - TTL: `300` (5 minutes)

3. **Add CNAME record**:
   - Type: `CNAME` 
   - Name: `www`
   - Value: `your-netlify-site.netlify.app`
   - TTL: `300`

### 3. Alternative: Use Netlify DNS (Recommended)
For easier management, consider using Netlify DNS:

1. **In Netlify Dashboard**:
   - Go to Site Settings → Domain Management
   - Click "Use Netlify DNS"
   - Note the 4 nameservers provided

2. **At Domain Registrar**:
   - Replace nameservers with Netlify's 4 nameservers
   - Wait 24-48 hours for propagation

## Verification Commands

### Check DNS Propagation
```bash
# Check A record
dig vetmover.com A

# Check CNAME record  
dig www.vetmover.com CNAME

# Check from different locations
nslookup vetmover.com 8.8.8.8
```

### Expected Results
```bash
# A record should show:
vetmover.com. 300 IN A 75.2.60.5

# CNAME should show:
www.vetmover.com. 300 IN CNAME your-site.netlify.app
```

## Troubleshooting Timeline

### Immediate (0-15 minutes)
- DNS changes made in registrar
- Netlify detects changes
- Certificate provisioning begins

### 15 minutes - 1 hour  
- DNS propagation starts
- Some locations see new records
- Certificate validation in progress

### 1-4 hours
- Global DNS propagation
- Let's Encrypt validates domain
- SSL certificate issued

### 4-24 hours
- Complete global propagation
- HTTPS fully functional
- Automatic redirects active

## Force Certificate Renewal

If DNS is correct but certificate still fails:

1. **In Netlify Dashboard**:
   - Domain Settings → HTTPS
   - Click "Renew certificate"
   - Wait 15-30 minutes

2. **Or remove and re-add domain**:
   - Remove custom domain
   - Wait 5 minutes
   - Re-add custom domain
   - Certificate will auto-provision

## Common Issues & Solutions

### Issue: "Domain not found"
**Solution**: Check A record points to `75.2.60.5`

### Issue: "Certificate validation failed"  
**Solution**: Ensure both www and non-www point to Netlify

### Issue: "DNS propagation taking too long"
**Solution**: Lower TTL to 300 seconds, wait 24 hours

### Issue: "Mixed content warnings"
**Solution**: Update any hardcoded HTTP links to HTTPS

## Netlify DNS Configuration (Alternative)

If you want to use Netlify DNS entirely:

```
# Netlify will provide nameservers like:
dns1.p01.nsone.net
dns2.p01.nsone.net  
dns3.p01.nsone.net
dns4.p01.nsone.net
```

Replace your domain's nameservers with these at your registrar.

## Verification Checklist

After making DNS changes:
- [ ] A record points to 75.2.60.5
- [ ] CNAME points to Netlify site
- [ ] TTL set to 300 seconds
- [ ] Wait 15-30 minutes
- [ ] Check Netlify dashboard for certificate status
- [ ] Test https://vetmover.com loads
- [ ] Test https://www.vetmover.com redirects properly

## Support Resources

- **Netlify DNS Documentation**: https://docs.netlify.com/domains-https/custom-domains/
- **DNS Checker Tool**: https://dnschecker.org
- **Netlify Support**: If issues persist after 24 hours

Your VetMover site will have full HTTPS security once DNS propagation completes! 🔒