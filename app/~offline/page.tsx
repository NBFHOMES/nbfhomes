import { WifiOff, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Offline | NBF Homes',
  description: 'You are currently offline.',
};

export default function OfflineFallback() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-neutral-50 p-6 text-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full flex flex-col items-center border border-neutral-100">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 text-red-600 animate-pulse">
          <WifiOff size={48} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 mb-4">
          No Internet Connection
        </h1>
        
        <p className="text-neutral-500 mb-8 max-w-sm text-lg leading-relaxed">
          It looks like you're offline. Some parts of the app might still work, but to load new properties, you'll need to reconnect.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          {/* Removed Try Again button because event handlers are not allowed in Server Components */}
          
          <Link 
            href="/"
            className="flex-1 bg-white text-black border-2 border-black px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors flex items-center justify-center gap-3"
          >
            <Home size={20} />
            Homepage
          </Link>
        </div>

        <p className="mt-8 text-sm font-semibold text-neutral-400 uppercase tracking-widest">
          NBF Homes Offline Mode
        </p>
      </div>
    </div>
  );
}
