'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Search, User, Menu, X, Heart, ChevronDown,
  Phone, Mail, LogOut, Package, MapPin, Settings,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useCategories } from '@/hooks/useCategories';
import { useProductSearch } from '@/hooks/useProducts';
import { formatPrice, cn } from '@/lib/utils';
import Image from 'next/image';

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, toggleCart } = useCartStore();
  const { data: categoriesData } = useCategories();
  const { data: searchResults } = useProductSearch(query);

  const categories = categoriesData?.data ?? [];
  const itemCount = cart?.itemCount ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> +233 302 123 456</span>
            <span className="flex items-center gap-1"><Mail size={12} /> info@gadtech.com</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Free delivery on orders over GHS 500</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/Gad logo.jpeg" alt="GadTech" width={180} height={56} className="h-14 w-auto object-contain" priority />
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsSearchOpen(true); }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search products, brands and categories..."
              className="w-full border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-gray-50"
            />
            <button type="submit" className="bg-green-600 text-white px-5 rounded-r-lg hover:bg-green-700 transition-colors">
              <Search size={18} />
            </button>
          </form>

          {/* Search dropdown */}
          {isSearchOpen && query.length >= 2 && searchResults?.data && searchResults.data.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
              {searchResults.data.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={() => { setQuery(''); setIsSearchOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {p.images[0] && (
                    <Image src={p.images[0].url} alt={p.name} width={40} height={40} className="rounded-md object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-green-600 font-semibold">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
              <button
                onClick={() => { router.push(`/products?search=${query}`); setQuery(''); setIsSearchOpen(false); }}
                className="w-full text-center text-sm text-green-600 py-3 border-t hover:bg-green-50 font-medium"
              >
                See all results for "{query}"
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Wishlist */}
          {isAuthenticated && (
            <Link href="/account/wishlist" className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Heart size={22} className="text-gray-700" />
            </Link>
          )}

          {/* User */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User size={22} className="text-gray-700" />
              {isAuthenticated && (
                <span className="text-sm font-medium text-gray-700 hidden lg:block">{user?.firstName}</span>
              )}
              <ChevronDown size={14} className={cn("text-gray-500 transition-transform hidden lg:block", isUserMenuOpen && "rotate-180")} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b">
                      <p className="font-semibold text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <User size={15} /> My Profile
                    </Link>
                    <Link href="/account/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Package size={15} /> My Orders
                    </Link>
                    <Link href="/account/addresses" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <MapPin size={15} /> Addresses
                    </Link>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-green-600 font-medium">
                        <Settings size={15} /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t mt-1 pt-1">
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 w-full text-left">
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 font-medium">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <div className="relative">
              <ShoppingCart size={22} className="text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-4.5 px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[10px] text-gray-500">Cart</p>
              <p className="text-sm font-semibold text-gray-900">{formatPrice(cart?.total ?? 0)}</p>
            </div>
          </button>

          {/* Mobile menu */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Category nav */}
      <nav className="border-t border-gray-100 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1">
            <li>
              <Link href="/products" className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                <Menu size={16} /> All Categories
              </Link>
            </li>
            {categories.slice(0, 7).map((cat) => (
              <li key={cat.id} className="group relative">
                <Link
                  href={`/products?categoryId=${cat.id}`}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  {cat.name}
                  {cat.children && cat.children.length > 0 && <ChevronDown size={14} />}
                </Link>
                {cat.children && cat.children.length > 0 && (
                  <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-xl border border-gray-100 rounded-xl py-2 min-w-50 z-50">
                    {cat.children.map((child) => (
                      <Link key={child.id} href={`/products?categoryId=${child.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-gray-50">
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li className="ml-auto">
              <Link href="/products?isBestSeller=true" className="px-4 py-3 text-sm font-medium text-green-600 hover:text-green-700">🔥 Best Sellers</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`} onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 border-b border-gray-50">
                {cat.name}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="pt-3 flex gap-3">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium">Login</Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2.5 border border-green-600 text-green-600 rounded-lg text-sm font-medium">Register</Link>
              </div>
            ) : (
              <div className="pt-3 flex gap-3">
                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2.5 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium">My Account</Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex-1 py-2.5 border border-green-600 text-green-600 rounded-lg text-sm font-medium">Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
