// ============================================
// 🏪 LUXURY BOUTIQUE STORE - APP.TSX
// All-in-One: Store, Cart, Checkout, Admin, PWA
// + NEW: Auth System, Profile Upload, Registration
// Stack: React + TypeScript + Framer Motion + Tailwind
// ============================================

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
  useRef,
  type ReactNode,
  type FC,
  type CSSProperties,
  type ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// ================================================================
// ======================== TYPES & INTERFACES ====================
// ================================================================

type Currency = "IRR" | "USD" | "EUR" | "GBP";
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
type PaymentMethod = "stripe" | "zarinpal" | "idpay" | "wallet";
type ThemeMode = "light" | "dark";
type Locale = "fa" | "en";
type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "popular";
type PageView =
  | "home"
  | "products"
  | "product-detail"
  | "cart"
  | "checkout"
  | "wishlist"
  | "orders"
  | "profile"
  | "admin"
  | "search"
  | "about"
  | "blog"
  | "auth";
type MembershipLevel = "bronze" | "silver" | "gold" | "platinum";
type AuthMode = "login" | "register";

interface ProductColor {
  name: string;
  hex: string;
}

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductVariant {
  id: string;
  color: ProductColor;
  size: string;
  stock: number;
  priceAdjustment: number;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: Currency;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  category: string;
  material: string;
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  weight: number;
  sku: string;
}

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
}

interface PromoCode {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  minOrder: number;
  expiresAt: string;
}

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Address[];
  membershipLevel: MembershipLevel;
  loyaltyPoints: number;
  walletBalance: number;
  orders: Order[];
  wishlist: string[];
  recentlyViewed: string[];
  createdAt: string;
  bio?: string;
}

interface AuthUser {
  email: string;
  password: string;
  profileId: string;
}

interface FilterState {
  category: string;
  brands: string[];
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
}

interface AppState {
  theme: ThemeMode;
  locale: Locale;
  currentPage: PageView;
  selectedProductId: string | null;
  cartOpen: boolean;
  searchOpen: boolean;
  filterOpen: boolean;
  userLoggedIn: boolean;
  previousPage: PageView;
}

// ================================================================
// ======================== MOCK DATA =============================
// ================================================================

const PROMO_CODES: PromoCode[] = [
  {
    code: "WELCOME20",
    discount: 20,
    type: "percentage",
    minOrder: 100,
    expiresAt: "2027-12-31",
  },
  {
    code: "SAVE50",
    discount: 50,
    type: "fixed",
    minOrder: 200,
    expiresAt: "2027-06-30",
  },
];

const CATEGORIES = [
  "All",
  "Dresses",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Bags",
  "Accessories",
];

const BRANDS = [
  "Maison Noir",
  "Atelier Luxe",
  "Casa Bella",
  "Étoile",
  "Velvet & Stone",
  "Silhouette",
];

const DEFAULT_AVATAR =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f59e0b"/><text x="50" y="62" font-size="40" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">?</text></svg>'
  );

const generateReviews = (count: number): Review[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `rev-${i}`,
    userId: `user-${i}`,
    userName: [
      "سارا احمدی",
      "Sarah Miller",
      "علی رضایی",
      "Emma Wilson",
      "مریم حسینی",
    ][i % 5],
    avatar: `https://i.pravatar.cc/40?img=${i + 1}`,
    rating: Math.floor(Math.random() * 2) + 4,
    comment: [
      "کیفیت فوق‌العاده! دقیقاً مثل عکس بود. بسته‌بندی هم عالی بود.",
      "Absolutely stunning piece. The fabric feels luxurious.",
      "بسیار شیک و با کیفیت. حتماً دوباره خرید می‌کنم.",
      "Perfect fit and amazing quality. Worth every penny.",
      "رنگ و جنس پارچه بی‌نظیره. خیلی راضیم.",
    ][i % 5],
    date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    helpful: Math.floor(Math.random() * 50),
  }));

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    slug: "silk-midi-dress-noir",
    name: "Silk Midi Dress",
    brand: "Maison Noir",
    description:
      "A timeless silk midi dress crafted from 100% mulberry silk. Features a flattering A-line silhouette with delicate draping and a hidden side zipper. Perfect for evening occasions or elevated everyday styling.",
    price: 289,
    originalPrice: 420,
    currency: "USD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
        alt: "Silk Midi Dress - Front",
      },
      {
        url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop",
        alt: "Silk Midi Dress - Back",
      },
      {
        url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop",
        alt: "Silk Midi Dress - Detail",
      },
    ],
    colors: [
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Champagne", hex: "#F7E7CE" },
      { name: "Burgundy", hex: "#800020" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [],
    category: "Dresses",
    material: "100% Mulberry Silk",
    tags: ["silk", "midi", "evening", "luxury"],
    isFeatured: true,
    isNew: true,
    stock: 15,
    rating: 4.8,
    reviewCount: 47,
    reviews: generateReviews(5),
    weight: 0.4,
    sku: "MN-SD-001",
  },
  {
    id: "prod-002",
    slug: "cashmere-overcoat",
    name: "Cashmere Overcoat",
    brand: "Atelier Luxe",
    description:
      "Handcrafted Italian cashmere overcoat with a relaxed fit. Double-breasted design with horn buttons and fully lined interior.",
    price: 895,
    originalPrice: 1200,
    currency: "USD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&h=800&fit=crop",
        alt: "Cashmere Overcoat",
      },
      {
        url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop",
        alt: "Cashmere Overcoat Detail",
      },
    ],
    colors: [
      { name: "Camel", hex: "#C19A6B" },
      { name: "Charcoal", hex: "#36454F" },
      { name: "Ivory", hex: "#FFFFF0" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    variants: [],
    category: "Outerwear",
    material: "100% Italian Cashmere",
    tags: ["cashmere", "overcoat", "winter", "luxury"],
    isFeatured: true,
    isNew: false,
    stock: 8,
    rating: 4.9,
    reviewCount: 32,
    reviews: generateReviews(4),
    weight: 1.2,
    sku: "AL-CO-002",
  },
  {
    id: "prod-003",
    slug: "leather-crossbody-bag",
    name: "Leather Crossbody Bag",
    brand: "Casa Bella",
    description:
      "Hand-stitched Italian leather crossbody bag with adjustable strap. Features gold-tone hardware and suede-lined interior.",
    price: 345,
    currency: "USD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
        alt: "Leather Crossbody Bag",
      },
      {
        url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop",
        alt: "Leather Crossbody Bag Open",
      },
    ],
    colors: [
      { name: "Tan", hex: "#D2B48C" },
      { name: "Black", hex: "#000000" },
      { name: "Forest", hex: "#228B22" },
    ],
    sizes: ["One Size"],
    variants: [],
    category: "Bags",
    material: "Italian Full-Grain Leather",
    tags: ["leather", "crossbody", "bag", "handmade"],
    isFeatured: false,
    isNew: true,
    stock: 22,
    rating: 4.7,
    reviewCount: 65,
    reviews: generateReviews(3),
    weight: 0.6,
    sku: "CB-LB-003",
  },
  {
    id: "prod-004",
    slug: "satin-blouse-etoile",
    name: "Satin Blouse",
    brand: "Étoile",
    description:
      "Elegant satin blouse with a relaxed fit and French cuffs. Perfect for transitioning from office to evening.",
    price: 175,
    originalPrice: 240,
    currency: "USD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop",
        alt: "Satin Blouse",
      },
      {
        url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=800&fit=crop",
        alt: "Satin Blouse Styled",
      },
    ],
    colors: [
      { name: "Pearl", hex: "#F0EAD6" },
      { name: "Blush", hex: "#DE5D83" },
      { name: "Navy", hex: "#000080" },
    ],
    sizes: ["XS", "S", "M", "L"],
    variants: [],
    category: "Tops",
    material: "Silk Satin Blend",
    tags: ["satin", "blouse", "office", "elegant"],
    isFeatured: true,
    isNew: false,
    stock: 30,
    rating: 4.6,
    reviewCount: 28,
    reviews: generateReviews(3),
    weight: 0.2,
    sku: "ET-SB-004",
  },
  {
    id: "prod-005",
    slug: "tailored-wool-trousers",
    name: "Tailored Wool Trousers",
    brand: "Silhouette",
    description:
      "Impeccably tailored wide-leg trousers in virgin wool. High-waisted with pressed creases for a polished silhouette.",
    price: 225,
    currency: "USD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
        alt: "Wool Trousers",
      },
      {
        url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=800&fit=crop",
        alt: "Wool Trousers Detail",
      },
    ],
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Cream", hex: "#FFFDD0" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [],
    category: "Bottoms",
    material: "Virgin Wool",
    tags: ["wool", "trousers", "tailored", "wide-leg"],
    isFeatured: false,
    isNew: true,
    stock: 18,
    rating: 4.5,
    reviewCount: 19,
    reviews: generateReviews(2),
    weight: 0.5,
    sku: "SI-WT-005",
  },
  {
    id: "prod-006",
    slug: "velvet-evening-gown",
    name: "Velvet Evening Gown",
    brand: "Velvet & Stone",
    description:
      "Floor-length velvet gown with a dramatic cowl neckline and open back. A showstopping piece for galas and red carpets.",
    price: 650,
    originalPrice: 890,
    currency: "USD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop",
        alt: "Velvet Evening Gown",
      },
      {
        url: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600&h=800&fit=crop",
        alt: "Velvet Gown Detail",
      },
    ],
    colors: [
      { name: "Emerald", hex: "#50C878" },
      { name: "Midnight", hex: "#191970" },
      { name: "Ruby", hex: "#E0115F" },
    ],
    sizes: ["XS", "S", "M", "L"],
    variants: [],
    category: "Dresses",
    material: "Silk Velvet",
    tags: ["velvet", "gown", "evening", "formal"],
    isFeatured: true,
    isNew: false,
    stock: 5,
    rating: 4.9,
    reviewCount: 41,
    reviews: generateReviews(4),
    weight: 0.8,
    sku: "VS-EG-006",
  },
  {
    id: "prod-007",
    slug: "suede-ankle-boots",
    name: "Suede Ankle Boots",
    brand: "Casa Bella",
    description:
      "Italian suede ankle boots with a sculpted 70mm heel. Side zip closure and leather sole.",
    price: 395,
    currency: "USD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop",
        alt: "Suede Ankle Boots",
      },
    ],
    colors: [
      { name: "Sand", hex: "#C2B280" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["36", "37", "38", "39", "40", "41"],
    variants: [],
    category: "Shoes",
    material: "Italian Suede",
    tags: ["suede", "boots", "ankle", "italian"],
    isFeatured: false,
    isNew: true,
    stock: 12,
    rating: 4.4,
    reviewCount: 23,
    reviews: generateReviews(3),
    weight: 0.9,
    sku: "CB-AB-007",
  },
  {
    id: "prod-008",
    slug: "gold-chain-necklace",
    name: "Gold Chain Necklace",
    brand: "Étoile",
    description:
      "18K gold-plated chain necklace with a minimalist pendant. Hypoallergenic and tarnish-resistant.",
    price: 128,
    originalPrice: 160,
    currency: "USD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop",
        alt: "Gold Chain Necklace",
      },
    ],
    colors: [
      { name: "Gold", hex: "#FFD700" },
      { name: "Rose Gold", hex: "#B76E79" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
    sizes: ["One Size"],
    variants: [],
    category: "Accessories",
    material: "18K Gold Plated Brass",
    tags: ["gold", "necklace", "jewelry", "minimalist"],
    isFeatured: false,
    isNew: false,
    stock: 45,
    rating: 4.7,
    reviewCount: 89,
    reviews: generateReviews(5),
    weight: 0.05,
    sku: "ET-GN-008",
  },
];

// Generate variants for each product
MOCK_PRODUCTS.forEach((p) => {
  p.variants = p.colors.flatMap((color) =>
    p.sizes.map((size, si) => ({
      id: `${p.id}-${color.name}-${size}`,
      color,
      size,
      stock: Math.max(0, Math.floor(Math.random() * 10)),
      priceAdjustment: 0,
    }))
  );
});

// ================================================================
// ======================== AUTH STORAGE ==========================
// ================================================================

interface StoredAuth {
  users: AuthUser[];
  profiles: Record<string, UserProfile>;
  currentUserId: string | null;
}

const DEFAULT_AUTH: StoredAuth = {
  users: [],
  profiles: {},
  currentUserId: null,
};

const createEmptyProfile = (
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string
): UserProfile => ({
  id,
  firstName,
  lastName,
  email,
  phone,
  avatar: DEFAULT_AVATAR,
  addresses: [],
  membershipLevel: "bronze",
  loyaltyPoints: 0,
  walletBalance: 0,
  orders: [],
  wishlist: [],
  recentlyViewed: [],
  createdAt: new Date().toISOString(),
  bio: "",
});

const loadAuth = (): StoredAuth => {
  try {
    const raw = localStorage.getItem("boutique-auth");
    if (!raw) return DEFAULT_AUTH;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AUTH;
  }
};

const saveAuth = (auth: StoredAuth): void => {
  try {
    localStorage.setItem("boutique-auth", JSON.stringify(auth));
  } catch {
    /* ignore quota errors */
  }
};

// ================================================================
// ======================== CONTEXTS ==============================
// ================================================================

interface StoreContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  toast: (message: string, type?: "success" | "error" | "info") => void;
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  // Auth methods
  register: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string
  ) => { success: boolean; message: string };
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  uploadAvatar: (dataUrl: string) => void;
  requireAuth: (callback: () => void) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const useStore = (): StoreContextType => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};

// ================================================================
// ======================== UTILITY FUNCTIONS =====================
// ================================================================

const formatPrice = (price: number, currency: Currency = "USD"): string => {
  if (currency === "IRR") {
    return `${(price * 42000).toLocaleString("fa-IR")} تومان`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `$${price}`;
  }
};

const calculateDiscount = (
  price: number,
  original?: number
): number => {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};

const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(" ");

const getMembershipColor = (level: MembershipLevel): string => {
  const colors: Record<MembershipLevel, string> = {
    bronze: "from-amber-700 to-amber-900",
    silver: "from-gray-400 to-gray-600",
    gold: "from-yellow-400 to-amber-500",
    platinum: "from-gray-200 to-gray-400",
  };
  return colors[level];
};

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone: string): boolean =>
  /^[+\d\s()-]{7,20}$/.test(phone);

// ================================================================
// ======================== SVG ICONS =============================
// ================================================================

const Icons = {
  Heart: ({
    filled = false,
    className = "w-5 h-5",
  }: {
    filled?: boolean;
    className?: string;
  }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Cart: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  Search: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  User: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  Star: ({
    filled = false,
    className = "w-4 h-4",
  }: {
    filled?: boolean;
    className?: string;
  }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  X: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  ChevronDown: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  ChevronLeft: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  ChevronRight: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  Menu: ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  ),
  Sun: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  Moon: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Minus: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M5 12h14" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Filter: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  ),
  Grid: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  Eye: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Package: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  ),
  Truck: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  CreditCard: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <path d="M1 10h22" />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  BarChart: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  ),
  ZoomIn: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
    </svg>
  ),
  Share: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  ),
  Camera: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Logout: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Mail: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
  Lock: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  Phone: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  Upload: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
};

// ================================================================
// ======================== TOAST SYSTEM ==========================
// ================================================================

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const ToastContainer: FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          className={cn(
            "px-6 py-4 rounded-xl shadow-2xl text-white font-medium text-sm flex items-center gap-3 min-w-[280px] backdrop-blur-sm",
            t.type === "success" && "bg-emerald-600/95",
            t.type === "error" && "bg-red-600/95",
            t.type === "info" && "bg-blue-600/95"
          )}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100">
            <Icons.X className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ================================================================
// ======================== AUTH PAGE (NEW) =======================
// ================================================================

const AuthPage: FC = () => {
  const { state, setState, register, login, toast } = useStore();
  const isDark = state.theme === "dark";
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (mode === "register") {
      if (!form.firstName.trim()) newErrors.firstName = "First name is required";
      if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!validatePhone(form.phone)) newErrors.phone = "Invalid phone number";
      if (form.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }
    if (!validateEmail(form.email)) newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    setTimeout(() => {
      if (mode === "register") {
        const result = register(
          form.firstName,
          form.lastName,
          form.email,
          form.phone,
          form.password
        );
        if (result.success) {
          toast(`Welcome ${form.firstName}! 🎉`, "success");
          setState((s) => ({ ...s, currentPage: s.previousPage || "home" }));
        } else {
          toast(result.message, "error");
        }
      } else {
        const result = login(form.email, form.password);
        if (result.success) {
          toast("Welcome back! 👋", "success");
          setState((s) => ({ ...s, currentPage: s.previousPage || "home" }));
        } else {
          toast(result.message, "error");
        }
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div
      className={cn(
        "min-h-screen pt-24 pb-16 flex items-center justify-center",
        isDark ? "bg-gray-950" : "bg-gradient-to-br from-amber-50 via-white to-rose-50"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-md mx-4 rounded-3xl overflow-hidden shadow-2xl",
          isDark ? "bg-gray-900" : "bg-white"
        )}
      >
        {/* Header */}
        <div className="relative p-8 pb-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10" />
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
            >
              <Icons.User className="w-8 h-8 text-white" />
            </motion.div>
            <h1
              className={cn(
                "text-2xl font-light tracking-wide mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p
              className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              {mode === "login"
                ? "Sign in to access your boutique"
                : "Join our exclusive community"}
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div
          className={cn(
            "mx-8 mb-6 p-1 rounded-xl flex gap-1",
            isDark ? "bg-gray-800" : "bg-gray-100"
          )}
        >
          {(["login", "register"] as const).map((m) => (
            <motion.button
              key={m}
              onClick={() => {
                setMode(m);
                setErrors({});
              }}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize",
                mode === m
                  ? isDark
                    ? "bg-gray-700 text-white shadow"
                    : "bg-white text-gray-900 shadow"
                  : isDark
                    ? "text-gray-400"
                    : "text-gray-500"
              )}
              whileTap={{ scale: 0.97 }}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </motion.button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className={cn(
                        "text-xs font-medium mb-1.5 block",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      First Name
                    </label>
                    <input
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      placeholder="John"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all",
                        errors.firstName
                          ? "border-red-500"
                          : isDark
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                            : "border-gray-300 placeholder-gray-400"
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className={cn(
                        "text-xs font-medium mb-1.5 block",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Last Name
                    </label>
                    <input
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      placeholder="Doe"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all",
                        errors.lastName
                          ? "border-red-500"
                          : isDark
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                            : "border-gray-300 placeholder-gray-400"
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    className={cn(
                      "text-xs font-medium mb-1.5 block",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Icons.Phone
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                        isDark ? "text-gray-500" : "text-gray-400"
                      )}
                    />
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+1 234 567 8900"
                      type="tel"
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all",
                        errors.phone
                          ? "border-red-500"
                          : isDark
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                            : "border-gray-300 placeholder-gray-400"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label
              className={cn(
                "text-xs font-medium mb-1.5 block",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Email Address
            </label>
            <div className="relative">
              <Icons.Mail
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                  isDark ? "text-gray-500" : "text-gray-400"
                )}
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                type="email"
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all",
                  errors.email
                    ? "border-red-500"
                    : isDark
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                      : "border-gray-300 placeholder-gray-400"
                )}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              className={cn(
                "text-xs font-medium mb-1.5 block",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Password
            </label>
            <div className="relative">
              <Icons.Lock
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                  isDark ? "text-gray-500" : "text-gray-400"
                )}
              />
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                className={cn(
                  "w-full pl-10 pr-12 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all",
                  errors.password
                    ? "border-red-500"
                    : isDark
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                      : "border-gray-300 placeholder-gray-400"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {mode === "register" && (
            <div>
              <label
                className={cn(
                  "text-xs font-medium mb-1.5 block",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Icons.Lock
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                    isDark ? "text-gray-500" : "text-gray-400"
                  )}
                />
                <input
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all",
                    errors.confirmPassword
                      ? "border-red-500"
                      : isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "border-gray-300 placeholder-gray-400"
                  )}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-amber-500" />
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-amber-500 font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3.5 rounded-xl text-sm font-semibold tracking-wider uppercase hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </motion.button>

          {mode === "register" && (
            <p
              className={cn(
                "text-[11px] text-center leading-relaxed",
                isDark ? "text-gray-500" : "text-gray-400"
              )}
            >
              By signing up, you agree to our{" "}
              <button className="text-amber-500 hover:underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-amber-500 hover:underline">
                Privacy Policy
              </button>
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
};

// ================================================================
// ======================== HEADER COMPONENT ======================
// ================================================================

const Header: FC = () => {
  const { state, setState, cartCount, user, logout, toast } = useStore();
  const isDark = state.theme === "dark";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems: { label: string; page: PageView }[] = [
    { label: "Home", page: "home" },
    { label: "Shop", page: "products" },
    { label: "About", page: "about" },
    { label: "Blog", page: "blog" },
  ];

  const handleUserClick = () => {
    if (user) {
      setState((s) => ({ ...s, currentPage: "profile", previousPage: s.currentPage }));
    } else {
      setState((s) => ({ ...s, currentPage: "auth", previousPage: s.currentPage }));
    }
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? isDark
              ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/20"
              : "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5"
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "lg:hidden p-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {mobileMenuOpen ? <Icons.X className="w-6 h-6" /> : <Icons.Menu />}
            </button>

            {/* Logo */}
            <motion.button
              onClick={() =>
                setState((s) => ({ ...s, currentPage: "home" }))
              }
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <span
                className={cn(
                  "text-2xl font-light tracking-[0.3em] uppercase",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Boutique
              </span>
              <span className="text-amber-500 text-xs tracking-widest">
                LUXE
              </span>
            </motion.button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <motion.button
                  key={item.page}
                  onClick={() =>
                    setState((s) => ({ ...s, currentPage: item.page }))
                  }
                  className={cn(
                    "text-sm font-medium tracking-wider uppercase transition-colors relative",
                    state.currentPage === item.page
                      ? "text-amber-500"
                      : isDark
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                  )}
                  whileHover={{ y: -1 }}
                >
                  {item.label}
                  {state.currentPage === item.page && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500"
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setState((s) => ({ ...s, searchOpen: true }))}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDark
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icons.Search />
              </motion.button>

              <motion.button
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    theme: isDark ? "light" : "dark",
                  }))
                }
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDark
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isDark ? <Icons.Sun /> : <Icons.Moon />}
              </motion.button>

              {/* User Avatar / Login Button */}
              <div className="relative">
                <motion.button
                  onClick={handleUserClick}
                  className={cn(
                    "flex items-center gap-2 p-1 rounded-full transition-colors",
                    isDark
                      ? "hover:bg-white/10"
                      : "hover:bg-gray-100"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user ? (
                    <>
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/50"
                      />
                      <span
                        className={cn(
                          "hidden sm:block text-sm font-medium pr-2",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {user.firstName}
                      </span>
                    </>
                  ) : (
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        isDark
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <Icons.User />
                    </div>
                  )}
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {user && userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden z-50",
                        isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
                      )}
                    >
                      <div className={cn("p-4 border-b", isDark ? "border-gray-800" : "border-gray-100")}>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p className={cn("text-xs truncate", isDark ? "text-gray-400" : "text-gray-500")}>
                          {user.email}
                        </p>
                      </div>
                      <div className="p-2">
                        {[
                          { label: "My Profile", icon: <Icons.User className="w-4 h-4" />, action: () => setState((s) => ({ ...s, currentPage: "profile" })) },
                          { label: "My Orders", icon: <Icons.Package className="w-4 h-4" />, action: () => setState((s) => ({ ...s, currentPage: "profile" })) },
                          { label: "Wishlist", icon: <Icons.Heart className="w-4 h-4" />, action: () => setState((s) => ({ ...s, currentPage: "profile" })) },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              item.action();
                              setUserMenuOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                              isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            logout();
                            toast("Logged out successfully", "info");
                            setUserMenuOpen(false);
                            setState((s) => ({ ...s, currentPage: "home" }));
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                        >
                          <Icons.Logout className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={() => setState((s) => ({ ...s, cartOpen: true }))}
                className={cn(
                  "p-2 rounded-full transition-colors relative",
                  isDark
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icons.Cart />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className={cn(
                "w-80 h-full p-8",
                isDark ? "bg-gray-900" : "bg-white"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-6 mt-12">
                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => {
                      setState((s) => ({ ...s, currentPage: item.page }));
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "text-lg font-medium tracking-wider text-left",
                      isDark ? "text-gray-200" : "text-gray-800"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ================================================================
// ======================== HERO SECTION ==========================
// ================================================================

const HeroSection: FC = () => {
  const { setState, state } = useStore();
  const isDark = state.theme === "dark";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Autumn Collection",
      subtitle: "2026",
      description: "Discover timeless elegance redefined for the modern era",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8uv6ejeytRRGehWtAN2iLUC5sRXO5jD4HeknJtnAcCw&s=10",
      cta: "Explore Collection",
    },
    {
      title: "Evening Luxe",
      subtitle: "Exclusive",
      description: "Handcrafted pieces for unforgettable moments",
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop",
      cta: "Shop Now",
    },
    {
      title: "New Arrivals",
      subtitle: "Just In",
      description: "The latest additions to our curated selection",
      image:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&h=900&fit=crop",
      cta: "View All",
    },
  ];

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((p) => (p + 1) % slides.length),
      6000
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl"
            >
              <motion.p className="text-amber-400 text-sm tracking-[0.4em] uppercase mb-4 font-medium">
                {slides[currentSlide].subtitle}
              </motion.p>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light text-white mb-6 leading-[0.95] tracking-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-gray-300 text-lg mb-10 max-w-md leading-relaxed">
                {slides[currentSlide].description}
              </p>
              <motion.button
                onClick={() =>
                  setState((s) => ({ ...s, currentPage: "products" }))
                }
                className="bg-white text-gray-900 px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-amber-400 transition-colors duration-300"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {slides[currentSlide].cta}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === currentSlide ? "w-12 bg-amber-400" : "w-6 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  );
};

// ================================================================
// ======================== PRODUCT CARD ==========================
// ================================================================

const ProductCard: FC<{ product: Product }> = ({ product }) => {
  const { state, setState, addToCart, user, setUser, toast, requireAuth } = useStore();
  const isDark = state.theme === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const discount = calculateDiscount(product.price, product.originalPrice);
  const inWishlist = user?.wishlist.includes(product.id) ?? false;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowQuickAdd(true);
      return;
    }
    const variant = product.variants.find(
      (v) => v.color.name === selectedColor.name && v.size === selectedSize
    );
    if (variant) {
      addToCart({
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
        product,
        selectedColor,
        selectedSize,
      });
      toast(`${product.name} added to cart`, "success");
      setShowQuickAdd(false);
    }
  };

  const toggleWishlist = () => {
    requireAuth(() => {
      if (!user) return;
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          wishlist: inWishlist
            ? prev.wishlist.filter((id) => id !== product.id)
            : [...prev.wishlist, product.id],
        };
      });
      toast(
        inWishlist ? "Removed from wishlist" : "Added to wishlist",
        "info"
      );
    });
  };

  return (
    <motion.div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer"
        onClick={() => {
          setState((s) => ({
            ...s,
            currentPage: "product-detail",
            selectedProductId: product.id,
          }));
        }}
      >
        <motion.img
          src={product.images[0].url}
          alt={product.images[0].alt}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1, opacity: isHovered ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        />
        {product.images[1] && (
          <motion.img
            src={product.images[1].url}
            alt={product.images[1].alt}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNew && (
            <span className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          className={cn(
            "absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all",
            inWishlist
              ? "bg-red-500 text-white"
              : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white"
          )}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
        >
          <Icons.Heart filled={inWishlist} className="w-4 h-4" />
        </motion.button>

        {/* Quick Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-3 left-3 right-3 z-10"
            >
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                className="w-full bg-white/95 backdrop-blur-sm text-gray-900 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase hover:bg-amber-400 transition-colors shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showQuickAdd ? "Select Size" : "Quick Add"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-2 px-1">
        <p
          className={cn(
            "text-xs tracking-[0.15em] uppercase",
            isDark ? "text-gray-500" : "text-gray-400"
          )}
        >
          {product.brand}
        </p>
        <h3
          className={cn(
            "font-medium text-sm",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Icons.Star
              key={i}
              filled={i < Math.round(product.rating)}
              className={cn(
                "w-3 h-3",
                i < Math.round(product.rating)
                  ? "text-amber-400"
                  : isDark
                    ? "text-gray-600"
                    : "text-gray-300"
              )}
            />
          ))}
          <span
            className={cn(
              "text-xs ml-1",
              isDark ? "text-gray-500" : "text-gray-400"
            )}
          >
            ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {formatPrice(product.price, product.currency)}
          </span>
          {product.originalPrice && (
            <span className="text-sm line-through text-gray-400">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        <div className="flex items-center gap-2 pt-1">
          {product.colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "w-5 h-5 rounded-full border-2 transition-all",
                selectedColor.name === color.name
                  ? "border-gray-900 scale-110 dark:border-white"
                  : isDark
                    ? "border-gray-600"
                    : "border-gray-300"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Quick Add Size Selector */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "mt-3 p-4 rounded-xl overflow-hidden",
              isDark ? "bg-gray-800" : "bg-gray-50"
            )}
          >
            <p
              className={cn(
                "text-xs font-semibold mb-2",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
            >
              Select Size:
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <motion.button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[36px] h-9 px-3 rounded-lg border text-xs font-medium transition-all",
                    selectedSize === size
                      ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                      : isDark
                        ? "border-gray-600 text-gray-300 hover:border-gray-400"
                        : "border-gray-300 text-gray-700 hover:border-gray-500"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {size}
                </motion.button>
              ))}
            </div>
            {selectedSize && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleAddToCart}
                className="w-full mt-3 bg-amber-500 text-white py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase hover:bg-amber-600 transition-colors"
              >
                Add to Cart
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ================================================================
// ======================== HOME PAGE =============================
// ================================================================

const HomePage: FC = () => {
  const { state, setState } = useStore();
  const isDark = state.theme === "dark";
  const featured = MOCK_PRODUCTS.filter((p) => p.isFeatured);
  const newArrivals = MOCK_PRODUCTS.filter((p) => p.isNew);

  const categories = [
    {
      name: "Dresses",
      image:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
    },
    {
      name: "Outerwear",
      image:
        "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop",
    },
    {
      name: "Bags",
      image:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
    },
    {
      name: "Shoes",
      image:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
    },
  ];

  return (
    <div>
      <HeroSection />

      {/* Categories */}
      <section
        className={cn(
          "py-24",
          isDark ? "bg-gray-950" : "bg-white"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-amber-500 text-sm tracking-[0.3em] uppercase mb-3">
              Curated For You
            </p>
            <h2
              className={cn(
                "text-4xl font-light tracking-tight",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Shop by Category
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() =>
                  setState((s) => ({ ...s, currentPage: "products" }))
                }
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-xl font-medium tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                    Explore <Icons.ChevronRight className="w-4 h-4" />
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        className={cn(
          "py-24",
          isDark ? "bg-gray-900" : "bg-gray-50"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-amber-500 text-sm tracking-[0.3em] uppercase mb-3">
                Handpicked
              </p>
              <h2
                className={cn(
                  "text-4xl font-light tracking-tight",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Featured Pieces
              </h2>
            </div>
            <motion.button
              onClick={() =>
                setState((s) => ({ ...s, currentPage: "products" }))
              }
              className={cn(
                "text-sm font-medium tracking-wider uppercase flex items-center gap-2",
                isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              )}
              whileHover={{ x: 4 }}
            >
              View All <Icons.ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&h=600&fit=crop"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-xl px-4"
          >
            <p className="text-amber-400 text-sm tracking-[0.4em] uppercase mb-4">
              Limited Edition
            </p>
            <h2 className="text-5xl font-light text-white mb-6 tracking-tight">
              The Art of Elegance
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Discover our exclusive collection of handcrafted luxury pieces,
              designed for those who appreciate the finer things in life.
            </p>
            <motion.button
              onClick={() =>
                setState((s) => ({ ...s, currentPage: "products" }))
              }
              className="border-2 border-white text-white px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Discover Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals */}
      <section
        className={cn("py-24", isDark ? "bg-gray-950" : "bg-white")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-amber-500 text-sm tracking-[0.3em] uppercase mb-3">
              Just Landed
            </p>
            <h2
              className={cn(
                "text-4xl font-light tracking-tight",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              New Arrivals
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section
        className={cn("py-24", isDark ? "bg-gray-900" : "bg-gray-50")}
      >
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className={cn(
                "text-3xl font-light mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Join the Inner Circle
            </h2>
            <p
              className={cn(
                "mb-8",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Subscribe for exclusive access to new collections, private sales,
              and style inspiration.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={cn(
                  "flex-1 px-5 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500",
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                )}
              />
              <motion.button
                className="bg-amber-500 text-white px-6 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase hover:bg-amber-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// ================================================================
// ======================== PRODUCT LISTING PAGE ==================
// ================================================================

const ProductsPage: FC = () => {
  const { state, setState } = useStore();
  const isDark = state.theme === "dark";
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);

  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
    return result;
  }, [selectedCategory, sort, priceRange]);

  return (
    <div className={cn("pt-24 pb-16 min-h-screen", isDark ? "bg-gray-950" : "bg-white")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div
          className={cn(
            "flex items-center gap-2 text-sm mb-8",
            isDark ? "text-gray-500" : "text-gray-400"
          )}
        >
          <button
            onClick={() => setState((s) => ({ ...s, currentPage: "home" }))}
            className="hover:text-amber-500 transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <span className={isDark ? "text-white" : "text-gray-900"}>
            Shop
          </span>
        </div>

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1
              className={cn(
                "text-4xl font-light tracking-tight",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Shop All
            </h1>
            <p className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-gray-500")}>
              {filteredProducts.length} products
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm",
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Icons.Filter className="w-4 h-4" /> Filters
            </motion.button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className={cn(
                "px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500",
                isDark
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="hidden md:flex items-center gap-1">
              {([2, 3, 4] as const).map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    gridCols === cols
                      ? "bg-amber-500 text-white"
                      : isDark
                        ? "text-gray-500 hover:text-white"
                        : "text-gray-400 hover:text-gray-900"
                  )}
                >
                  <Icons.Grid className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "rounded-2xl p-6 mb-8 overflow-hidden",
                isDark ? "bg-gray-900" : "bg-gray-50"
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3
                    className={cn(
                      "text-sm font-semibold mb-3",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Price Range
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={1500}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], +e.target.value])
                      }
                      className="w-full accent-amber-500"
                    />
                    <span
                      className={cn(
                        "text-sm w-16 text-right",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      ${priceRange[1]}
                    </span>
                  </div>
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-sm font-semibold mb-3",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Brands
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {BRANDS.map((brand) => (
                      <button
                        key={brand}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                          isDark
                            ? "border-gray-700 text-gray-300 hover:border-amber-500"
                            : "border-gray-300 text-gray-600 hover:border-amber-500"
                        )}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-sm font-semibold mb-3",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Availability
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-amber-500" />
                    <span
                      className={cn(
                        "text-sm",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      In Stock Only
                    </span>
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" className="accent-amber-500" />
                    <span
                      className={cn(
                        "text-sm",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}
                    >
                      On Sale
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <motion.div
          className={cn(
            "grid gap-4 lg:gap-8",
            gridCols === 2 && "grid-cols-2",
            gridCols === 3 && "grid-cols-2 md:grid-cols-3",
            gridCols === 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p
              className={cn(
                "text-xl",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              No products found matching your criteria.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ================================================================
// ==================== PRODUCT DETAIL PAGE =======================
// ================================================================

const ProductDetailPage: FC = () => {
  const { state, setState, addToCart, user, setUser, toast, requireAuth } = useStore();
  const isDark = state.theme === "dark";
  const product = MOCK_PRODUCTS.find(
    (p) => p.id === state.selectedProductId
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    product?.colors[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  if (!product) return null;

  const discount = calculateDiscount(product.price, product.originalPrice);
  const inWishlist = user?.wishlist.includes(product.id) ?? false;

  const handleAdd = () => {
    if (!selectedSize) {
      toast("Please select a size", "error");
      return;
    }
    const variant = product.variants.find(
      (v) =>
        v.color.name === selectedColor?.name && v.size === selectedSize
    );
    if (variant && selectedColor) {
      addToCart({
        productId: product.id,
        variantId: variant.id,
        quantity,
        product,
        selectedColor,
        selectedSize,
      });
      toast(`${product.name} added to cart!`, "success");
    }
  };

  return (
    <div className={cn("pt-24 pb-16 min-h-screen", isDark ? "bg-gray-950" : "bg-white")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className={cn("flex items-center gap-2 text-sm mb-8", isDark ? "text-gray-500" : "text-gray-400")}>
          <button onClick={() => setState((s) => ({ ...s, currentPage: "home" }))} className="hover:text-amber-500">Home</button>
          <span>/</span>
          <button onClick={() => setState((s) => ({ ...s, currentPage: "products" }))} className="hover:text-amber-500">Shop</button>
          <span>/</span>
          <span className={isDark ? "text-white" : "text-gray-900"}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <motion.div
              className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-zoom-in"
              onClick={() => setZoomed(!zoomed)}
              whileHover={{ scale: 1.01 }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full">
                <Icons.ZoomIn className="w-5 h-5 text-gray-700" />
              </div>
            </motion.div>
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "w-20 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all",
                    selectedImage === i ? "border-amber-500" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-amber-500 text-xs tracking-[0.3em] uppercase mb-2">{product.brand}</p>
            <h1 className={cn("text-3xl lg:text-4xl font-light mb-4", isDark ? "text-white" : "text-gray-900")}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icons.Star key={i} filled={i < Math.round(product.rating)} className={cn("w-4 h-4", i < Math.round(product.rating) ? "text-amber-400" : isDark ? "text-gray-600" : "text-gray-300")} />
                ))}
              </div>
              <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8">
              <span className={cn("text-3xl font-light", isDark ? "text-white" : "text-gray-900")}>
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl line-through text-gray-400">{formatPrice(product.originalPrice, product.currency)}</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">-{discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className={cn("text-sm leading-relaxed mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
              {product.description}
            </p>

            {/* Color */}
            <div className="mb-6">
              <p className={cn("text-sm font-semibold mb-3", isDark ? "text-white" : "text-gray-900")}>
                Color: <span className="font-normal text-gray-500">{selectedColor?.name}</span>
              </p>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <motion.button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn("w-10 h-10 rounded-full border-2 transition-all relative", selectedColor?.name === color.name ? "border-gray-900 dark:border-white scale-110" : "border-gray-300")}
                    style={{ backgroundColor: color.hex }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {selectedColor?.name === color.name && (
                      <Icons.Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>Size:</p>
                <button onClick={() => setShowSizeGuide(!showSizeGuide)} className="text-amber-500 text-xs underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "min-w-[48px] h-12 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                      selectedSize === size
                        ? isDark ? "border-white bg-white text-gray-900" : "border-gray-900 bg-gray-900 text-white"
                        : isDark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 text-gray-700 hover:border-gray-500"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className={cn("text-sm font-semibold mb-3", isDark ? "text-white" : "text-gray-900")}>Quantity:</p>
              <div className={cn("inline-flex items-center rounded-xl border overflow-hidden", isDark ? "border-gray-700" : "border-gray-300")}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={cn("p-3", isDark ? "hover:bg-gray-800" : "hover:bg-gray-50")}>
                  <Icons.Minus />
                </button>
                <span className={cn("w-12 text-center font-medium", isDark ? "text-white" : "text-gray-900")}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className={cn("p-3", isDark ? "hover:bg-gray-800" : "hover:bg-gray-50")}>
                  <Icons.Plus />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <motion.button
                onClick={handleAdd}
                className="flex-1 bg-gray-900 text-white py-4 rounded-xl text-sm font-semibold tracking-[0.15em] uppercase hover:bg-amber-500 transition-colors duration-300 dark:bg-white dark:text-gray-900 dark:hover:bg-amber-500 dark:hover:text-white"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Add to Cart — {formatPrice(product.price * quantity, product.currency)}
              </motion.button>
              <motion.button
                onClick={() => {
                  requireAuth(() => {
                    if (!user) return;
                    setUser((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        wishlist: inWishlist ? prev.wishlist.filter((id) => id !== product.id) : [...prev.wishlist, product.id],
                      };
                    });
                  });
                }}
                className={cn("w-14 rounded-xl border-2 flex items-center justify-center transition-all", inWishlist ? "border-red-500 bg-red-50 dark:bg-red-900/20" : isDark ? "border-gray-700 hover:border-gray-500" : "border-gray-300 hover:border-gray-500")}
                whileTap={{ scale: 0.9 }}
              >
                <Icons.Heart filled={inWishlist} className={cn("w-5 h-5", inWishlist ? "text-red-500" : isDark ? "text-gray-400" : "text-gray-600")} />
              </motion.button>
              <motion.button
                className={cn("w-14 rounded-xl border-2 flex items-center justify-center", isDark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-600")}
                whileTap={{ scale: 0.9 }}
              >
                <Icons.Share className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Extra Info */}
            <div className={cn("grid grid-cols-3 gap-4 p-4 rounded-xl", isDark ? "bg-gray-900" : "bg-gray-50")}>
              {[
                { icon: <Icons.Truck className="w-5 h-5" />, label: "Free Shipping", sub: "Orders $150+" },
                { icon: <Icons.Package className="w-5 h-5" />, label: "Easy Returns", sub: "30 days" },
                { icon: <Icons.CreditCard className="w-5 h-5" />, label: "Secure Pay", sub: "SSL Encrypted" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className={cn("flex justify-center mb-1", isDark ? "text-gray-400" : "text-gray-500")}>{item.icon}</div>
                  <p className={cn("text-xs font-semibold", isDark ? "text-white" : "text-gray-900")}>{item.label}</p>
                  <p className={cn("text-[10px]", isDark ? "text-gray-500" : "text-gray-400")}>{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="mt-12">
              <h3 className={cn("text-lg font-semibold mb-6", isDark ? "text-white" : "text-gray-900")}>Reviews ({product.reviewCount})</h3>
              <div className="space-y-6">
                {product.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className={cn("p-5 rounded-xl", isDark ? "bg-gray-900" : "bg-gray-50")}>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={review.avatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{review.userName}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Icons.Star key={i} filled={i < review.rating} className={cn("w-3 h-3", i < review.rating ? "text-amber-400" : "text-gray-300")} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className={cn("text-sm leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-8"
            onClick={() => setZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={product.images[selectedImage].url}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button className="absolute top-6 right-6 text-white"><Icons.X className="w-8 h-8" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ================================================================
// ======================== CART DRAWER ===========================
// ================================================================

const CartDrawer: FC = () => {
  const { state, setState, cart, removeFromCart, updateQuantity, cartTotal, cartCount, appliedPromo, applyPromo, removePromo, toast, user, requireAuth } = useStore();
  const isDark = state.theme === "dark";
  const [promoInput, setPromoInput] = useState("");

  const discountAmount = appliedPromo
    ? appliedPromo.type === "percentage"
      ? cartTotal * (appliedPromo.discount / 100)
      : appliedPromo.discount
    : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleCheckout = () => {
    requireAuth(() => {
      setState((s) => ({ ...s, cartOpen: false, currentPage: "checkout" }));
    });
  };

  return (
    <AnimatePresence>
      {state.cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
          onClick={() => setState((s) => ({ ...s, cartOpen: false }))}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn("absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col shadow-2xl", isDark ? "bg-gray-900" : "bg-white")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn("flex items-center justify-between p-6 border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <h2 className={cn("text-xl font-light tracking-wide", isDark ? "text-white" : "text-gray-900")}>
                Shopping Bag ({cartCount})
              </h2>
              <motion.button
                onClick={() => setState((s) => ({ ...s, cartOpen: false }))}
                className={cn("p-2 rounded-full", isDark ? "hover:bg-gray-800" : "hover:bg-gray-100")}
                whileTap={{ scale: 0.9 }}
              >
                <Icons.X />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <Icons.Cart className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-gray-700" : "text-gray-300")} />
                    <p className={cn("text-lg", isDark ? "text-gray-400" : "text-gray-500")}>Your bag is empty</p>
                    <button
                      onClick={() => { setState((s) => ({ ...s, cartOpen: false, currentPage: "products" })); }}
                      className="mt-4 text-amber-500 text-sm font-medium underline"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50, height: 0 }}
                      className={cn("flex gap-4 p-4 rounded-xl", isDark ? "bg-gray-800/50" : "bg-gray-50")}
                    >
                      <img src={item.product.images[0].url} alt={item.product.name} className="w-24 h-28 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs tracking-wider uppercase", isDark ? "text-gray-500" : "text-gray-400")}>{item.product.brand}</p>
                        <h4 className={cn("text-sm font-medium truncate", isDark ? "text-white" : "text-gray-900")}>{item.product.name}</h4>
                        <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>
                          {item.selectedColor.name} / {item.selectedSize}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className={cn("flex items-center rounded-lg border overflow-hidden", isDark ? "border-gray-700" : "border-gray-200")}>
                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} className="p-1.5"><Icons.Minus className="w-3 h-3" /></button>
                            <span className={cn("w-8 text-center text-xs font-medium", isDark ? "text-white" : "text-gray-900")}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} className="p-1.5"><Icons.Plus className="w-3 h-3" /></button>
                          </div>
                          <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                            {formatPrice(item.product.price * item.quantity, item.product.currency)}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.productId, item.variantId)} className="self-start p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Icons.Trash />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className={cn("p-6 border-t space-y-4", isDark ? "border-gray-800" : "border-gray-200")}>
                {/* Promo */}
                {!appliedPromo ? (
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code"
                      className={cn("flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300")}
                    />
                    <motion.button
                      onClick={() => { if (applyPromo(promoInput)) { toast("Promo applied!", "success"); setPromoInput(""); } else toast("Invalid code", "error"); }}
                      className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium dark:bg-white dark:text-gray-900"
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
                    <span className="text-emerald-600 text-sm font-medium">✓ {appliedPromo.code} applied</span>
                    <button onClick={removePromo} className="text-emerald-600 text-xs underline">Remove</button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>Subtotal</span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>{formatPrice(cartTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-500">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>Shipping</span>
                    <span className="text-emerald-500 font-medium">Free</span>
                  </div>
                  <div className={cn("flex justify-between text-lg font-semibold pt-2 border-t", isDark ? "border-gray-800 text-white" : "border-gray-200 text-gray-900")}>
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleCheckout}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl text-sm font-semibold tracking-[0.15em] uppercase hover:bg-amber-500 transition-colors dark:bg-white dark:text-gray-900"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ================================================================
// ======================== CHECKOUT PAGE =========================
// ================================================================

const CheckoutPage: FC = () => {
  const { state, setState, cart, cartTotal, appliedPromo, toast, user, updateProfile } = useStore();
  const isDark = state.theme === "dark";
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [contactForm, setContactForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    zipCode: "",
    country: "United States",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, currentPage: "auth", previousPage: "checkout" }));
    }
  }, [user, setState]);

  const steps = ["Contact", "Shipping", "Payment", "Review"];

  const discountAmount = appliedPromo
    ? appliedPromo.type === "percentage" ? cartTotal * (appliedPromo.discount / 100) : appliedPromo.discount
    : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  if (!user) return null;

  const handlePlaceOrder = () => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total: finalTotal,
      status: "pending",
      paymentMethod,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        label: "Shipping",
        fullName: `${contactForm.firstName} ${contactForm.lastName}`,
        phone: contactForm.phone,
        street: addressForm.street,
        city: addressForm.city,
        state: "",
        zipCode: addressForm.zipCode,
        country: addressForm.country,
        isDefault: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber: `TRK-${Math.floor(Math.random() * 10000000000)}`,
    };

    updateProfile({
      orders: [newOrder, ...user.orders],
      loyaltyPoints: user.loyaltyPoints + Math.floor(finalTotal),
    });

    toast("Order placed successfully! 🎉", "success");
    setState((s) => ({ ...s, currentPage: "profile" }));
  };

  return (
    <div className={cn("pt-24 pb-16 min-h-screen", isDark ? "bg-gray-950" : "bg-gray-50")}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className={cn("text-3xl font-light mb-8", isDark ? "text-white" : "text-gray-900")}>Checkout</h1>

        {/* Steps */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all", step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : isDark ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-500")}
                  animate={{ scale: step === i + 1 ? 1.1 : 1 }}
                >
                  {step > i + 1 ? <Icons.Check /> : i + 1}
                </motion.div>
                <span className={cn("text-xs", step >= i + 1 ? (isDark ? "text-white" : "text-gray-900") : isDark ? "text-gray-600" : "text-gray-400")}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-3 rounded", step > i + 1 ? "bg-emerald-500" : isDark ? "bg-gray-800" : "bg-gray-200")} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn("p-8 rounded-2xl", isDark ? "bg-gray-900" : "bg-white shadow-sm")}
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className={cn("text-xl font-medium mb-6", isDark ? "text-white" : "text-gray-900")}>Contact Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        value={contactForm.firstName}
                        onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                        placeholder="First Name"
                        className={cn("px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                      />
                      <input
                        value={contactForm.lastName}
                        onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                        placeholder="Last Name"
                        className={cn("px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                      />
                    </div>
                    <input
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="Email"
                      type="email"
                      className={cn("w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                    />
                    <input
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="Phone"
                      type="tel"
                      className={cn("w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                    />
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className={cn("text-xl font-medium mb-6", isDark ? "text-white" : "text-gray-900")}>Shipping Address</h2>
                    <input
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="Street Address"
                      className={cn("w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="City"
                        className={cn("px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                      />
                      <input
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        placeholder="Zip Code"
                        className={cn("px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                      />
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <h2 className={cn("text-xl font-medium mb-6", isDark ? "text-white" : "text-gray-900")}>Payment Method</h2>
                    <div className="space-y-3">
                      {([
                        { id: "stripe" as const, label: "Credit Card (Stripe)", icon: "💳" },
                        { id: "zarinpal" as const, label: "ZarinPal (Iran)", icon: "🇮🇷" },
                        { id: "idpay" as const, label: "IdPay (Iran)", icon: "🏦" },
                        { id: "wallet" as const, label: "Digital Wallet", icon: "👛" },
                      ]).map((pm) => (
                        <motion.button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all", paymentMethod === pm.id ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300")}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-2xl">{pm.icon}</span>
                          <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{pm.label}</span>
                          {paymentMethod === pm.id && <Icons.Check className="w-5 h-5 text-amber-500 ml-auto" />}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <h2 className={cn("text-xl font-medium mb-6", isDark ? "text-white" : "text-gray-900")}>Review Order</h2>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Please review your order before placing it.</p>
                    <div className="mt-6 space-y-3">
                      {cart.map((item) => (
                        <div key={item.variantId} className="flex items-center gap-3">
                          <img src={item.product.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <span className={cn("text-sm flex-1", isDark ? "text-white" : "text-gray-900")}>{item.product.name} × {item.quantity}</span>
                          <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nav */}
                <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
                  {step > 1 && (
                    <motion.button onClick={() => setStep(step - 1)} className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")} whileTap={{ scale: 0.95 }}>← Back</motion.button>
                  )}
                  <motion.button
                    onClick={() => {
                      if (step < 4) setStep(step + 1);
                      else handlePlaceOrder();
                    }}
                    className="ml-auto bg-gray-900 text-white px-8 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase hover:bg-amber-500 transition-colors dark:bg-white dark:text-gray-900"
                    whileTap={{ scale: 0.95 }}
                  >
                    {step === 4 ? "Place Order" : "Continue"}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className={cn("p-6 rounded-2xl sticky top-28", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
              <h3 className={cn("text-sm font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className={isDark ? "text-gray-400" : "text-gray-500"}>Subtotal</span><span className={isDark ? "text-white" : "text-gray-900"}>{formatPrice(cartTotal)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-sm text-emerald-500"><span>Discount</span><span>-{formatPrice(discountAmount)}</span></div>}
                <div className="flex justify-between text-sm"><span className={isDark ? "text-gray-400" : "text-gray-500"}>Shipping</span><span className="text-emerald-500">Free</span></div>
                <div className={cn("flex justify-between font-bold text-lg pt-3 border-t", isDark ? "border-gray-800 text-white" : "border-gray-200 text-gray-900")}><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// ======================== USER PROFILE (NEW) ====================
// ================================================================

const ProfilePage: FC = () => {
  const { state, user, setUser, updateProfile, uploadAvatar, logout, toast } = useStore();
  const isDark = state.theme === "dark";
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "wishlist" | "settings">("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio ?? "",
      });
    }
  }, [user, editing]);

  if (!user) return null;

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast("Please upload an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        // Compress image
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 400;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX) {
              height = (height * MAX) / width;
              width = MAX;
            }
          } else {
            if (height > MAX) {
              width = (width * MAX) / height;
              height = MAX;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          uploadAvatar(compressed);
          toast("Profile photo updated! 📸", "success");
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast("Name is required", "error");
      return;
    }
    if (!validateEmail(editForm.email)) {
      toast("Invalid email", "error");
      return;
    }
    updateProfile({
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      phone: editForm.phone,
      bio: editForm.bio,
    });
    setEditing(false);
    toast("Profile updated successfully!", "success");
  };

  const totalSpent = user.orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className={cn("pt-24 pb-16 min-h-screen", isDark ? "bg-gray-950" : "bg-gray-50")}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile Header with Avatar Upload */}
        <div className={cn("p-8 rounded-2xl mb-8 relative overflow-hidden", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-rose-500/5" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar with Upload */}
            <div className="relative group">
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-amber-500/30 shadow-xl"
              />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center text-white">
                  <Icons.Camera className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-[10px] font-medium">Change Photo</span>
                </div>
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className={cn("text-3xl font-light", isDark ? "text-white" : "text-gray-900")}>
                {user.firstName} {user.lastName}
              </h1>
              <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {user.email}
              </p>
              {user.bio && (
                <p className={cn("text-sm mt-2 italic", isDark ? "text-gray-500" : "text-gray-400")}>
                  "{user.bio}"
                </p>
              )}
              <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start flex-wrap">
                <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r text-white shadow-md", getMembershipColor(user.membershipLevel))}>
                  ✨ {user.membershipLevel.toUpperCase()} MEMBER
                </span>
                <span className={cn("px-3 py-1.5 rounded-full text-xs font-medium", isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700")}>
                  ⭐ {user.loyaltyPoints.toLocaleString()} pts
                </span>
                <span className={cn("px-3 py-1.5 rounded-full text-xs font-medium", isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700")}>
                  💰 ${user.walletBalance}
                </span>
              </div>
            </div>

            <motion.button
              onClick={() => {
                logout();
                toast("Logged out successfully", "info");
              }}
              className={cn(
                "absolute top-4 right-4 p-2.5 rounded-full transition-colors",
                isDark ? "text-gray-400 hover:text-red-400 hover:bg-gray-800" : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
              )}
              whileTap={{ scale: 0.9 }}
              title="Logout"
            >
              <Icons.Logout className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Orders", value: user.orders.length, icon: "📦", color: "from-blue-500 to-indigo-600" },
            { label: "Wishlist", value: user.wishlist.length, icon: "❤️", color: "from-rose-500 to-pink-600" },
            { label: "Total Spent", value: `$${totalSpent}`, icon: "💎", color: "from-emerald-500 to-teal-600" },
            { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" }), icon: "🎖️", color: "from-amber-500 to-orange-600" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("p-5 rounded-2xl", isDark ? "bg-gray-900" : "bg-white shadow-sm")}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>{stat.value}</p>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto">
          {(["overview", "orders", "wishlist", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn("px-6 py-3 rounded-xl text-sm font-medium transition-all capitalize whitespace-nowrap", activeTab === tab ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className={cn("p-6 rounded-2xl", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
                <h3 className={cn("text-lg font-medium mb-4", isDark ? "text-white" : "text-gray-900")}>Recent Activity</h3>
                {user.orders.length === 0 ? (
                  <p className={cn("text-sm text-center py-8", isDark ? "text-gray-500" : "text-gray-400")}>
                    No orders yet. Start shopping! 🛍️
                  </p>
                ) : (
                  <div className="space-y-3">
                    {user.orders.slice(0, 3).map((order) => (
                      <div key={order.id} className={cn("flex items-center justify-between p-4 rounded-xl", isDark ? "bg-gray-800/50" : "bg-gray-50")}>
                        <div>
                          <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{order.id}</p>
                          <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>{formatPrice(order.total)}</p>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full capitalize", order.status === "delivered" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700")}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {user.orders.length === 0 ? (
                <div className={cn("p-12 rounded-2xl text-center", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
                  <Icons.Package className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-gray-700" : "text-gray-300")} />
                  <p className={cn("text-lg", isDark ? "text-gray-400" : "text-gray-500")}>No orders yet</p>
                </div>
              ) : (
                user.orders.map((order) => (
                  <div key={order.id} className={cn("p-6 rounded-2xl", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{order.id}</h3>
                        <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-bold capitalize", order.status === "delivered" ? "bg-emerald-100 text-emerald-700" : order.status === "shipped" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700")}>
                        {order.status}
                      </span>
                    </div>
                    {/* Timeline */}
                    <div className="flex items-center gap-2 mt-4">
                      {(["pending", "processing", "shipped", "delivered"] as OrderStatus[]).map((s, i, arr) => {
                        const currentIdx = arr.indexOf(order.status);
                        const isComplete = i <= currentIdx;
                        return (
                          <React.Fragment key={s}>
                            <div className={cn("w-3 h-3 rounded-full", isComplete ? "bg-emerald-500" : isDark ? "bg-gray-700" : "bg-gray-300")} />
                            {i < arr.length - 1 && <div className={cn("flex-1 h-0.5", isComplete && i < currentIdx ? "bg-emerald-500" : isDark ? "bg-gray-700" : "bg-gray-300")} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>{formatPrice(order.total)}</span>
                      {order.trackingNumber && <span className="text-xs text-amber-500">📦 {order.trackingNumber}</span>}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "wishlist" && (
            <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {user.wishlist.length === 0 ? (
                <div className={cn("p-12 rounded-2xl text-center", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
                  <Icons.Heart className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-gray-700" : "text-gray-300")} />
                  <p className={cn("text-lg", isDark ? "text-gray-400" : "text-gray-500")}>Your wishlist is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
                  {MOCK_PRODUCTS.filter((p) => user.wishlist.includes(p.id)).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("p-8 rounded-2xl space-y-6", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
              <div className="flex items-center justify-between">
                <h2 className={cn("text-xl font-medium", isDark ? "text-white" : "text-gray-900")}>Account Settings</h2>
                {!editing ? (
                  <motion.button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setEditing(false)}
                      className={cn("px-4 py-2 rounded-xl text-sm font-medium border", isDark ? "border-gray-700 text-gray-300" : "border-gray-300 text-gray-700")}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      Save Changes
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Avatar Section */}
              <div>
                <label className={cn("text-xs font-medium mb-2 block", isDark ? "text-gray-400" : "text-gray-500")}>
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icons.Upload className="w-4 h-4" />
                      Upload New Photo
                    </motion.button>
                    <p className={cn("text-xs mt-2", isDark ? "text-gray-500" : "text-gray-400")}>
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-gray-400" : "text-gray-500")}>First Name</label>
                  <input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    disabled={!editing}
                    className={cn("w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                  />
                </div>
                <div>
                  <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-gray-400" : "text-gray-500")}>Last Name</label>
                  <input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    disabled={!editing}
                    className={cn("w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                  />
                </div>
                <div>
                  <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-gray-400" : "text-gray-500")}>Email</label>
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    disabled={!editing}
                    type="email"
                    className={cn("w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                  />
                </div>
                <div>
                  <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-gray-400" : "text-gray-500")}>Phone</label>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    disabled={!editing}
                    type="tel"
                    className={cn("w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60", isDark ? "bg-gray-800 border-gray-700 text-white" : "border-gray-300")}
                  />
                </div>
              </div>

              <div>
                <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-gray-400" : "text-gray-500")}>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  disabled={!editing}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className={cn("w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60 resize-none", isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600" : "border-gray-300 placeholder-gray-400")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ================================================================
// ======================== ADMIN DASHBOARD =======================
// ================================================================

const AdminDashboard: FC = () => {
  const { state } = useStore();
  const isDark = state.theme === "dark";

  const stats = [
    { label: "Total Revenue", value: "$48,392", change: "+12.5%", icon: "💰", color: "from-emerald-500 to-teal-600" },
    { label: "Orders", value: "1,247", change: "+8.2%", icon: "📦", color: "from-blue-500 to-indigo-600" },
    { label: "Customers", value: "3,891", change: "+23.1%", icon: "👥", color: "from-purple-500 to-pink-600" },
    { label: "Conversion", value: "3.24%", change: "+0.8%", icon: "📈", color: "from-amber-500 to-orange-600" },
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "سارا احمدی", amount: "$578", status: "delivered", date: "2 min ago" },
    { id: "ORD-002", customer: "John Doe", amount: "$895", status: "shipped", date: "15 min ago" },
    { id: "ORD-003", customer: "مریم حسینی", amount: "$345", status: "processing", date: "1 hour ago" },
    { id: "ORD-004", customer: "Emma Wilson", amount: "$1,230", status: "pending", date: "2 hours ago" },
    { id: "ORD-005", customer: "علی رضایی", amount: "$175", status: "delivered", date: "3 hours ago" },
  ];

  const chartData = [35, 55, 42, 68, 52, 78, 65, 82, 72, 90, 85, 95];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxChart = Math.max(...chartData);

  return (
    <div className={cn("pt-24 pb-16 min-h-screen", isDark ? "bg-gray-950" : "bg-gray-50")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={cn("text-3xl font-light", isDark ? "text-white" : "text-gray-900")}>Admin Dashboard</h1>
            <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>Welcome back! Here's your store overview.</p>
          </div>
          <div className="flex gap-3">
            <motion.button className="px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 border-gray-300 dark:border-gray-700" whileTap={{ scale: 0.95 }}>
              📥 Export
            </motion.button>
            <motion.button className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium" whileTap={{ scale: 0.95 }}>
              + Add Product
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn("p-6 rounded-2xl", isDark ? "bg-gray-900" : "bg-white shadow-sm")}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-emerald-500 text-xs font-bold">{stat.change}</span>
              </div>
              <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>{stat.value}</p>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className={cn("lg:col-span-2 p-6 rounded-2xl", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
            <h3 className={cn("text-sm font-semibold mb-6", isDark ? "text-white" : "text-gray-900")}>Revenue Overview</h3>
            <div className="flex items-end gap-2 h-48">
              {chartData.map((val, i) => (
                <motion.div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <motion.div
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxChart) * 100}%` }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: "easeOut" }}
                  />
                  <span className={cn("text-[10px]", isDark ? "text-gray-500" : "text-gray-400")}>{months[i]}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className={cn("p-6 rounded-2xl", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
            <h3 className={cn("text-sm font-semibold mb-6", isDark ? "text-white" : "text-gray-900")}>Recent Orders</h3>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{order.customer}</p>
                    <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>{order.id} • {order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>{order.amount}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full capitalize", order.status === "delivered" ? "bg-emerald-100 text-emerald-700" : order.status === "shipped" ? "bg-blue-100 text-blue-700" : order.status === "processing" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600")}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className={cn("mt-8 p-6 rounded-2xl overflow-x-auto", isDark ? "bg-gray-900" : "bg-white shadow-sm")}>
          <h3 className={cn("text-sm font-semibold mb-6", isDark ? "text-white" : "text-gray-900")}>Inventory</h3>
          <table className="w-full">
            <thead>
              <tr className={cn("text-xs uppercase tracking-wider border-b", isDark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-400")}>
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PRODUCTS.map((p) => (
                <tr key={p.id} className={cn("border-b last:border-0", isDark ? "border-gray-800" : "border-gray-100")}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{p.name}</p>
                        <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn("py-4 px-4 text-sm", isDark ? "text-gray-300" : "text-gray-700")}>{formatPrice(p.price, p.currency)}</td>
                  <td className="py-4 px-4">
                    <span className={cn("text-sm font-medium", p.stock < 10 ? "text-red-500" : "text-emerald-500")}>{p.stock}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", p.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                      {p.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// ======================== SEARCH MODAL ==========================
// ================================================================

const SearchModal: FC = () => {
  const { state, setState } = useStore();
  const isDark = state.theme === "dark";
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <AnimatePresence>
      {state.searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[85] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => { setState((s) => ({ ...s, searchOpen: false })); setQuery(""); }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn("w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl", isDark ? "bg-gray-900" : "bg-white")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
              <Icons.Search className={cn("w-5 h-5", isDark ? "text-gray-500" : "text-gray-400")} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className={cn("flex-1 bg-transparent text-lg focus:outline-none", isDark ? "text-white placeholder-gray-600" : "text-gray-900 placeholder-gray-400")}
              />
              <kbd className={cn("text-xs px-2 py-1 rounded", isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400")}>ESC</kbd>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {query && results.length === 0 && (
                <p className={cn("text-center py-8", isDark ? "text-gray-500" : "text-gray-400")}>No results found for "{query}"</p>
              )}
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setState((s) => ({ ...s, searchOpen: false, currentPage: "product-detail", selectedProductId: p.id })); setQuery(""); }}
                  className={cn("w-full flex items-center gap-4 p-4 text-left transition-colors", isDark ? "hover:bg-gray-800" : "hover:bg-gray-50")}
                >
                  <img src={p.images[0].url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{p.name}</p>
                    <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>{p.brand} • {p.category}</p>
                  </div>
                  <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>{formatPrice(p.price, p.currency)}</span>
                </button>
              ))}
              {!query && (
                <div className="p-6">
                  <p className={cn("text-xs font-semibold mb-3", isDark ? "text-gray-500" : "text-gray-400")}>POPULAR SEARCHES</p>
                  <div className="flex flex-wrap gap-2">
                    {["Silk Dress", "Cashmere", "Leather Bag", "Gold Jewelry", "Boots"].map((term) => (
                      <button key={term} onClick={() => setQuery(term)} className={cn("px-3 py-1.5 rounded-full text-xs border", isDark ? "border-gray-700 text-gray-300" : "border-gray-300 text-gray-600")}>
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ================================================================
// ======================== FOOTER ================================
// ================================================================

const Footer: FC = () => {
  const { state } = useStore();
  const isDark = state.theme === "dark";

  return (
    <footer className={cn("py-16", isDark ? "bg-gray-900 border-t border-gray-800" : "bg-gray-50 border-t border-gray-200")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className={cn("text-2xl font-light tracking-[0.2em] uppercase mb-4", isDark ? "text-white" : "text-gray-900")}>Boutique</h3>
            <p className={cn("text-sm leading-relaxed", isDark ? "text-gray-400" : "text-gray-500")}>
              Curated luxury fashion for the modern individual. Timeless pieces, exceptional quality.
            </p>
          </div>
          {[
            { title: "Shop", links: ["New Arrivals", "Best Sellers", "Dresses", "Outerwear", "Accessories"] },
            { title: "Help", links: ["FAQ", "Shipping", "Returns", "Size Guide", "Contact"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Sustainability", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className={cn("text-sm font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <button className={cn("text-sm transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={cn("pt-8 border-t text-center text-xs", isDark ? "border-gray-800 text-gray-600" : "border-gray-200 text-gray-400")}>
          © 2026 Boutique Luxe. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// ================================================================
// ======================== MAIN APP ==============================
// ================================================================

export default function App(): ReactNode {
  const [state, setState] = useState<AppState>({
    theme: "light",
    locale: "en",
    currentPage: "home",
    selectedProductId: null,
    cartOpen: false,
    searchOpen: false,
    filterOpen: false,
    userLoggedIn: false,
    previousPage: "home",
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [authData, setAuthData] = useState<StoredAuth>(DEFAULT_AUTH);

  const isDark = state.theme === "dark";

  // Load auth data on mount
  useEffect(() => {
    const loaded = loadAuth();
    setAuthData(loaded);
    if (loaded.currentUserId && loaded.profiles[loaded.currentUserId]) {
      setUser(loaded.profiles[loaded.currentUserId]);
      setState((s) => ({ ...s, userLoggedIn: true }));
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("boutique-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("boutique-cart", JSON.stringify(cart));
    } catch { /* ignore */ }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("boutique-theme", state.theme);
  }, [state.theme]);

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("boutique-theme") as ThemeMode | null;
    if (saved) setState((s) => ({ ...s, theme: saved }));
  }, []);

  // Toast function
  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cart functions
  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) => i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
  }, []);

  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  const applyPromoFn = useCallback((code: string): boolean => {
    const promo = PROMO_CODES.find((p) => p.code === code.toUpperCase() && new Date(p.expiresAt) > new Date());
    if (promo && cartTotal >= promo.minOrder) {
      setAppliedPromo(promo);
      return true;
    }
    return false;
  }, [cartTotal]);

  const removePromo = useCallback(() => setAppliedPromo(null), []);

  // ============ AUTH FUNCTIONS ============
  const register = useCallback(
    (firstName: string, lastName: string, email: string, phone: string, password: string) => {
      const existing = authData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return { success: false, message: "Email already registered" };
      }

      const profileId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newUser: AuthUser = { email, password, profileId };
      const newProfile = createEmptyProfile(profileId, firstName, lastName, email, phone);

      const updated: StoredAuth = {
        users: [...authData.users, newUser],
        profiles: { ...authData.profiles, [profileId]: newProfile },
        currentUserId: profileId,
      };

      setAuthData(updated);
      saveAuth(updated);
      setUser(newProfile);
      setState((s) => ({ ...s, userLoggedIn: true }));
      return { success: true, message: "Account created successfully" };
    },
    [authData]
  );

  const login = useCallback(
    (email: string, password: string) => {
      const found = authData.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) {
        return { success: false, message: "Invalid email or password" };
      }

      const profile = authData.profiles[found.profileId];
      if (!profile) {
        return { success: false, message: "Profile not found" };
      }

      const updated: StoredAuth = { ...authData, currentUserId: found.profileId };
      setAuthData(updated);
      saveAuth(updated);
      setUser(profile);
      setState((s) => ({ ...s, userLoggedIn: true }));
      return { success: true, message: "Logged in successfully" };
    },
    [authData]
  );

  const logout = useCallback(() => {
    const updated: StoredAuth = { ...authData, currentUserId: null };
    setAuthData(updated);
    saveAuth(updated);
    setUser(null);
    setState((s) => ({ ...s, userLoggedIn: false }));
  }, [authData]);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      if (!user) return;
      const updatedProfile = { ...user, ...updates };
      setUser(updatedProfile);
      const updated: StoredAuth = {
        ...authData,
        profiles: { ...authData.profiles, [user.id]: updatedProfile },
      };
      setAuthData(updated);
      saveAuth(updated);
    },
    [user, authData]
  );

  const uploadAvatar = useCallback(
    (dataUrl: string) => {
      updateProfile({ avatar: dataUrl });
    },
    [updateProfile]
  );

  const requireAuth = useCallback(
    (callback: () => void) => {
      if (user) {
        callback();
      } else {
        setState((s) => ({ ...s, currentPage: "auth", previousPage: s.currentPage }));
        addToast("Please sign in to continue", "info");
      }
    },
    [user, addToast]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setState((s) => ({ ...s, cartOpen: false, searchOpen: false }));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setState((s) => ({ ...s, searchOpen: true }));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.currentPage]);

  const contextValue: StoreContextType = {
    state,
    setState,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    user,
    setUser,
    toast: addToast,
    appliedPromo,
    applyPromo: applyPromoFn,
    removePromo,
    register,
    login,
    logout,
    updateProfile,
    uploadAvatar,
    requireAuth,
  };

  const renderPage = () => {
    switch (state.currentPage) {
      case "home":
        return <HomePage />;
      case "products":
        return <ProductsPage />;
      case "product-detail":
        return <ProductDetailPage />;
      case "checkout":
        return <CheckoutPage />;
      case "profile":
      case "orders":
      case "wishlist":
        return user ? <ProfilePage /> : <AuthPage />;
      case "auth":
        return <AuthPage />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <HomePage />;
    }
  };

  return (
    <StoreContext.Provider value={contextValue}>
      <div
        className={cn(
          "min-h-screen transition-colors duration-300",
          isDark ? "bg-gray-950 text-white" : "bg-white text-gray-900"
        )}
        dir={state.locale === "fa" ? "rtl" : "ltr"}
      >
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={state.currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.main>
        </AnimatePresence>
        <Footer />
        <CartDrawer />
        <SearchModal />
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Floating Admin Button */}
        <motion.button
          onClick={() => setState((s) => ({ ...s, currentPage: s.currentPage === "admin" ? "home" : "admin" }))}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl shadow-amber-500/30 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          title="Admin Dashboard"
        >
          <Icons.Settings className="w-6 h-6" />
        </motion.button>
      </div>
    </StoreContext.Provider>
  );
}