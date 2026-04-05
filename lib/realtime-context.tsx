'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from './db';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

interface RealtimeContextType {
  notifications: any[];
  unreadCount: number;
  subscribeToPropertyUpdates: (propertyId?: string) => void;
  subscribeToUserNotifications: (userId: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch initial leads as notifications
    const fetchInitialData = async () => {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id);

      if (properties && properties.length > 0) {
        const propertyIds = properties.map(p => p.id);
        const { data: leads } = await supabase
          .from('leads_activity')
          .select('*, property:property_id(title)')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false })
          .limit(10);

        if (leads) {
          const mapped = leads.map(l => ({
            id: l.id,
            title: `New lead: ${l.lead_name}`,
            message: `Interested in ${l.property?.title || 'your property'}`,
            createdAt: l.created_at,
            read: false // Simple state, ideally from a separate notifications table
          }));
          setNotifications(mapped);
          setUnreadCount(mapped.length);
        }
      }
    };

    fetchInitialData();

    // 2. Subscribe to REAL-TIME leads
    const channel = supabase
      .channel(`user-leads-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads_activity'
        },
        async (payload) => {
          // Check if this property belongs to the current user
          const { data: property } = await supabase
            .from('properties')
            .select('user_id, title')
            .eq('id', payload.new.property_id)
            .single();

          if (property && property.user_id === user.id) {
            const newNotif = {
              id: payload.new.id,
              title: `New lead: ${payload.new.lead_name}`,
              message: `Interested in ${property.title}`,
              createdAt: payload.new.created_at,
              read: false
            };
            
            setNotifications(prev => [newNotif, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
            
            toast.info('📱 New Enquiry Received!', {
              description: `${payload.new.lead_name} contacted you.`
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const value: RealtimeContextType = {
    notifications,
    unreadCount,
    subscribeToPropertyUpdates: () => {},
    subscribeToUserNotifications: () => {},
    markAsRead: (id) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    },
    markAllAsRead: () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    },
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
