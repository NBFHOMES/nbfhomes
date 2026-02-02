'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper to create context-aware Supabase client (Duplicated helper to avoid import cycle with actions.ts)
async function getSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
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

export async function submitSupportRequestAction(data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    subject: string;
    message: string;
    userId?: string;
}) {
    try {
        const supabase = await getSupabaseClient();

        // Insert into support_requests
        const { error } = await supabase.from('support_requests').insert({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone_number: data.phoneNumber,
            subject: data.subject,
            message: data.message,
            user_id: data.userId
        });

        if (error) {
            console.error('Error inserting support request:', error);
            return { success: false, error: error.message };
        }

        // Trigger Notification to Admin
        try {
            // Dynamic import to keep dependencies light and isolated
            const { sendAdminPushNotification } = await import('@/lib/notifications');
            await sendAdminPushNotification({
                title: `New Support Appeal: ${data.firstName}`,
                body: `Subject: ${data.subject}`,
                url: `/admin`
            });
        } catch (notifError) {
            console.warn('Failed to send admin notification for support request:', notifError);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in submitSupportRequestAction:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}
