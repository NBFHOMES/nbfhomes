import { PageLayout } from '@/components/layout/page-layout';
import { getProducts } from '@/lib/api';
import { getAdvertisementsAction } from '@/app/actions';
import { Product } from '../lib/types';
import { HomeClient } from '@/components/home/home-client';

// Cache for 0 seconds (dynamic) to ensure SEO updates are reflected immediately during dev
export const revalidate = 0;

export default async function Home() {
  let featuredProducts: Product[] = [];
  let ads: any[] = [];

  // Fetch Products (non-blocking for ads)
  try {
    featuredProducts = await getProducts({ limit: 12 });
  } catch (error) {
    console.error('Error fetching featured products:', error);
  }

  // Fetch Ads (independent)
  try {
    const adResult = await getAdvertisementsAction();
    if (adResult.success && adResult.data) {
      ads = adResult.data;
    }
  } catch (error) {
    console.error('Error fetching ads in Home:', error);
  }

  return (
    <PageLayout>
      <HomeClient initialProducts={featuredProducts} ads={ads} />
    </PageLayout>
  );
}
