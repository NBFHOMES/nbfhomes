'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Video, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { uploadMedia } from '@/lib/cloudinary-utils';
import { getAdvertisementsAction, saveAdvertisementAction, deleteAdvertisementAction, updateAdOrderAction } from '@/app/actions';
import { toast } from 'sonner';

export function SmartAdManager() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // New Ad Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newAd, setNewAd] = useState({
        title: '',
        desktop_media_url: '',
        desktop_media_type: 'image' as 'image'|'video',
        mobile_media_url: '',
        mobile_media_type: 'image' as 'image'|'video',
        action_url: '',
        is_active: true
    });

    useEffect(() => {
        loadAds();
    }, []);

    async function loadAds() {
        setLoading(true);
        try {
            const result = await getAdvertisementsAction();
            if (result.success && result.data) {
                setAds(result.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load advertisements');
        } finally {
            setLoading(false);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, device: 'mobile' | 'desktop', type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 5MB Limit per user request
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit.");
            return;
        }

        setUploading(true);
        try {
            const url = await uploadMedia(file, 'nbfhomes/smart-ads', type);
            if (device === 'mobile') {
                setNewAd(prev => ({ ...prev, mobile_media_url: url, mobile_media_type: type }));
            } else {
                setNewAd(prev => ({ ...prev, desktop_media_url: url, desktop_media_type: type }));
            }
            toast.success(`${device} ${type} uploaded!`);
        } catch (error: any) {
            toast.error('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveNewAd = async () => {
        if (!newAd.title || !newAd.desktop_media_url || !newAd.mobile_media_url) {
            toast.error("Title, and both Mobile & Desktop media are required.");
            return;
        }

        if (ads.length >= 3) {
            toast.error("Maximum 3 advertisements allowed. Please delete one first.");
            return;
        }

        try {
            const res = await saveAdvertisementAction({ ...newAd, order_index: ads.length });
            if (res.success) {
                toast.success("Ad created successfully!");
                setIsAdding(false);
                setNewAd({
                    title: '',
                    desktop_media_url: '',
                    desktop_media_type: 'image',
                    mobile_media_url: '',
                    mobile_media_type: 'image',
                    action_url: '',
                    is_active: true
                });
                loadAds();
            } else {
                toast.error("Failed to save ad: " + res.error);
            }
        } catch (err) {
            toast.error("Error saving ad");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this advertisement completely?')) return;
        try {
            const res = await deleteAdvertisementAction(id);
            if (res.success) {
                toast.success("Ad deleted");
                loadAds();
            } else {
                toast.error("Failed to delete ad");
            }
        } catch (error) {
            toast.error("Error deleting ad");
        }
    };

    const handleToggleActive = async (ad: any) => {
        try {
            await saveAdvertisementAction({ ...ad, is_active: !ad.is_active });
            loadAds();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };
    
    const moveAd = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) || 
            (direction === 'down' && index === ads.length - 1)
        ) return;
        
        const newAds = [...ads];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap order index
        const tempOrder = newAds[index].order_index;
        newAds[index].order_index = newAds[targetIndex].order_index;
        newAds[targetIndex].order_index = tempOrder;
        
        // Update both in DB
        await updateAdOrderAction(newAds[index].id, newAds[index].order_index);
        await updateAdOrderAction(newAds[targetIndex].id, newAds[targetIndex].order_index);
        
        loadAds();
    };


    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">Smart Slide Advertisements</h2>
                    <p className="text-sm text-neutral-500">Manage up to 3 sliding ads showing at the bottom of the home page.</p>
                </div>
                {!isAdding && ads.length < 3 && (
                    <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Ad
                    </Button>
                )}
            </div>

            {/* Active Ads List */}
            <div className="grid grid-cols-1 gap-6">
                {ads.map((ad, idx) => (
                    <Card key={ad.id} className={`border-l-4 ${ad.is_active ? 'border-l-green-500' : 'border-l-neutral-300'}`}>
                        <div className="flex flex-col md:flex-row p-4 gap-6 items-center">
                            
                            {/* Order Controls */}
                            <div className="flex flex-col gap-2">
                                <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveAd(idx, 'up')}><ArrowUp className="w-4 h-4"/></Button>
                                <span className="font-bold text-center">{idx + 1}</span>
                                <Button variant="ghost" size="icon" disabled={idx === ads.length - 1} onClick={() => moveAd(idx, 'down')}><ArrowDown className="w-4 h-4"/></Button>
                            </div>

                            {/* Previews */}
                            <div className="flex gap-4">
                                <div className="w-24 h-40 bg-neutral-100 rounded-md border flex flex-col justify-end relative overflow-hidden group">
                                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded z-10">Mobile</div>
                                    {ad.mobile_media_type === 'video' ? 
                                        <video src={ad.mobile_media_url} className="w-full h-full object-cover" muted /> :
                                        <img src={ad.mobile_media_url} className="w-full h-full object-cover" />
                                    }
                                </div>
                                <div className="w-60 h-40 bg-neutral-100 rounded-md border flex flex-col justify-end relative overflow-hidden group">
                                     <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded z-10">Desktop</div>
                                    {ad.desktop_media_type === 'video' ? 
                                        <video src={ad.desktop_media_url} className="w-full h-full object-cover" muted /> :
                                        <img src={ad.desktop_media_url} className="w-full h-full object-cover" />
                                    }
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                                <h3 className="font-bold text-lg">{ad.title}</h3>
                                {ad.action_url && <p className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">Link: {ad.action_url}</p>}
                                <div className="flex items-center gap-2 mt-4">
                                    <Switch checked={ad.is_active} onCheckedChange={() => handleToggleActive(ad)} />
                                    <span className="text-sm font-medium">{ad.is_active ? 'Active' : 'Hidden'}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div>
                                <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(ad.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {ads.length === 0 && !isAdding && (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                        <p className="text-neutral-500 mb-4">No ads configured yet.</p>
                        <Button onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-2" /> Setup First Ad</Button>
                    </div>
                )}
            </div>

            {/* New Ad Form */}
            {isAdding && (
                <Card className="border-blue-200 shadow-md bg-blue-50/10">
                    <CardHeader>
                        <CardTitle>Create New Smart Ad</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label>Ad Internal Title</Label>
                            <Input value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} placeholder="e.g. Diwali Offer Video" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 bg-white border rounded-xl space-y-4 shadow-sm">
                                <div>
                                    <h4 className="font-bold flex items-center gap-2">📱 Mobile Device Media</h4>
                                    <p className="text-xs text-neutral-500">Vertical ratio (9:16). Max 5MB Video or Image.</p>
                                </div>
                                
                                <div className="flex gap-2">
                                     <div className="relative flex-1">
                                        <input type="file" accept="image/*" className="hidden" id="mob-img" onChange={(e) => handleFileUpload(e, 'mobile', 'image')} />
                                        <Button variant="outline" className="w-full" asChild disabled={uploading}>
                                            <label htmlFor="mob-img" className="cursor-pointer"><ImageIcon className="w-4 h-4 mr-2" /> Image</label>
                                        </Button>
                                    </div>
                                    <div className="relative flex-1">
                                        <input type="file" accept="video/mp4,video/webm" className="hidden" id="mob-vid" onChange={(e) => handleFileUpload(e, 'mobile', 'video')} />
                                        <Button variant="outline" className="w-full" asChild disabled={uploading}>
                                            <label htmlFor="mob-vid" className="cursor-pointer"><Video className="w-4 h-4 mr-2" /> Video</label>
                                        </Button>
                                    </div>
                                </div>
                                {newAd.mobile_media_url && <div className="text-xs font-bold text-green-600 text-center bg-green-50 py-1 rounded">✅ Mobile Media Attached</div>}
                            </div>

                            <div className="p-4 bg-white border rounded-xl space-y-4 shadow-sm">
                                <div>
                                    <h4 className="font-bold flex items-center gap-2">💻 Computer Device Media</h4>
                                    <p className="text-xs text-neutral-500">Horizontal ratio (16:9). Max 5MB Video or Image.</p>
                                </div>
                                <div className="flex gap-2">
                                     <div className="relative flex-1">
                                        <input type="file" accept="image/*" className="hidden" id="desk-img" onChange={(e) => handleFileUpload(e, 'desktop', 'image')} />
                                        <Button variant="outline" className="w-full" asChild disabled={uploading}>
                                            <label htmlFor="desk-img" className="cursor-pointer"><ImageIcon className="w-4 h-4 mr-2" /> Image</label>
                                        </Button>
                                    </div>
                                    <div className="relative flex-1">
                                        <input type="file" accept="video/mp4,video/webm" className="hidden" id="desk-vid" onChange={(e) => handleFileUpload(e, 'desktop', 'video')} />
                                        <Button variant="outline" className="w-full" asChild disabled={uploading}>
                                            <label htmlFor="desk-vid" className="cursor-pointer"><Video className="w-4 h-4 mr-2" /> Video</label>
                                        </Button>
                                    </div>
                                </div>
                                {newAd.desktop_media_url && <div className="text-xs font-bold text-green-600 text-center bg-green-50 py-1 rounded">✅ Desktop Media Attached</div>}
                            </div>
                        </div>

                        <div>
                            <Label>Action URL / Link (Optional)</Label>
                            <Input value={newAd.action_url} onChange={e => setNewAd({...newAd, action_url: e.target.value})} placeholder="https://nbfhomes.in/properties..." />
                            <p className="text-xs text-neutral-500 mt-1">If provided, tapping the ad will open this link.</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleSaveNewAd} disabled={uploading}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save New Ad"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {ads.length >= 3 && !isAdding && (
                <div className="text-center py-4 bg-orange-50 text-orange-800 rounded-lg text-sm font-medium">
                    Maximum limit of 3 ads reached. To add a new one, delete an existing ad.
                </div>
            )}
        </div>
    );
}
