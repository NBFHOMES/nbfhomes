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
        async function checkOnboarding() {
            if (isLoading || !user || hasChecked) return;

            // Fast-path: localStorage cache
            const cached = localStorage.getItem('nbf_onboarding_v2_done');
            if (cached === 'true') {
                // Even if cached, do a quick silent DB verify to catch stale cache
                // (only once per session via hasChecked flag)
                try {
                    const { data } = await supabase
                        .from('users')
                        .select('contact_number, whatsapp_number, profession')
                        .eq('id', user.id)
                        .single();

                    // If DB says empty, invalidate cache and show modal
                    if (!data?.contact_number || !data?.whatsapp_number || !data?.profession) {
                        localStorage.removeItem('nbf_onboarding_v2_done');
                        setShowModal(true);
                    }
                } catch {
                    // Network error — don't block the user
                }
                setHasChecked(true);
                return;
            }

            // No cache → always do full DB check
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('contact_number, whatsapp_number, profession')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    // PGRST116 = no row found = brand new user
                    if (error.code === 'PGRST116') {
                        setShowModal(true);
                        return;
                    }
                    console.error('Error checking user onboarding:', error);
                    return;
                }

                const needsOnboarding =
                    !data?.contact_number || !data?.whatsapp_number || !data?.profession;

                if (needsOnboarding) {
                    setShowModal(true);
                } else {
                    // All fields complete — set cache
                    localStorage.setItem('nbf_onboarding_v2_done', 'true');
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
