'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function HeroSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/properties?query=${encodeURIComponent(query.trim())}`);
        } else {
            router.push('/search');
        }
    };

    return (
        <div className="mt-4 w-full md:w-full max-w-2xl relative z-50 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form
                onSubmit={handleSearch}
                className="flex flex-row items-center justify-between w-full p-1.5 md:p-2 bg-white rounded-xl hover:bg-white/95 transition-all shadow-xl border border-neutral-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10"
            >
                <div className="flex-1 flex items-center pl-3">
                    <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by City, Locality or Project..."
                        className="w-full bg-transparent text-sm md:text-base font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none py-2"
                    />
                </div>
                <button
                    type="submit"
                    className="shrink-0 px-6 py-2.5 bg-neutral-900 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors ml-2"
                >
                    Search
                </button>
            </form>
        </div>
    );
}
