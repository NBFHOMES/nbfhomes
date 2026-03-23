import { PageLayout } from '@/components/layout/page-layout';
import { getProducts } from '@/lib/api';
import { getAdSettingsAction } from '@/app/actions';
import { Product, AdSettings } from '../lib/types';
import { HomeClient } from '@/components/home/home-client';

// Cache for 0 seconds (dynamic) to ensure SEO updates are reflected immediately during dev
export const revalidate = 0;

export default async function Home() {
  let featuredProducts: Product[] = [];
  let adSettings: AdSettings | null = null;

  try {
    // 🚀 PARALLEL DATA FETCHING: Fetch products and ad settings simultaneously to cut server time in half
    const [productsResult, adResult] = await Promise.all([
      getProducts({ limit: 12 }),
      getAdSettingsAction()
    ]);

    featuredProducts = productsResult;

    if (adResult.success && adResult.data) {
      adSettings = adResult.data as AdSettings;
    }
  } catch (error) {
    console.error('Error fetching home data:', error);
    featuredProducts = [];
  }

  return (
    <PageLayout>
      <HomeClient initialProducts={featuredProducts} adSettings={adSettings} />
    </PageLayout>
  );
}
