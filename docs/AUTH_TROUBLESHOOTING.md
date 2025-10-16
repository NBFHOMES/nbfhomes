# Authentication Troubleshooting Guide

## Common Firebase Authentication Issues

### 1. "popup-closed-by-user" Error

**Cause**: This error occurs when:
- User closes the popup before completing authentication
- Popup is blocked by browser
- CSP (Content Security Policy) restrictions
- Third-party cookies are disabled

**Solutions Implemented**:
- ✅ Automatic fallback to redirect-based authentication
- ✅ Updated CSP to allow Firebase popups (`same-origin-allow-popups`)
- ✅ Proper error handling and user feedback

### 2. Firebase Domain Configuration

**Required Steps for Production**:

1. **Add your domain to Firebase Console**:
   - Go to Firebase Console → Authentication → Settings
   - Add your production domain (e.g., `nbfhomes.in`) to "Authorized domains"
   - Add both `www.nbfhomes.in` and `nbfhomes.in`

2. **Verify domain ownership** (if required):
   - Follow Firebase's domain verification process
   - Add DNS TXT record or upload verification file

### 3. Browser-Specific Issues

**Chrome/Edge**:
- Check if third-party cookies are enabled
- Disable popup blockers for your domain
- Clear browser cache and cookies

**Safari**:
- Enable "Allow all cookies" temporarily for testing
- Check "Prevent cross-site tracking" settings

**Firefox**:
- Check Enhanced Tracking Protection settings
- Allow popups for your domain

### 4. Development vs Production

**Development** (localhost):
- Popups usually work fine
- Less restrictive CSP

**Production**:
- Stricter CSP requirements
- Domain must be authorized in Firebase
- HTTPS required for authentication

### 5. Testing Authentication

**Test Popup Method**:
```javascript
// This should work in development
signInWithPopup(auth, provider)
```

**Test Redirect Method**:
```javascript
// This should work in production if popups fail
signInWithRedirect(auth, provider)
```

### 6. Debugging Steps

1. **Check Browser Console**:
   - Look for CSP violations
   - Check for Firebase errors
   - Verify network requests

2. **Test in Incognito Mode**:
   - Rules out extension conflicts
   - Fresh cookie/cache state

3. **Test Different Browsers**:
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers

4. **Check Firebase Console**:
   - Verify domain is authorized
   - Check authentication logs
   - Verify project configuration

### 7. Firebase Console Configuration

**Required Settings**:
- Authentication → Sign-in method → Google (Enabled)
- Authentication → Settings → Authorized domains (Add your domain)
- Project Settings → General → Public settings (Verify domain)

### 8. Network/Infrastructure Issues

**CDN/Proxy Issues**:
- Ensure Firebase domains are not blocked
- Check if corporate firewall blocks Google services
- Verify DNS resolution for Firebase domains

**Required Firebase Domains**:
- `*.firebaseapp.com`
- `*.googleapis.com`
- `accounts.google.com`
- `www.gstatic.com`

### 9. Mobile-Specific Issues

**iOS Safari**:
- Check "Block All Cookies" setting
- Test in different iOS versions

**Android Chrome**:
- Check "Third-party cookies" setting
- Test in different Android versions

### 10. Fallback Authentication Methods

If Google authentication continues to fail:

1. **Email/Password Authentication**:
   - Always available as backup
   - No popup/redirect issues

2. **Other Providers**:
   - Facebook, Twitter, GitHub
   - May have different popup behaviors

## Implementation Notes

Our current implementation includes:

- ✅ Automatic popup → redirect fallback
- ✅ Proper error handling
- ✅ User-friendly error messages
- ✅ Loading states
- ✅ CSP configuration for Firebase
- ✅ Cross-browser compatibility

## Quick Fixes for Production

1. **Update Firebase Console**:
   ```
   Add domains: nbfhomes.in, www.nbfhomes.in
   ```

2. **Verify CSP Headers**:
   ```
   Cross-Origin-Opener-Policy: same-origin-allow-popups
   ```

3. **Test Authentication Flow**:
   ```
   1. Try popup method
   2. If fails, automatically try redirect
   3. Handle redirect result on page load
   ```

## Contact Support

If issues persist:
- Check Firebase Console logs
- Test with different browsers/devices
- Verify all domains are properly configured
- Contact Firebase Support if needed