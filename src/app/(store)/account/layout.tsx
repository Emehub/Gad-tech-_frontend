'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Package, MapPin, Heart, Settings, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/account', label: 'My Profile', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?redirect=/account');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* User info */}
            <div className="p-5 bg-green-600 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg mb-3">
                {user?.firstName[0]}
              </div>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-green-200 text-xs mt-0.5">{user?.email}</p>
            </div>
            <nav className="p-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    pathname === href ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon size={18} />
                  {label}
                  {pathname === href && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
