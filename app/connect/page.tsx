import { PageLayout } from '@/components/layout/page-layout';
import { Metadata } from 'next';
import { Twitter, Linkedin, Facebook, Instagram, MessageCircle, Home, Mail, ChevronRight } from 'lucide-react';
import { LogoSvg } from '@/components/layout/header/logo-svg';

export const metadata: Metadata = {
    title: 'Connect with NBF Homes - Official Social Media & Contact',
    description: 'Find all official social media links, contact information, and details about NBF Homes. Connect with us on Instagram, LinkedIn, Facebook, Twitter, and WhatsApp.',
    openGraph: {
        title: 'Connect with NBF Homes',
        description: 'India’s fastest growing 0% brokerage property rental platform.',
        url: 'https://nbfhomes.in/connect',
        siteName: 'NBF Homes',
        images: [
            {
                url: '/icon.png', 
                width: 512,
                height: 512,
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },
};

// This is the most crucial part for SEO - The Knowledge Panel Data
const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NBF Homes",
    "url": "https://nbfhomes.in",
    "logo": "https://nbfhomes.in/icon.png",
    "description": "NBF Homes is India's premier property marketplace for Tier 1-4 cities for renting PGs, Rooms, Flats, and Houses with zero brokerage and direct owner contact.",
    "sameAs": [
        "https://x.com/nbfhomes",
        "https://www.linkedin.com/in/nbf-homes-2689b4381",
        "https://www.facebook.com/share/17qdRqXzeN/",
        "https://www.instagram.com/nbfhomes",
        "https://whatsapp.com/channel/0029Vb74TGqFnSzA8mE6wE0Y"
    ]
};

const SOCIAL_LINKS = [
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/nbfhomes?igsh=djhqOGFxZ3B0YTdm',
        icon: Instagram,
        color: 'from-pink-500 to-purple-500',
        textColor: 'text-pink-600',
        bg: 'bg-pink-50'
    },
    {
        name: 'WhatsApp Channel',
        href: 'https://whatsapp.com/channel/0029Vb74TGqFnSzA8mE6wE0Y',
        icon: MessageCircle,
        color: 'from-green-400 to-green-600',
        textColor: 'text-green-600',
        bg: 'bg-green-50'
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/nbf-homes-2689b4381',
        icon: Linkedin,
        color: 'from-blue-600 to-blue-800',
        textColor: 'text-blue-700',
        bg: 'bg-blue-50'
    },
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/share/17qdRqXzeN/',
        icon: Facebook,
        color: 'from-blue-500 to-blue-700',
        textColor: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        name: 'X (Twitter)',
        href: 'https://x.com/nbfhomes',
        icon: Twitter,
        color: 'from-neutral-700 to-black',
        textColor: 'text-neutral-900',
        bg: 'bg-neutral-100'
    }
];

export default function ConnectPage() {
    return (
        <PageLayout>
            {/* Inject JSON-LD Schema explicitly for Google Bots */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center py-20 px-4">
                <div className="w-full max-w-lg mx-auto">
                    
                    {/* Header Profile Section */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center p-4 shadow-xl shadow-black/10 mb-6 transform hover:scale-105 transition-transform duration-300">
                            <LogoSvg className="w-full h-auto text-white fill-white" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-neutral-900 flex items-center gap-2">
                            NBF Homes
                            <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-blue-500 text-white rounded-full text-[10px] shadow-sm">
                                ✓
                            </span>
                        </h1>
                        <p className="text-neutral-500 font-medium mt-1">@nbfhomes</p>
                        <p className="text-neutral-600 mt-4 leading-relaxed px-4 text-sm md:text-base">
                            India's first 100% Zero-Brokerage Property Platform for Tier 1 to Tier 4 cities. Direct Owner Contact. Verified Listings.
                        </p>
                    </div>

                    {/* Links Grid */}
                    <div className="space-y-4 w-full">
                        {SOCIAL_LINKS.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.bg} ${link.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                        <link.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold text-neutral-900 text-lg group-hover:text-black transition-colors">{link.name}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                            </a>
                        ))}
                    </div>

                    {/* Extra Contact or Website Link */}
                    <div className="mt-8 pt-8 border-t border-neutral-200 space-y-4">
                        <a
                            href="/"
                            className="w-full flex items-center justify-center gap-2 p-4 bg-black text-white rounded-2xl font-semibold hover:bg-neutral-800 transition-colors shadow-lg"
                        >
                            <Home className="w-5 h-5" />
                            Visit Primary Website
                        </a>
                        <a
                            href="mailto:contact@nbfhomes.in"
                            className="w-full flex items-center justify-center gap-2 p-4 bg-white text-neutral-900 rounded-2xl border border-neutral-200 font-semibold hover:bg-neutral-50 transition-colors shadow-sm"
                        >
                            <Mail className="w-5 h-5" />
                            contact@nbfhomes.in
                        </a>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
