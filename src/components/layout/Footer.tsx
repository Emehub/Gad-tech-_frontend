'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const SocialIcons = [
  { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
  { label: 'X', path: 'M4 4l16 16M20 4 4 20' },
  { label: 'Instagram', path: 'M16 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0zM17.5 6.5h.01M2 8c0-2.761 2.239-5 5-5h8c2.761 0 5 2.239 5 5v8c0 2.761-2.239 5-5 5H7c-2.761 0-5-2.239-5-5V8z' },
  { label: 'YouTube', path: 'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Newsletter bar */}
      <div className="bg-green-600">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-lg">Subscribe to our newsletter</h3>
            <p className="text-green-100 text-sm">Get exclusive deals and new arrivals directly in your inbox</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-72 px-4 py-2.5 rounded-lg text-gray-900 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="mb-4 inline-block bg-white rounded-xl px-3 py-2">
            <img src="/Gad logo.jpeg" alt="GadTech" className="h-14 w-auto object-contain" />
          </div>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Ghana's premier destination for IT products, electronics, and home appliances. Quality products at the best prices.
          </p>
          <div className="flex gap-3">
            {SocialIcons.map(({ label, path }) => (
              <a key={label} href="#" aria-label={label} className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: 'About Us', href: '/about' },
              { label: 'All Products', href: '/products' },
              { label: 'Best Sellers', href: '/products?isBestSeller=true' },
              { label: 'New Arrivals', href: '/products?isNewArrival=true' },
              { label: 'Deals & Offers', href: '/products?sortBy=comparePrice&sortOrder=desc' },
              { label: 'Contact Us', href: '/contact' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-white font-semibold mb-4">Customer Service</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: 'My Account', href: '/account' },
              { label: 'Track My Order', href: '/account/orders' },
              { label: 'Returns & Refunds', href: '/returns' },
              { label: 'Shipping Policy', href: '/shipping' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Privacy Policy', href: '/privacy' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-green-500 shrink-0 mt-0.5" />
              <span>123 Independence Avenue, Accra, Ghana</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-green-500 shrink-0" />
              <span>+233 302 123 456</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-green-500 shrink-0" />
              <span>info@gadtech.com</span>
            </li>
          </ul>
          <div className="mt-5">
            <p className="text-xs text-gray-500 mb-2">We Accept</p>
            <div className="flex gap-2">
              {['Visa', 'MasterCard', 'MTN', 'Paystack'].map((method) => (
                <span key={method} className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400">{method}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} GadTech Store. All rights reserved.</p>
          <p>Built with ❤️ in Ghana</p>
        </div>
      </div>
    </footer>
  );
}
