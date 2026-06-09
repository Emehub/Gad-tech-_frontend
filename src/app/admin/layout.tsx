'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  Image, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') { router.push('/'); }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) return null;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <img src="/Gad logo.jpeg" alt="GadTech" className="h-8 w-auto object-contain rounded" />
          <div>
            <p className="font-bold text-white text-sm">Admin Panel</p>
            <p className="text-[10px] text-gray-400">Management Console</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active ? "bg-green-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon size={18} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">
            {user?.firstName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button onClick={() => { logout(); router.push('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="w-56 bg-gray-900 hidden lg:flex flex-col shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-gray-900 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-gray-900 text-lg flex-1">
            {navItems.find((n) => (n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)))?.label ?? 'Admin'}
          </h1>
          <Link href="/" className="text-sm text-gray-500 hover:text-green-600 font-medium">← View Store</Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
