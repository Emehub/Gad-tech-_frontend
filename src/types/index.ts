// ─── Auth & User ──────────────────────────────────────────────────────────────

export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
  _count?: { orders: number; reviews: number; wishlist: number };
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  country: string;
  isDefault: boolean;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock: number;
}

export interface ProductSpec {
  id: string;
  key: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  brand?: Pick<Brand, 'id' | 'name' | 'logo'>;
  images: ProductImage[];
  variants?: ProductVariant[];
  specs?: ProductSpec[];
  related?: Product[];
  createdAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'comparePrice' | 'stock' | 'images'>;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  couponCode?: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  notes?: string;
  trackingNumber?: string;
  items: OrderItem[];
  address?: Address;
  createdAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  isVerified: boolean;
  createdAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  position: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
