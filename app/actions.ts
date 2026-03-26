'use server';

import { Redis } from '@upstash/redis';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// Helper to create context-aware Supabase client
export async function getSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'nbf_v5_final',
            },
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Handle cookie setting error
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Handle cookie removal error
                    }
                },
            },
        }
    );
}

// Global admin client for status checks (using service role or anon key if missing)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const globalSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function checkAdminStatus(legacyUserId?: string): Promise<boolean> {
    try {
        // CRITICAL SECURITY FIX: Trust only the server-side session, not client inputs
        const supabase = await getSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.warn("CheckAdminStatus: No valid active session found");
            return false;
        }

        const userId = user.id;
        const cacheKey = `auth:admin:${userId}`;

        // 1. Check Redis Cache (Bypassed for debugging)
        // if (redis) { ... }

        // 2. Check Supabase Database securely using actual user ID
        const { data, error } = await globalSupabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            console.error("CheckAdminStatus DB Error:", error);
        }

        const isAdmin = !!data && !error;
        if (!isAdmin) console.log("CheckAdminStatus: Not found in admin_users table");

        // 3. Cache the result
        if (redis && isAdmin) {
            try {
                await redis.set(cacheKey, isAdmin, { ex: 300 });
            } catch (error) {
                console.warn('Redis set error:', error);
            }
        }

        return isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Admin action to update product status
export async function updateProductStatusAction(
    productId: string,
    availableForSale: boolean,
    adminUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const isAdmin = await checkAdminStatus(adminUserId);
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized: Admin access required' };
        }

        // Use context-aware client to leverage RLS policies
        const supabase = await getSupabaseClient();

        const newStatus = availableForSale ? 'approved' : 'inactive';

        const { data, error } = await supabase
            .from('properties')
            .update({
                available_for_sale: availableForSale,
                status: newStatus
            })
            .eq('id', productId)
            .select()
            .maybeSingle();

        if (error) {
            console.error('Error updating product status:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error in updateProductStatusAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

// Property Form Reporting Action
export async function submitPropertyReportAction(
    propertyId: string,
    propertyTitle: string,
    ownerName: string,
    reporterData: { name: string; phone: string },
    reason: string,
    details: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await getSupabaseClient();
        
        const subject = `[FLAGGED PROPERTY] ${propertyTitle} (ID: ${propertyId})`;
        const messageBody = `
⚠️ PROPERTY REPORT ⚠️
Reason: ${reason}
Target Owner: ${ownerName}

Details from User:
${details || 'No additional details provided.'}
        `.trim();

        // Use the existing inquiries table which the admin panel already monitors
        const { error } = await supabase.from('inquiries').insert({
            first_name: reporterData.name,
            last_name: '',
            email: `report-${propertyId}@nbfhomes.in`, // Differentiating placeholder
            phone_number: reporterData.phone,
            subject: subject,
            message: messageBody,
            status: 'new' // Triggers Admin badge
        });

        if (error) {
            console.error('Error submitting property report:', error);
            return { success: false, error: 'Database error occurred while submitting report.' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Action error in submitPropertyReportAction:', error);
        return { success: false, error: 'Unexpected error occurred.' };
    }
}

// Admin action to approve product
export async function approveProductAction(
    productId: string,
    adminUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const isAdmin = await checkAdminStatus(adminUserId);
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized: Admin access required' };
        }

        // Use context-aware client
        const supabase = await getSupabaseClient();

        // 1. Get current tags (legacy cleanup)
        const { data: product, error: fetchError } = await supabase
            .from('properties')
            .select('tags, handle')
            .eq('id', productId)
            .maybeSingle();

        if (fetchError || !product) {
            return { success: false, error: 'Property not found' };
        }

        // 2. Remove 'pending_approval' tag (legacy cleanup)
        const newTags = (product.tags || []).filter((t: string) => t !== 'pending_approval');

        // 3. Update property status
        const { error: updateError } = await supabase
            .from('properties')
            .update({
                tags: newTags,
                available_for_sale: true,
                status: 'approved'
            })
            .eq('id', productId);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        // 4. Trigger Google Indexing (Automation)
        try {
            const { notifyGoogleIndexing } = await import('@/lib/google-indexing');
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nbfhomes.in';
            // Assuming handle is available or constructed. 
            // We need to fetch handle if not in hand. properties table has it.
            if (product.handle) { // If fetched above, waiting to verify if 'tags' select included 'handle'
                await notifyGoogleIndexing(`${siteUrl}/product/${product.handle}`, 'URL_UPDATED');
            } else {
                // Re-fetch handle if missing
                const { data: fullProp } = await supabase.from('properties').select('handle').eq('id', productId).single();
                if (fullProp?.handle) {
                    await notifyGoogleIndexing(`${siteUrl}/product/${fullProp.handle}`, 'URL_UPDATED');
                }
            }
        } catch (idxError) {
            console.warn('Indexing trigger failed (Non-critical):', idxError);
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error in approveProductAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

// Admin action to reject product
export async function rejectProductAction(
    productId: string,
    adminUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const isAdmin = await checkAdminStatus(adminUserId);
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized: Admin access required' };
        }

        const supabase = await getSupabaseClient();

        // Update property status to rejected and inactive
        const { error } = await supabase
            .from('properties')
            .update({
                available_for_sale: false,
                status: 'rejected'
            })
            .eq('id', productId);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error in rejectProductAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

// Admin action to delete product (Zero-Residual Delete)
export async function adminDeleteProductAction(
    productId: string,
    adminUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const isAdmin = await checkAdminStatus(adminUserId);
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized: Admin access required' };
        }

        const supabase = await getSupabaseClient();

        // STEP 1: Image Retrieval & Storage Cleanup
        // We fetch the property first to get its images
        const { data: property, error: fetchError } = await supabase
            .from('properties')
            .select('images')
            .eq('id', productId)
            .single();

        if (fetchError) {
            // If property doesn't exist, we can't delete it, but it's effectively "gone" or already deleted.
            // We'll proceed to try delete anyway to be safe, or return error.
            if (fetchError.code !== 'PGRST116') { // PGRST116 is 'not found'
                console.error('Error fetching property for deletion:', fetchError);
            }
        }

        if (property && property.images && Array.isArray(property.images)) {
            const imagePaths: string[] = property.images
                .map((url: string) => {
                    // Extract path from Supabase URL if applicable
                    // Pattern: .../storage/v1/object/public/properties/folder/file.jpg
                    try {
                        if (url.includes('/properties/')) {
                            return url.split('/properties/')[1]; // Get path after bucket name
                        } else if (url.includes('cloudinary.com')) {
                            // Cloudinary URL - Server-side delete requires API Secret.
                            // Marking as SKIPPED unless secrets provided.
                            // console.warn('Skipping Cloudinary delete: No server credentials');
                            return null;
                        }
                        return null;
                    } catch (e) { return null; }
                })
                .filter((p): p is string => p !== null);

            if (imagePaths.length > 0) {
                console.log(`[Zero-Residual] Deleting ${imagePaths.length} files from storage...`);
                // STEP 2: Storage Cleanup
                const { error: storageError } = await supabase.storage
                    .from('properties')
                    .remove(imagePaths);

                if (storageError) {
                    console.error('[Zero-Residual] Storage cleanup warning:', storageError);
                    // We LOG but do not Halt. "Resilient Delete" means we proceed to DB delete guarantees no orphan rows.
                } else {
                    console.log('[Zero-Residual] Storage cleanup successful');
                }
            }
        }

        // STEP 3: Database Deletion (Row + Cascade)
        // With ON DELETE CASCADE enabled in DB, this single call removes views/leads/favorites.
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', productId);

        if (error) {
            return { success: false, error: error.message };
        }

        console.log('[Zero-Residual] Property and related data deleted successfully.');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error in adminDeleteProductAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

// User Actions
export async function updateUserRoleAction(userId: string, role: string, adminUserId: string) {
    const isAdmin = await checkAdminStatus(adminUserId);
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const supabase = await getSupabaseClient();
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);

    // Also sync with admin_users table for backward compatibility if role is admin
    if (role === 'admin') {
        const { error: adminError } = await globalSupabase.from('admin_users').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });
        if (adminError) console.error("Error syncing admin user:", adminError);
    } else {
        // If downgrading, remove from admin_users
        const { error: deleteError } = await globalSupabase.from('admin_users').delete().eq('user_id', userId);
        if (deleteError) console.error("Error removing admin user:", deleteError);
    }

    return { success: !error, error: error?.message };
}

export async function toggleUserVerifiedAction(userId: string, isVerified: boolean, adminUserId: string) {
    const isAdmin = await checkAdminStatus(adminUserId);
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const supabase = await getSupabaseClient();
    const { error } = await supabase.from('users').update({ is_verified: isVerified }).eq('id', userId);
    return { success: !error, error: error?.message };
}

export async function togglePropertyVerifiedAction(propertyId: string, isVerified: boolean, adminUserId: string) {
    const isAdmin = await checkAdminStatus(adminUserId);
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const supabase = await getSupabaseClient();
    const { error } = await supabase.from('properties').update({ is_verified: isVerified }).eq('id', propertyId);
    return { success: !error, error: error?.message };
}

// ... existing ad actions ...

// Settings Actions
export async function updateSiteSettingsAction(settings: Record<string, string>, adminUserId: string) {
    const isAdmin = await checkAdminStatus(adminUserId);
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const supabase = await getSupabaseClient();
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from('site_settings').upsert(upserts);
    return { success: !error, error: error?.message };
}

export async function deleteAdAction(adminUserId: string) {
    const isAdmin = await checkAdminStatus(adminUserId);
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const supabase = await getSupabaseClient();

    // We clear the ad fields but keep the row (or delete it, but clearing is safer for IDs)
    // Actually, SQL script used a fixed ID. Let's just update fields to empty/inactive.
    const { error } = await supabase
        .from('ads')
        .update({
            media_url: '',
            media_type: 'image', // reset to default
            cta_text: '',
            cta_link: '',
            is_active: false
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) {
        console.error('Error deleting ad:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Ad Actions
export async function getAdSettingsAction() {
    try {
        const supabase = await getSupabaseClient(); // Public read access
        const { data, error } = await supabase.from('ads').select('*').limit(1).single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, data: null };
            }
            console.error('Error fetching ad settings:', JSON.stringify(error, null, 2));
            return { success: false, error: error.message };
        }
        return { success: true, data };
    } catch (error: any) {
        // Handle fetch/network errors (ECONNRESET etc)
        console.error('Exception in getAdSettingsAction:', error);
        return { success: false, error: error.message || 'Network error' };
    }
}

export async function updateAdSettingsAction(adData: { media_url: string; media_type: 'image' | 'video'; cta_text: string; cta_link: string; is_active: boolean }, adminUserId: string) {
    const isAdmin = await checkAdminStatus(adminUserId);
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const supabase = await getSupabaseClient();

    // We update the single row (assuming ID is known or we just update the first one)
    // Actually, best to fetch the ID first or just upsert with a fixed ID if we enforced it in SQL
    // In SQL we inserted '00000000-0000-0000-0000-000000000001'. Let's use that.

    const { error } = await supabase
        .from('ads')
        .update(adData)
        .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) {
        // Fallback if ID doesn't exist (though SQL script should have created it)
        const { error: insertError } = await supabase.from('ads').insert({
            id: '00000000-0000-0000-0000-000000000001',
            ...adData
        });
        if (insertError) return { success: false, error: insertError.message };
    }

    return { success: true };
}

export async function submitInquiryAction(data: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    phoneNumber?: string;
    propertyId?: string;
}) {
    try {
        const supabase = await getSupabaseClient();

        const { error } = await supabase.from('inquiries').insert({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            subject: data.subject,
            message: data.message,
            phone_number: data.phoneNumber,
            property_id: data.propertyId
        });

        if (error) {
            console.error('Error inserting inquiry:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in submitInquiryAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

export async function updateLeadStatusAction(leadId: string, status: string) {
    try {
        const supabase = await getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Unauthorized' };

        const { error } = await supabase
            .from('leads_activity')
            .update({ status })
            .eq('id', leadId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Error updating lead status:', error);
        return { success: false, error: error.message };
    }
}

export async function trackLeadActivity(data: { propertyId: string, actionType: 'whatsapp' | 'contact', ownerId?: string | null }) {
    console.log(`[TrackLead] Starting for property ${data.propertyId} action ${data.actionType} owner ${data.ownerId}`);
    const supabase = await getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('[TrackLead] No user found');
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const payload: any = {
            property_id: data.propertyId,
            user_id: user.id,
            action_type: data.actionType,
            status: 'new'
        };

        // Only add owner_id if it's a valid UUID
        if (data.ownerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.ownerId)) {
            payload.owner_id = data.ownerId;
        } else if (data.ownerId) {
            console.warn(`[TrackLead] Invalid owner UUID disregarded: ${data.ownerId}`);
        }

        console.log('[TrackLead] Inserting payload:', payload);

        const { data: result, error } = await supabase
            .from('leads_activity')
            .insert(payload)
            .select();

        if (error) {
            console.error('[TrackLead] Insert Error:', error);
            throw error;
        }

        console.log('[TrackLead] Insert Success:', result);
        return { success: true };
    } catch (error) {
        console.error('[TrackLead] Exception:', error);
        return { success: false, error: 'Failed to record activity' };
    }
}

export async function trackPropertyView(propertyId: string) {
    const supabase = await getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
        console.log(`[TrackView] Recording view for user ${user.id} property ${propertyId}`);
        const { error } = await supabase
            .from('property_views')
            .insert({
                property_id: propertyId,
                user_id: user.id
            });

        if (error) {
            console.error('[TrackView] Error:', error);
        } else {
            console.log('[TrackView] Success');
        }
    } catch (err) {
        console.error('[TrackView] Exception:', err);
    }
}

export async function saveAdminSubscription(subscription: string) {
    try {
        const supabase = await getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Not authenticated');

        const isAdmin = await checkAdminStatus(user.id);
        if (!isAdmin) throw new Error('Not authorized');

        const { error } = await supabase
            .from('admin_settings')
            .upsert({
                user_id: user.id,
                push_subscription: JSON.parse(subscription),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Error saving subscription:', error);
        return { success: false, error: error.message };
    }
}

export async function sendNewPropertyNotificationAction(propertyTitle: string, propertyLocation: string, propertyPrice: string) {
    try {
        const { sendAdminPushNotification } = await import('@/lib/notifications');
        await sendAdminPushNotification({
            title: `New Pending Property: ${propertyTitle}`,
            body: `Location: ${propertyLocation} | Price: ₹${propertyPrice}`,
            url: `/admin`
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to trigger admin notification:', error);
        return { success: false };
    }
}





// SMART QR ACTIONS
export async function assignUserQR(adminId: string, targetUserId: string, qrCode: string) {
    if (!adminId || !targetUserId || !qrCode) return { success: false, error: 'Missing Data' };

    if (!qrCode.includes('_')) {
        return { success: false, error: 'Invalid QR Format. Must contain an underscore (PREFIX_ID)' };
    }

    try {
        // Use session-aware client so admin RLS identity is applied
        const supabase = await getSupabaseClient();

        const adminStatus = await checkAdminStatus();
        if (!adminStatus) return { success: false, error: 'Unauthorized' };

        // If the scanned data is a full URL (e.g. https://.../qr/NBF_123), extract just the code
        let codeToSearch = qrCode;
        if (qrCode.includes('/qr/')) {
            codeToSearch = qrCode.split('/qr/').pop() || qrCode;
        }

        // Find QR code (case-insensitive)
        const { data: exactMatch, error: findError } = await supabase
            .from('qr_codes')
            .select('id, code, status')
            .ilike('code', codeToSearch)
            .maybeSingle();

        if (findError) {
            console.error('QR find error:', findError);
            return { success: false, error: findError.message };
        }
        if (!exactMatch) {
            return { success: false, error: `QR Code "${qrCode}" not found. Please generate it first from QR Inventory.` };
        }

        const exactCode = exactMatch.code;

        // Update QR code: mark active and link to user
        const { error: qrError } = await supabase
            .from('qr_codes')
            .update({ status: 'active', assigned_user_id: targetUserId })
            .eq('id', exactMatch.id);

        if (qrError) {
            console.error('QR update error:', qrError);
            return { success: false, error: 'Failed to activate QR: ' + qrError.message };
        }

        // Update user's assigned QR (best effort — column may not exist)
        const { error: userError } = await supabase
            .from('users')
            .update({ assigned_qr_id: exactCode })
            .eq('id', targetUserId);

        if (userError) {
            console.warn('User assigned_qr_id update failed (non-fatal):', userError.message);
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error('Assign QR Error:', error);
        return { success: false, error: error.message };
    }
}

// --- Smart QR Management Actions ---

export async function generateQRCodesAction(count: number, prefix: string, adminId: string) {
    const supabase = await getSupabaseClient();

    const adminStatus = await checkAdminStatus();
    if (!adminStatus) return { success: false, error: 'Unauthorized' };

    const newCodes = [];
    for (let i = 0; i < count; i++) {
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        newCodes.push({
            code: `${prefix}_${randomId}`,
            status: 'unused',
            generated_by: adminId,
            is_downloaded: false
        });
    }

    const { error } = await supabase.from('qr_codes').insert(newCodes);
    if (error) {
        console.error('generateQRCodesAction error:', error);
        return { success: false, error: error.message };
    }
    return { success: true, count: newCodes.length };
}

export async function getQRCodesAction(page: number = 1, limit: number = 100, filter: 'all' | 'unused' | 'active' = 'all') {
    const supabase = await getSupabaseClient();

    const isAdmin = await checkAdminStatus();
    if (!isAdmin) return { success: false, error: 'Unauthorized', codes: [] };

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
        .from('qr_codes')
        .select('*, assigned_user:users!qr_codes_assigned_user_id_fkey(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

    if (filter !== 'all') {
        query = query.eq('status', filter);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('getQRCodesAction error:', error);
        // Fallback without join
        const { data: fallback, error: fbErr } = await supabase
            .from('qr_codes')
            .select('id, code, status, is_downloaded, created_at, assigned_user_id')
            .order('created_at', { ascending: false })
            .range(start, end);
        if (fbErr) return { success: false, error: fbErr.message, codes: [] };
        return { success: true, codes: fallback ?? [], total: 0 };
    }

    return { success: true, codes: data ?? [], total: count || 0 };
}

export async function markQRDownloadedAction(id: string) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from('qr_codes').update({ is_downloaded: true }).eq('id', id);
    if (error) console.warn('markQRDownloadedAction error:', error.message);
    return { success: true };
}

// DELETE QR Code (Admin can delete any QR, including active ones)
export async function deleteQRCodeAction(id: string, adminId: string) {
    if (!id) return { success: false, error: 'Missing QR ID' };

    const isAdmin = await checkAdminStatus();
    if (!isAdmin) return { success: false, error: 'Unauthorized' };

    const supabase = await getSupabaseClient();

    // If active, auto-unlink the user first
    const { data: qrcode } = await supabase
        .from('qr_codes')
        .select('id, status, assigned_user_id, code')
        .eq('id', id)
        .maybeSingle();

    if (qrcode?.status === 'active' && qrcode?.assigned_user_id) {
        // Remove QR from user profile
        await supabase
            .from('users')
            .update({ assigned_qr_id: null })
            .eq('id', qrcode.assigned_user_id);
    }

    const { error } = await supabase.from('qr_codes').delete().eq('id', id);
    if (error) {
        console.error('Delete QR Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
}


// User action to toggle their own property status (Active/Inactive)
export async function togglePropertyStatusUserAction(
    propertyId: string,
    isActive: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await getSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not logged in' };
        }

        // Verify ownership
        const { data: property, error: fetchError } = await supabase
            .from('properties')
            .select('user_id')
            .eq('id', propertyId)
            .single();

        if (fetchError || !property) {
            return { success: false, error: 'Property not found' };
        }

        if (property.user_id !== user.id) {
            return { success: false, error: 'Unauthorized: You do not own this property' };
        }

        const newStatus = isActive ? 'approved' : 'inactive';

        const { error: updateError } = await supabase
            .from('properties')
            .update({
                available_for_sale: isActive,
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', propertyId);

        if (updateError) {
            console.error('Error updating property status:', updateError);
            return { success: false, error: updateError.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in togglePropertyStatusUserAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}



// --- SMART REVIEW SYSTEM ACTIONS ---

export async function submitReviewAction(rating: number, content: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await getSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not logged in' };
        }

        const { error } = await supabase.from('reviews').insert({
            user_id: user.id,
            rating,
            content,
            status: 'approved'
        });

        if (error) {
            console.error('Error submitting review:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/reviews');
        return { success: true };
    } catch (error: any) {
        console.error('Error in submitReviewAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

export async function getReviewsAction(page: number = 1, limit: number = 20) {
    const supabase = await getSupabaseClient();
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await supabase
        .from('reviews')
        .select(`
            *,
            user:users!reviews_user_id_fkey (
                full_name,
                avatar_url
            )
        `, { count: 'exact' })
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(start, end);

    if (error) {
        console.error('Error fetching reviews:', error);
        return { success: false, error: error.message, reviews: [] };
    }

    return { success: true, reviews: data || [], total: count || 0 };
}

export async function deleteReviewAction(reviewId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const isAdmin = await checkAdminStatus(adminId);
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const supabase = await getSupabaseClient();
        const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

        if (error) {
            console.error('Error deleting review:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/reviews');
        return { success: true };
    } catch (error: any) {
        console.error('Error in deleteReviewAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

export async function replyToReviewAction(reviewId: string, reply: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const isAdmin = await checkAdminStatus(adminId);
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const supabase = await getSupabaseClient();
        const { error } = await supabase
            .from('reviews')
            .update({
                admin_reply: reply,
                admin_reply_at: new Date().toISOString()
            })
            .eq('id', reviewId);

        if (error) return { success: false, error: error.message };
        
        revalidatePath('/reviews');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateReviewStatusAction(reviewId: string, status: 'approved' | 'rejected' | 'blocked', adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const isAdmin = await checkAdminStatus(adminId);
        if (!isAdmin) return { success: false, error: 'Unauthorized' };

        const supabase = await getSupabaseClient();
        const { error } = await supabase
            .from('reviews')
            .update({ status })
            .eq('id', reviewId);

        if (error) return { success: false, error: error.message };
        
        revalidatePath('/reviews');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getReviewsAdminAction(page: number = 1, limit: number = 50) {
    try {
        const isAdmin = await checkAdminStatus();
        if (!isAdmin) return { success: false, error: 'Unauthorized', reviews: [] };

        const supabase = await getSupabaseClient();
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error, count } = await supabase
            .from('reviews')
            .select(`
                *,
                user:users!reviews_user_id_fkey (
                    full_name,
                    email,
                    avatar_url
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            console.error('Error fetching admin reviews:', error);
            return { success: false, error: error.message, reviews: [] };
        }

        return { success: true, reviews: data || [], total: count || 0 };
    } catch (error: any) {
        return { success: false, error: error.message, reviews: [] };
    }
}
