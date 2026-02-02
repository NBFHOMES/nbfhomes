import { format } from 'date-fns';
import { MessageCircle, Phone, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
    id: string;
    created_at: string;
    action_type: string;
    property_title: string;
    property_handle?: string;
    user_name: string;
    user_email: string;
    user_phone: string;
}

interface ActivityTimelineProps {
    activities: ActivityItem[];
    loading?: boolean;
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-neutral-900">Recent User Interactions</h3>
                <span className="text-xs text-neutral-500 bg-white border border-neutral-200 px-2 py-1 rounded-md">Last 10 Activities</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Property</th>
                            <th className="px-4 py-3">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {activities.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                                    No recent activity found.
                                </td>
                            </tr>
                        ) : (
                            activities.map((activity) => (
                                <tr key={activity.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-neutral-900">{activity.user_name}</div>
                                        <div className="text-xs text-neutral-500">{activity.user_email}</div>
                                        {activity.user_phone && activity.user_phone !== 'N/A' && (
                                            <div className="text-xs text-neutral-400 font-mono mt-0.5">{activity.user_phone}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${activity.action_type === 'whatsapp'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : activity.action_type === 'call'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-orange-50 text-orange-700 border-orange-100'
                                            }`}>
                                            {activity.action_type === 'whatsapp' ? <MessageCircle className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                                            {activity.action_type}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 max-w-[200px]">
                                        <Link
                                            href={`/property/${activity.property_handle || '#'}`}
                                            target="_blank"
                                            className="group flex items-center gap-1 text-neutral-600 hover:text-black truncate"
                                        >
                                            <span className="truncate" title={activity.property_title}>{activity.property_title}</span>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                                        {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
