'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductImage } from '@/components/ui/product-image';
import useEmblaCarousel from 'embla-carousel-react';
import { Product, Image as ProductImageType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useProductImages, useSelectedOptions } from '@/components/products/variant-selector';
import { getOptimizedImageUrl } from '@/lib/cloudinary-utils';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileGallerySliderProps {
  product: Product;
}

export function MobileGallerySlider({ product }: MobileGallerySliderProps) {
  const selectedOptions = useSelectedOptions(product);
  const images = useProductImages(product, selectedOptions);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    loop: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const onInit = useCallback(() => {}, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Lock scroll when fullscreen is open
  useEffect(() => {
    if (fullscreenOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [fullscreenOpen]);

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  const closeFullscreen = () => setFullscreenOpen(false);

  const prevFullscreen = () =>
    setFullscreenIndex(i => (i - 1 + images.length) % images.length);

  const nextFullscreen = () =>
    setFullscreenIndex(i => (i + 1) % images.length);

  const totalImages = images.length;
  if (totalImages === 0) return null;

  return (
    <>
      <div className="relative w-full h-full">
        {/* Embla Carousel */}
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((image: ProductImageType, index: number) => (
              <div
                key={`${image.url}-${index}`}
                className="flex-shrink-0 w-full h-full relative"
              >
                <ProductImage
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}
                  src={getOptimizedImageUrl(image.url, 800, undefined, 'limit')}
                  fallbackSrc="/placeholder.jpg"
                  alt={`Room for rent in ${product.tags?.[1] || 'Mandsaur'} - ${product.title} NBF Homes`}
                  width={image.width}
                  height={image.height}
                  className="w-full h-full object-cover"
                  quality={70}
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => openFullscreen(selectedIndex)}
          className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="View fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Counter Badge */}
        {totalImages > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge variant="outline-secondary">
              {selectedIndex + 1}/{totalImages}
            </Badge>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {fullscreenOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={closeFullscreen}
        >
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
            {fullscreenIndex + 1} / {totalImages}
          </div>

          {/* Image */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={getOptimizedImageUrl(images[fullscreenIndex].url, 1200, undefined, 'limit')}
              alt={`Property photo ${fullscreenIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Prev / Next buttons */}
          {totalImages > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prevFullscreen(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); nextFullscreen(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
