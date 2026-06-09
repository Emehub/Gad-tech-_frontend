import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency = 'GHS') {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-GH', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date));
}

export function getDiscountPercent(price: number, comparePrice: number) {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function slugToTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function truncate(text: string, length = 80) {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}
