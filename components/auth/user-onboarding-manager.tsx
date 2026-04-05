'use client';

import { useAuth } from '@/lib/auth-context';
import { OnboardingModal } from './onboarding-modal';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db';

/**
 * UserOnboardingManager v3
 *
 * Shows the onboarding modal if the user is missing ANY of:
 *   - contact_number
 *   - whatsapp_number
 *   - profession (category)
 *
 * Strategy:
 *   1. Fast-path: if localStorage key is set → skip DB check (cache).
 *   2. On every fresh session (no localStorage) → DB check.
 *   3. If any field is empty in DB → show modal (forces ALL existing users).
 *   4. On complete → set localStorage, close modal.
 *
 * Existing users who already did old onboarding but have no whatsapp_number
 * will see the modal again because whatsapp_number will be NULL in DB.
 */
export function UserOnboardingManager() {
    const { user, isLoading } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Skip if already checked in this session (even if unmounted/remounted)
        if (typeof window !== 'undefined' && (window as any)._nbf_onboarding_checked) {
            return;
        }

        async function checkOnboarding() {
            if (isLoading || !user || hasChecked) return;

            // 1. Check if user is admin - Admins bypass onboarding
            try {
                const { data: adminData } = await supabase
                    .from('admin_users')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .single();
                
                if (adminData) {
                    console.log('Admin detected, bypassing onboarding');
                    (window as any)._nbf_onboarding_checked = true;
                    setHasChecked(true);
                    return;
                }
            } catch (e) { /* ignore */ }

            // 2. Fast-path: localStorage cache
            const cached = localStorage.getItem('nbf_onboarding_v2_done');
            if (cached === 'true') {
                // Mark as checked for this session so we don't keep hitting the DB on every internal navigation
                (window as any)._nbf_onboarding_checked = true;
                setHasChecked(true);
                
                // Silent background verify (only once)
                try {
                    const { data } = await supabase
                        .from('users')
                        .select('contact_number, whatsapp_number, profession')
                        .eq('id', user.id)
                        .single();

                    if (!data?.contact_number || !data?.whatsapp_number || !data?.profession) {
                        localStorage.removeItem('nbf_onboarding_v2_done');
                        (window as any)._nbf_onboarding_checked = false;
                        setShowModal(true);
                    }
                } catch { /* network err */ }
                return;
            }

            // 3. No cache -> full DB check
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('contact_number, whatsapp_number, profession')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error checking user onboarding:', error);
                    return;
                }

                const needsOnboarding = !data?.contact_number || !data?.whatsapp_number || !data?.profession;

                if (needsOnboarding) {
                    setShowModal(true);
                } else {
                    localStorage.setItem('nbf_onboarding_v2_done', 'true');
                    (window as any)._nbf_onboarding_checked = true;
                }
            } catch (err) {
                console.error('Onboarding check error:', err);
            } finally {
                setHasChecked(true);
            }
        }

        checkOnboarding();
    }, [user, isLoading, hasChecked]);

    if (!showModal) return null;

    return (
        <OnboardingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onComplete={() => {
                setShowModal(false);
                localStorage.setItem('nbf_onboarding_v2_done', 'true');
            }}
        />
    );
}
