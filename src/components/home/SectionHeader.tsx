import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function SectionHeader({ title, subtitle, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-6 bg-green-600 rounded-full" />
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-gray-500 ml-3">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="flex items-center gap-1 text-sm text-green-600 font-medium hover:underline">
          View All <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
