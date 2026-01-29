// One-time auth cleanup utility
// Run this in your browser console to clear corrupted auth state

(async function clearAuthState() {
    console.log('🔧 Clearing corrupted Supabase auth state...');

    // Clear all Supabase-related cookies
    document.cookie.split(';').forEach(c => {
        const cookieName = c.split('=')[0].trim();
        if (cookieName.startsWith('sb-')) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            console.log(`✓ Cleared cookie: ${cookieName}`);
        }
    });

    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key);
            console.log(`✓ Cleared localStorage: ${key}`);
        }
    });

    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
            console.log(`✓ Cleared sessionStorage: ${key}`);
        }
    });

    console.log('✅ Auth state cleared! Refreshing page...');
    setTimeout(() => window.location.reload(), 1000);
})();
