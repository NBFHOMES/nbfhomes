
import { PageLayout } from '@/components/layout/page-layout';
import { SupportForm } from '@/components/common/SupportForm';

export default function HelpPage() {
    return (
        <PageLayout>
            <div className="bg-neutral-50 min-h-screen pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif font-medium text-neutral-900 mb-6">Support & Help</h1>
                        <p className="text-xl text-neutral-600">
                            Need assistance? We're here to help resolve any issues with your account or experience.
                        </p>
                    </div>

                    <SupportForm />
                </div>
            </div>
        </PageLayout>
    );
}
