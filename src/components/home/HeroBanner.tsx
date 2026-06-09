'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/types';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900 aspect-16/6 lg:aspect-16/5">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <Image src={b.image} alt={b.title} fill className="object-cover" priority={i === 0} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 lg:px-16 max-w-xl">
              <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3">{b.title}</h2>
              {b.subtitle && <p className="text-base lg:text-xl text-gray-200 mb-6">{b.subtitle}</p>}
              {b.link && (
                <Link
                  href={b.link}
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm lg:text-base"
                >
                  {b.buttonText ?? 'Shop Now'}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn("w-2 h-2 rounded-full transition-all", i === current ? "bg-white w-6" : "bg-white/50")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
