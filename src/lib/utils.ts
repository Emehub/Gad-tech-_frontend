import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: any, currency = 'GHS') {
  let num: number;
  if (typeof amount === 'number') {
    num = amount;
  } else if (typeof amount === 'string') {
    num = parseFloat(amount);
  } else if (amount !== null && typeof amount === 'object') {
    // Prisma Decimal object {s, e, d} — reconstruct numeric value
    if (typeof amount.toNumber === 'function') {
      num = amount.toNumber();
    } else if (Array.isArray(amount.d) && typeof amount.e === 'number') {
      const first = amount.d[0];
      num = first * Math.pow(10, amount.e - String(first).length + 1);
      if (amount.s === -1) num = -num;
    } else {
      num = parseFloat(String(amount));
    }
  } else {
    num = Number(amount);
  }
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
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
