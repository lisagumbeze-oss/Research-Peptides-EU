import { motion } from 'motion/react';
import { ProductBadge } from '../products/ProductBadge';
import { ProductImagePlaceholder } from '../products/ProductImagePlaceholder';
import { cn } from '../../lib/utils';

type ProductGalleryProps = {
  productId: string;
  title: string;
  images: string[];
  activeIndex: number;
  onSelectImage: (index: number) => void;
  lowStock?: boolean;
};

export function ProductGallery({
  productId,
  title,
  images,
  activeIndex,
  onSelectImage,
  lowStock,
}: ProductGalleryProps) {
  return (
    <div className="space-y-4">
      <div className="relative rounded-3xl aspect-square overflow-hidden bg-white border border-brand-100 shadow-card">
        {images.length > 0 ? (
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover"
            loading={activeIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={activeIndex === 0 ? 'high' : 'low'}
          />
        ) : (
          <ProductImagePlaceholder productId={productId} title={title} className="h-full w-full min-h-[16rem]" />
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <ProductBadge type="elite" size="md" />
          {lowStock ? <ProductBadge type="low_stock" size="md" /> : null}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectImage(i)}
              className={cn(
                'w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                activeIndex === i
                  ? 'border-brand-500 shadow-elevated scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={activeIndex === i}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
