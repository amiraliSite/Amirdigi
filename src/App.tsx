import { useState, useEffect, createContext, useContext, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  Moon, Sun, ShoppingCart, User, LogOut, X, Eye, EyeOff, 
  Check, AlertCircle, Star, Zap, Truck, Shield, Headphones, 
  TrendingUp, Tag, Send, MapPin, Phone, Mail, Globe, 
  Home, ShoppingBag, Grid, Info, Layers, MessageCircle, 
  ChevronRight, ChevronLeft, CreditCard, Heart
} from "lucide-react";
import { FaTelegram, FaInstagram, FaLinkedin } from "react-icons/fa";

import img from '../public/Gemini_Generated_Image_gz8n0ugz8n0ugz8n.png'
// ============ TYPES ============
type Theme = "light" | "dark";
type Lang = "fa" | "en";
interface UserT { name: string; email: string; }
interface Product { 
  id: number; 
  name: { fa: string; en: string }; 
  price: string; 
  old: string; 
  img: string; 
  rating: number; 
  discount: number; 
}
interface CartItem extends Omit<Product, 'name'> { name: { fa: string; en: string }; qty: number; }
interface ShippingInfo { address: string; city: string; postalCode: string; method: 'standard' | 'express'; }
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }

// ============ TRANSLATIONS ============
const translations = {
  fa: {
    brand: "دیجی امیر",
    loading: "در حال آماده‌سازی فروشگاه...",
    nav: { home: "خانه", products: "محصولات", categories: "دسته‌بندی", offers: "پیشنهادات", about: "درباره ما", blog: "بلاگ", contact: "تماس", faq: "سوالات", profile: "پروفایل" },
    hero: { badge: "تخفیف ویژه تا ۷۰٪", title1: "خریدی", title2: "هوشمند", title3: "با", title4: "دیجی امیر", desc: "بهترین محصولات با بهترین قیمت‌ها، ارسال سریع و ضمانت اصالت کالا. همین الان شروع کن!", btn1: "مشاهده محصولات", btn2: "ثبت‌نام رایگان" },
    features: { f1: { title: "ارسال رایگان", desc: "برای خریدهای بالای ۵۰۰ هزار تومان" }, f2: { title: "ضمانت اصالت", desc: "تمامی کالاها اورجینال هستند" }, f3: { title: "پشتیبانی ۲۴/۷", desc: "همیشه در کنار شما هستیم" }, f4: { title: "بهترین قیمت", desc: "تضمین پایین‌ترین قیمت بازار" } },
    products: { title: "محصولات", subtitle: "پرفروش", desc: "بهترین‌ها رو اینجا پیدا کن", addCart: "افزودن به سبد" },
    categories: { title: "دسته‌بندی", subtitle: "محصولات", desc: "هر چی می‌خوای اینجاست", items: "محصول" },
    offers: { badge: "پیشنهاد ویژه", title1: "تخفیف", title2: "۷۰٪", title3: "روی همه محصولات", desc: "فقط تا پایان این هفته فرصت داری از این تخفیف فوق‌العاده استفاده کنی!", btn: "مشاهده محصولات" },
    about: { title: "درباره", subtitle: "دیجی امیر", p1: "دیجی امیر از سال ۱۳۹۸ فعالیت خودش رو شروع کرده و امروز یکی از بزرگ‌ترین فروشگاه‌های آنلاین ایران هست.", p2: "هدف ما ایجاد یک تجربه خرید لذت‌بخش و مطمئن برای همه شماست.", stats: [{ n: "+۱۰K", l: "مشتری" }, { n: "+۵۰K", l: "محصول" }, { n: "+۹۸٪", l: "رضایت" }], badge: "فروشگاه معتبر", badgeDesc: "با بیش از ۵ سال سابقه" },
    blog: { title: "آخرین", subtitle: "مقالات", desc: "مطالب آموزشی و بررسی محصولات", readMore: "ادامه مطلب ←" },
    contact: { title: "تماس", subtitle: "با ما", desc: "سوالی داری؟ با ما در ارتباط باش", addr: { title: "آدرس", desc: "تهران، خیابان ولیعصر، پلاک ۱۲۳" }, phone: { title: "تلفن", desc: "۰۲۱-۱۲۳۴۵۶۷۸" }, email: { title: "ایمیل", desc: "info@digiamir.ir" }, form: { name: "نام شما", email: "ایمیل", msg: "پیام شما", btn: "ارسال پیام", sent: "ارسال شد ✓" } },
    faq: { title: "سوالات", subtitle: "متداول", desc: "پاسخ سوالات رایج", items: [{ q: "چطور می‌تونم خرید کنم؟", a: "کافیه محصول مورد نظرت رو به سبد خرید اضافه کنی و بعد از ورود به حساب، خریدت رو تکمیل کنی." }, { q: "هزینه ارسال چقدره؟", a: "برای خریدهای بالای ۵۰۰ هزار تومان، ارسال رایگانه." }, { q: "آیا ضمانت بازگشت کالا دارید؟", a: "بله، تا ۷ روز بعد از دریافت کالا، می‌تونی اون رو مرجوع کنی." }, { q: "روش‌های پرداخت چیه؟", a: "پرداخت آنلاین، کارت به کارت و پرداخت در محل." }] },
    auth: { login: "ورود به حساب", register: "ساخت حساب جدید", loginDesc: "خوش برگشتی!", registerDesc: "به دیجی امیر خوش اومدی", name: "نام و نام خانوادگی", email: "ایمیل", pass: "رمز عبور", strength: "قدرت رمز عبور:", checks: ["حداقل ۸ کاراکتر", "حرف بزرگ", "حرف کوچک", "عدد", "کاراکتر خاص"], noAccount: "حساب نداری؟", hasAccount: "حساب داری؟", registerBtn: "ثبت‌نام کن", loginBtn: "وارد شو", loginBtn2: "ورود", registerBtn2: "ثبت‌نام" },
    cart: { title: "🛒 سبد خرید", empty: "سبد خرید خالی است", loginReq: "برای خرید باید وارد حساب کاربری شوید", loginBtn: "ورود به حساب", buy: "تکمیل خرید", processing: "در حال پردازش...", success: "سفارش شما ثبت شد!", successDesc: "به زودی با شما تماس می‌گیریم", checkout: { title: "اطلاعات ارسال", address: "آدرس کامل", city: "شهر", postal: "کد پستی", method: "نوع ارسال", standard: "عادی (رایگان)", express: "پیشتاز (۵۰ تومن)", submit: "پرداخت و ثبت سفارش" } },
    footer: { desc: "فروشگاه آنلاین با بهترین محصولات و قیمت‌ها", quick: "دسترسی سریع", services: "خدمات مشتریان", newsletter: "خبرنامه", newsletterDesc: "از تخفیف‌ها باخبر شو", subscribe: "عضویت", rights: "© ۱۴۰۳ دیجی امیر. تمامی حقوق محفوظ است.", creator: "سازنده: امیر علی محمدی" },
    toast: { addedCart: "به سبد خرید اضافه شد!", removedCart: "از سبد حذف شد", loginSuccess: "ورود موفقیت‌آمیز بود!", registerSuccess: "ثبت‌نام با موفقیت انجام شد!", error: "خطا در عملیات" }
  },
  en: {
    brand: "Digi Amir",
    loading: "Preparing the store...",
    nav: { home: "Home", products: "Products", categories: "Categories", offers: "Offers", about: "About", blog: "Blog", contact: "Contact", faq: "FAQ", profile: "Profile" },
    hero: { badge: "Special Discount Up to 70%", title1: "Smart", title2: "Shopping", title3: "with", title4: "Digi Amir", desc: "Best products with the best prices, fast shipping and authenticity guarantee. Start now!", btn1: "View Products", btn2: "Free Signup" },
    features: { f1: { title: "Free Shipping", desc: "For orders over 500K Tomans" }, f2: { title: "Authenticity", desc: "All products are original" }, f3: { title: "24/7 Support", desc: "Always here for you" }, f4: { title: "Best Price", desc: "Lowest price guarantee" } },
    products: { title: "Best", subtitle: "Sellers", desc: "Find the best here", addCart: "Add to Cart" },
    categories: { title: "Product", subtitle: "Categories", desc: "Everything you need is here", items: "items" },
    offers: { badge: "Special Offer", title1: "Up to", title2: "70%", title3: "OFF on All Products", desc: "Only until the end of this week you have the chance to use this amazing discount!", btn: "View Products" },
    about: { title: "About", subtitle: "Digi Amir", p1: "Digi Amir started in 2019 and today is one of the largest online stores in Iran.", p2: "Our goal is to create an enjoyable and secure shopping experience for everyone.", stats: [{ n: "+10K", l: "Customers" }, { n: "+50K", l: "Products" }, { n: "+98%", l: "Satisfaction" }], badge: "Trusted Store", badgeDesc: "Over 5 years of experience" },
    blog: { title: "Latest", subtitle: "Articles", desc: "Educational content and product reviews", readMore: "Read More →" },
    contact: { title: "Contact", subtitle: "Us", desc: "Have a question? Get in touch", addr: { title: "Address", desc: "Tehran, Valiasr St., No. 123" }, phone: { title: "Phone", desc: "+98-21-12345678" }, email: { title: "Email", desc: "info@digiamir.com" }, form: { name: "Your Name", email: "Email", msg: "Your Message", btn: "Send Message", sent: "Sent ✓" } },
    faq: { title: "Frequently", subtitle: "Asked Questions", desc: "Answers to common questions", items: [{ q: "How can I make a purchase?", a: "Simply add the product to your cart and complete the purchase after logging in." }, { q: "What is the shipping cost?", a: "Free shipping for orders over 500K Tomans." }, { q: "Do you have a return policy?", a: "Yes, you can return items within 7 days of receipt." }, { q: "What are the payment methods?", a: "Online payment, card-to-card, and cash on delivery." }] },
    auth: { login: "Sign In", register: "Create Account", loginDesc: "Welcome back!", registerDesc: "Welcome to Digi Amir", name: "Full Name", email: "Email", pass: "Password", strength: "Password Strength:", checks: ["At least 8 chars", "Uppercase", "Lowercase", "Number", "Special char"], noAccount: "No account?", hasAccount: "Have an account?", registerBtn: "Sign Up", loginBtn: "Sign In", loginBtn2: "Sign In", registerBtn2: "Sign Up" },
    cart: { title: "🛒 Shopping Cart", empty: "Cart is empty", loginReq: "Please login to complete purchase", loginBtn: "Login", buy: "Complete Purchase", processing: "Processing...", success: "Order Placed Successfully!", successDesc: "We'll contact you soon", checkout: { title: "Shipping Info", address: "Full Address", city: "City", postal: "Postal Code", method: "Shipping Method", standard: "Standard (Free)", express: "Express ($2)", submit: "Pay & Order" } },
    footer: { desc: "Online store with best products and prices", quick: "Quick Links", services: "Customer Service", newsletter: "Newsletter", newsletterDesc: "Stay updated on discounts", subscribe: "Subscribe", rights: "© 2024 Digi Amir. All rights reserved.", creator: "Creator: Amir Ali Mohammadi" },
    toast: { addedCart: "Added to cart!", removedCart: "Removed from cart", loginSuccess: "Login successful!", registerSuccess: "Registration successful!", error: "Operation failed" }
  }
};

// ============ CONTEXTS ============
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void } | null>(null);
const LangCtx = createContext<{ lang: Lang; toggle: () => void; t: typeof translations.fa } | null>(null);
const AuthCtx = createContext<{ user: UserT | null; login: (e: string, p: string) => Promise<{ ok: boolean; msg?: string }>; register: (n: string, e: string, p: string) => Promise<{ ok: boolean; msg?: string }>; logout: () => void } | null>(null);
const CartCtx = createContext<{ items: CartItem[]; add: (p: Product) => void; remove: (id: number) => void; clear: () => void; wishlist: number[]; toggleWishlist: (id: number) => void } | null>(null);
const ToastCtx = createContext<{ addToast: (msg: string, type: 'success' | 'error' | 'info') => void } | null>(null);

const useTheme = () => useContext(ThemeCtx)!;
const useLang = () => useContext(LangCtx)!;
const useAuth = () => useContext(AuthCtx)!;
const useCart = () => useContext(CartCtx)!;
const useToast = () => useContext(ToastCtx)!;

// ============ VALIDATORS ============
const validatePassword = (p: string): string | null => {
  if (p.length < 8) return "رمز عبور باید حداقل ۸ کاراکتر باشد";
  if (!/[A-Z]/.test(p)) return "رمز عبور باید حداقل یک حرف بزرگ داشته باشد";
  if (!/[a-z]/.test(p)) return "رمز عبور باید حداقل یک حرف کوچک داشته باشد";
  if (!/[0-9]/.test(p)) return "رمز عبور باید حداقل یک عدد داشته باشد";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return "رمز عبور باید حداقل یک کاراکتر خاص داشته باشد";
  return null;
};
const validateEmail = (e: string): string | null => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "ایمیل معتبر نیست";
  return null;
};

// ============ DATA ============
const PRODUCTS: Product[] = [
  { id: 1, name: { fa: "گوشی سامسونگ S24 Ultra", en: "Samsung Galaxy S24 Ultra" }, price: "۳۵,۰۰۰,۰۰۰", old: "۴۰,۰۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop", rating: 4.8, discount: 12 },
  { id: 2, name: { fa: "لپ تاپ ایسوس ROG", en: "ASUS ROG Laptop" }, price: "۸۵,۰۰۰,۰۰۰", old: "۹۵,۰۰۰,۰۰۰", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrxhY15yv-v-mf5JgvR1z8PBoWTGU3KxK4Fr0bEEEsD4HnWLV_dLnKIOUm&s=10", rating: 4.9, discount: 10 },
  { id: 3, name: { fa: "هدفون سونی WH-1000XM5", en: "Sony WH-1000XM5 Headphones" }, price: "۱۲,۰۰۰,۰۰۰", old: "۱۵,۰۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop", rating: 4.7, discount: 20 },
  { id: 4, name: { fa: "ساعت اپل واچ Ultra", en: "Apple Watch Ultra" }, price: "۲۵,۰۰۰,۰۰۰", old: "۲۸,۰۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop", rating: 4.6, discount: 11 },
  { id: 5, name: { fa: "دوربین کانن EOS R5", en: "Canon EOS R5 Camera" }, price: "۴۵,۰۰۰,۰۰۰", old: "۵۰,۰۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop", rating: 4.9, discount: 10 },
  { id: 6, name: { fa: "آیپد پرو M2", en: "iPad Pro M2" }, price: "۵۵,۰۰۰,۰۰۰", old: "۶۰,۰۰۰,۰۰۰", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJeyC6o-lkNY8lN4Rl2OeCExmvgUbACnYKQiysdY8YImJbUaeHkEjy_Kc&s=10p", rating: 4.8, discount: 8 },
  { id: 7, name: { fa: "کنسول پلی استیشن 5", en: "PlayStation 5 Console" }, price: "۳۲,۰۰۰,۰۰۰", old: "۳۸,۰۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop", rating: 4.9, discount: 16 },
  { id: 8, name: { fa: "اسپیکر بلوتوث JBL", en: "JBL Bluetooth Speaker" }, price: "۸,۰۰۰,۰۰۰", old: "۱۰,۰۰۰,۰۰۰", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop", rating: 4.5, discount: 20 },
];

const CATEGORIES = [
  { name: { fa: "موبایل", en: "Mobile" }, icon: "📱", count: 1250 },
  { name: { fa: "لپ تاپ", en: "Laptop" }, icon: "💻", count: 840 },
  { name: { fa: "لوازم جانبی", en: "Accessories" }, icon: "🎧", count: 2100 },
  { name: { fa: "ساعت هوشمند", en: "Smartwatch" }, icon: "⌚", count: 560 },
  { name: { fa: "دوربین", en: "Camera" }, icon: "📷", count: 320 },
  { name: { fa: "گیمینگ", en: "Gaming" }, icon: "🎮", count: 780 },
  { name: { fa: "صوتی", en: "Audio" }, icon: "🔊", count: 450 },
  { name: { fa: "تلویزیون", en: "TV" }, icon: "📺", count: 290 },
];

const BLOG_POSTS = [
  { title: { fa: "بهترین گوشی‌های ۲۰۲۴", en: "Best Phones of 2024" }, desc: { fa: "بررسی کامل پرچمداران امسال", en: "Complete review of this year's flagships" }, img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=350&fit=crop", date: { fa: "۱۵ آذر", en: "Dec 15" } },
  { title: { fa: "راهنمای خرید لپ تاپ", en: "Laptop Buying Guide" }, desc: { fa: "نکات مهم قبل از خرید", en: "Important tips before buying" }, img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=350&fit=crop", date: { fa: "۱۰ آذر", en: "Dec 10" } },
  { title: { fa: "مقایسه ایرپادها", en: "AirPods Comparison" }, desc: { fa: "کدوم ایرپاد برای تو مناسبه؟", en: "Which AirPods is right for you?" }, img: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/99b3e261-2dfd-4618-ad56-84247822634e.jpg;maxHeight=828;maxWidth=400?format=webp", date: { fa: "۵ آذر", en: "Dec 5" } },
];

// ============ LOADING SCREEN ============
const LoadingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); setTimeout(onFinish, 400); return 100; }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 overflow-hidden">
      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 16, repeat: Infinity }} className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-30" />
      <motion.div animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 1 }} className="absolute bottom-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-30" />
      <div className="relative z-10 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="relative mb-8 inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
            <span className="text-4xl font-black text-gradient">DA</span>
          </div>
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-2">{lang === 'fa' ? 'دیجی' : 'Digi'} <span className="text-gradient">{lang === 'fa' ? 'امیر' : 'Amir'}</span></h1>
        <p className="text-white/60 mb-8 text-lg">{t.loading}</p>
        <div className="w-80 max-w-xs mx-auto">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
          </div>
          <p className="text-white/70 mt-3 text-sm font-mono">{progress}%</p>
        </div>
      </div>
    </motion.div>
  );
};

// ============ NAVBAR ============ 

const Navbar = ({ onAuth, onCart }: { onAuth: () => void; onCart: () => void }) => {
  const { theme, toggle } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const { user, logout } = useAuth();
  const { items } = useCart();

  const links = [
    { id: "home", label: t.nav.home, icon: Home }, 
    { id: "products", label: t.nav.products, icon: ShoppingBag }, 
    { id: "categories", label: t.nav.categories, icon: Grid },
    { id: "offers", label: t.nav.offers, icon: Tag }, 
    { id: "about", label: t.nav.about, icon: Info }, 
    { id: "blog", label: t.nav.blog, icon: Layers },
    { id: "contact", label: t.nav.contact, icon: MessageCircle }, 
    { id: "faq", label: t.nav.faq, icon: AlertCircle },
  ];

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 inset-x-0 z-50 glass shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black">DA</div>
            <span className="text-xl font-black text-gradient hidden sm:block">{t.brand}</span>
          </motion.div>
          
          <div className="hidden lg:flex items-center gap-1">
            {links.map((l, i) => (
              <motion.button key={l.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.1, y: -2 }} onClick={() => scrollTo(l.id)} className="px-3 py-2 rounded-lg hover:bg-brand-500/10 transition-colors font-medium text-sm">
                {l.label}
              </motion.button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }} onClick={toggleLang} className="w-10 h-10 rounded-xl glass hover:bg-brand-500/10 transition-colors flex items-center justify-center">
              <Globe size={18} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, rotate: theme === 'dark' ? 0 : 180 }} whileTap={{ scale: 0.9 }} onClick={toggle} className="w-10 h-10 rounded-xl glass hover:bg-brand-500/10 transition-colors flex items-center justify-center">
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div key="sun" initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 180, opacity: 0 }}><Sun size={20} /></motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 180, opacity: 0 }}><Moon size={20} /></motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onCart} className="w-10 h-10 rounded-xl glass hover:bg-brand-500/10 transition-colors flex items-center justify-center relative">
              <ShoppingCart size={20} />
              <AnimatePresence>
                {items.length > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">{items.length}</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-3 py-2 rounded-xl glass flex items-center gap-2">
                  <User size={16} /><span className="text-sm font-medium">{user.name}</span>
                </motion.div>
                <motion.button whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }} onClick={logout} className="w-10 h-10 rounded-xl glass hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500">
                  <LogOut size={18} />
                </motion.button>
              </div>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAuth} className="hidden md:inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold">
                {lang === 'fa' ? 'ورود / ثبت‌نام' : 'Login / Register'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* منوی پایین موبایل */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="lg:hidden fixed bottom-4 left-4 right-4 z-50"
      >
        <div className="glass rounded-2xl p-2 flex justify-around items-center shadow-2xl shadow-brand-500/20 border border-white/30 dark:border-gray-700/50 backdrop-blur-xl">
          {links.slice(0, 5).map((l, i) => (
            <motion.button
              key={l.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.2, y: -8 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scrollTo(l.id)} 
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-brand-500/10 transition-colors group relative"
            >
              <motion.div className="absolute inset-0 bg-brand-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <l.icon size={22} className="text-gray-600 dark:text-gray-300 group-hover:text-brand-500 transition-colors relative z-10" />
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 group-hover:text-brand-500 transition-colors relative z-10">{l.label}</span>
            </motion.button>
          ))}
          {user && (
             <motion.button
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: 1, scale: 1 }}
             whileHover={{ scale: 1.2, y: -8 }}
             whileTap={{ scale: 0.9 }}
             onClick={logout}
             className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-red-500/10 transition-colors group relative"
           >
             <motion.div className="absolute inset-0 bg-red-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
             <User size={22} className="text-red-500 relative z-10" />
             <span className="text-[10px] font-bold text-red-500 relative z-10">{t.nav.profile}</span>
           </motion.button>
          )}
        </div>
      </motion.div>
    </>
  );
};

// ============ AUTH MODAL ============
const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const { login, register } = useAuth();
  const { lang, t } = useLang();
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passChecks = [
    { label: t.auth.checks[0], ok: password.length >= 8 },
    { label: t.auth.checks[1], ok: /[A-Z]/.test(password) },
    { label: t.auth.checks[2], ok: /[a-z]/.test(password) },
    { label: t.auth.checks[3], ok: /[0-9]/.test(password) },
    { label: t.auth.checks[4], ok: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = isLogin ? await login(email, password) : await register(name, email, password);
    setLoading(false);
    if (res.ok) {
      addToast(isLogin ? t.toast.loginSuccess : t.toast.registerSuccess, 'success');
      onClose();
    } else {
      setError(res.msg || t.toast.error);
      addToast(res.msg || t.toast.error, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-800/50 max-h-[90vh] overflow-y-auto">
        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="absolute top-4 left-4 w-10 h-10 rounded-xl hover:bg-red-500/10 flex items-center justify-center">
          <X size={20} />
        </motion.button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black mb-3">DA</div>
          <h2 className="text-2xl font-black">{isLogin ? t.auth.login : t.auth.register}</h2>
          <p className="text-sm opacity-60 mt-1">{isLogin ? t.auth.loginDesc : t.auth.registerDesc}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <input type="text" placeholder={t.auth.name} value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </motion.div>
            )}
          </AnimatePresence>
          <input type="email" placeholder={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="relative">
            <input type={showPass ? "text" : "password"} placeholder={t.auth.pass} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 pl-12" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {password && (
            <div className="p-3 rounded-xl bg-white/30 dark:bg-gray-800/30 space-y-2">
              <p className="text-xs font-bold mb-2">{t.auth.strength}</p>
              {passChecks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {c.ok ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-500" />}
                  <span className={c.ok ? "text-green-500" : "opacity-60"}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold disabled:opacity-50">
            {loading ? (lang === 'fa' ? "در حال پردازش..." : "Processing...") : (isLogin ? t.auth.loginBtn2 : t.auth.registerBtn2)}
          </button>
          <p className="text-center text-sm">
            {isLogin ? t.auth.noAccount + " " : t.auth.hasAccount + " "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-brand-500 font-bold hover:underline">
              {isLogin ? t.auth.registerBtn : t.auth.loginBtn}
            </button>
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ============ CART & CHECKOUT MODAL ============
const CartModal = ({ onClose, onAuth }: { onClose: () => void; onAuth: () => void }) => {
  const { user } = useAuth();
  const { items, remove, clear } = useCart();
  const { lang, t } = useLang();
  const { addToast } = useToast();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [shipping, setShipping] = useState<ShippingInfo>({ address: "", city: "", postalCode: "", method: 'standard' });
  const [processing, setProcessing] = useState(false);

  const handleBuyClick = () => {
    if (!user) { onAuth(); return; }
    setStep('checkout');
  };

  const handleFinalSubmit = () => {
    if (!shipping.address || !shipping.city) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('success');
      clear();
      addToast(`${user?.name} ${t.cart.success}`, 'success');
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg glass rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-800/50 max-h-[90vh] overflow-y-auto">
        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="absolute top-4 left-4 w-10 h-10 rounded-xl hover:bg-red-500/10 flex items-center justify-center">
          <X size={20} />
        </motion.button>
        
        <AnimatePresence mode="wait">
          {step === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-2xl font-black mb-6 text-center">{t.cart.title}</h2>
              {items.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <div className="text-6xl mb-4">🛒</div>
                  <p>{t.cart.empty}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <motion.div key={item.id} layout className="glass rounded-2xl p-4 flex items-start gap-4">
                        <img src={item.img} alt={item.name[lang]} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{item.name[lang]}</h4>
                          <p className="text-sm text-brand-500 font-bold mt-1">{item.price} {lang === 'fa' ? 'تومان' : 'Tomans'}</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => { remove(item.id); addToast(t.toast.removedCart, 'info'); }} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 flex-shrink-0">
                          <X size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={handleBuyClick} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold hover:scale-[1.02] transition-transform">
                    {t.cart.buy}
                  </button>
                </>
              )}
            </motion.div>
          )}

          {step === 'checkout' && (
            <motion.div key="checkout" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4">
              <h2 className="text-2xl font-black mb-4 text-center">{t.cart.checkout.title}</h2>
              <div className="space-y-3">
                <input type="text" placeholder={t.cart.checkout.address} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:ring-2 focus:ring-brand-500 outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder={t.cart.checkout.city} value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:ring-2 focus:ring-brand-500 outline-none" />
                  <input type="text" placeholder={t.cart.checkout.postal} value={shipping.postalCode} onChange={e => setShipping({...shipping, postalCode: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20">
                  <p className="mb-2 font-bold text-sm">{t.cart.checkout.method}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShipping({...shipping, method: 'standard'})} className={`flex-1 py-2 rounded-lg text-sm border ${shipping.method === 'standard' ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-500'}`}>{t.cart.checkout.standard}</button>
                    <button onClick={() => setShipping({...shipping, method: 'express'})} className={`flex-1 py-2 rounded-lg text-sm border ${shipping.method === 'express' ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-500'}`}>{t.cart.checkout.express}</button>
                  </div>
                </div>
              </div>
              <button onClick={handleFinalSubmit} disabled={processing} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {processing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={20} /></motion.div> : <CreditCard size={20} />}
                {processing ? t.cart.processing : t.cart.checkout.submit}
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-6xl mb-4">🎉</motion.div>
              <h3 className="text-2xl font-black mb-2 text-gradient">{user?.name} {t.cart.success}</h3>
              <p className="opacity-60 mb-6">{t.cart.successDesc}</p>
              <button onClick={onClose} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-bold">بستن</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// ============ 3D TILT PRODUCT CARD ============
const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative"
    >
      {children}
    </motion.div>
  );
};

// ============ SECTIONS ============
const Hero = ({ onAuth }: { onAuth: () => void }) => {
  const { t } = useLang();
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden">
      <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }} className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8 }}>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Zap size={16} className="text-yellow-500" /><span className="text-sm font-bold">{t.hero.badge}</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            {t.hero.title1} <span className="text-gradient">{t.hero.title2}</span> {t.hero.title3} <br /> {t.hero.title4}
          </h1>
          <p className="text-lg opacity-70 mb-8 leading-relaxed">{t.hero.desc}</p>
          <div className="flex flex-wrap gap-4">
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }} whileTap={{ scale: 0.95 }} onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold shadow-lg shadow-brand-500/30">
              {t.hero.btn1}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)" }} whileTap={{ scale: 0.95 }} onClick={onAuth} className="px-8 py-4 rounded-2xl glass font-bold">
              {t.hero.btn2}
            </motion.button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-[3rem] blur-2xl opacity-30" />
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative glass rounded-[3rem] p-8 h-full flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <div className="text-center">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjKTzCmmNLISzvHfG33wlp2K1Rg2oGQV8vHPXD0yYRJA&s=10" alt="Shopping" className="w-84 h-84 object-cover rounded-3xl mb-4 mx-auto shadow-xl" />
                <div className="flex justify-center gap-2 mb-4">{[1,2,3,4,5].map(i => <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-2xl font-black">{useLang().lang === 'fa' ? '+۱۰,۰۰۰' : '+10,000'} {useLang().lang === 'fa' ? 'مشتری راضی' : 'Happy Customers'}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Features = () => {
  const { t } = useLang();
  const items = [
    { icon: Truck, title: t.features.f1.title, desc: t.features.f1.desc, color: "from-blue-500 to-cyan-500" },
    { icon: Shield, title: t.features.f2.title, desc: t.features.f2.desc, color: "from-green-500 to-emerald-500" },
    { icon: Headphones, title: t.features.f3.title, desc: t.features.f3.desc, color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, title: t.features.f4.title, desc: t.features.f4.desc, color: "from-orange-500 to-red-500" },
  ];
  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, y: -10, boxShadow: "0 0 25px rgba(99, 102, 241, 0.4)" }} className="glass rounded-3xl p-6 cursor-pointer border border-transparent hover:border-brand-500/50 transition-colors">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${it.color} flex items-center justify-center mb-4 shadow-lg`}>
              <it.icon size={28} className="text-white" />
            </motion.div>
            <h3 className="text-xl font-black mb-2">{it.title}</h3>
            <p className="opacity-60 text-sm">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const ProductSlider = () => {
  const { add, wishlist, toggleWishlist } = useCart();
  const { lang, t } = useLang();
  const { addToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPaused && PRODUCTS.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % PRODUCTS.length);
      }, 5000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % PRODUCTS.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + PRODUCTS.length) % PRODUCTS.length);

  const currentProduct = PRODUCTS[currentIndex];
  const isWishlisted = wishlist.includes(currentProduct.id);

  return (
    <section id="products" className="py-20 max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">{t.products.title} <span className="text-gradient">{t.products.subtitle}</span></h2>
        <p className="opacity-60 mb-8">{t.products.desc}</p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <div className="glass rounded-[3rem] p-8 md:p-12 border border-white/20 shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentProduct.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="order-2 md:order-1 space-y-6">
                <div className="inline-block px-4 py-1 rounded-full bg-red-500/20 text-red-500 font-bold text-sm">-{currentProduct.discount}% OFF</div>
                <h3 className="text-3xl md:text-4xl font-black">{currentProduct.name[lang]}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400"><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /></div>
                  <span className="font-bold">{currentProduct.rating}</span>
                </div>
                <div className="flex items-end gap-4">
                  <span className="text-3xl font-black text-brand-500">{currentProduct.price}</span>
                  <span className="text-lg line-through opacity-50">{currentProduct.old}</span>
                </div>
                <div className="flex gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { add(currentProduct); addToast(t.toast.addedCart, 'success'); }}
                    className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} /> {t.products.addCart}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleWishlist(currentProduct.id)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${isWishlisted ? 'bg-red-500/20 border-red-500 text-red-500' : 'glass border-white/20 text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                  </motion.button>
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <TiltCard>
                  <motion.img 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={currentProduct.img} 
                    alt={currentProduct.name[lang]} 
                    className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl shadow-2xl"
                  />
                </TiltCard>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors z-10"><ChevronLeft size={15} /></button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors z-10"><ChevronRight size={15} /></button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {PRODUCTS.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)} className={`h-2 rounded-full transition-all ${i === currentIndex ? 'bg-brand-500 w-8' : 'bg-white/30 w-2'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Categories = () => {
  const { lang, t } = useLang();
  return (
    <section id="categories" className="py-20 max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">{t.categories.title} <span className="text-gradient">{t.categories.subtitle}</span></h2>
        <p className="opacity-60">{t.categories.desc}</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }} className="glass rounded-3xl p-6 text-center cursor-pointer border border-transparent hover:border-purple-500/50 transition-colors">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} className="text-5xl mb-3">{c.icon}</motion.div>
            <h3 className="font-bold mb-1">{c.name[lang]}</h3>
            <p className="text-xs opacity-60">{c.count} {t.categories.items}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Offers = () => {
  const { t } = useLang();
  return (
    <section id="offers" className="py-20 max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0.2 }} className="relative glass rounded-[3rem] p-8 md:p-12 overflow-hidden border border-white/10">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 mb-4">
              <Tag size={16} /><span className="text-sm font-bold">{t.offers.badge}</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t.offers.title1} <span className="text-gradient">{t.offers.title2}</span> {t.offers.title3}</h2>
            <p className="opacity-70 mb-6">{t.offers.desc}</p>
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }} whileTap={{ scale: 0.95 }} onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold">
              {t.offers.btn}
            </motion.button>
          </motion.div>
          <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="text-center">
            <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&h=500&fit=crop" alt="Gift" className="w-64 h-64 object-cover rounded-full mx-auto shadow-2xl shadow-pink-500/20" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

const About = () => {
  const { t } = useLang();
  return (
    <section id="about" className="py-20 max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }}>
          <h2 className="text-4xl md:text-5xl font-black mb-6">{t.about.title} <span className="text-gradient">{t.about.subtitle}</span></h2>
          <p className="opacity-70 mb-4 leading-relaxed">{t.about.p1}</p>
          <p className="opacity-70 mb-6 leading-relaxed">{t.about.p2}</p>
          <div className="grid grid-cols-3 gap-4">
            {t.about.stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.1, y: -5, boxShadow: "0 0 15px rgba(99, 102, 241, 0.3)" }} className="glass rounded-2xl p-4 text-center border border-white/10">
                <div className="text-2xl font-black text-brand-500">{s.n}</div>
                <div className="text-xs opacity-60">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-[3rem] blur-2xl opacity-30" />
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative glass rounded-[3rem] p-12 text-center border border-white/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=500&fit=crop" alt="Store" className="w-64 h-64 object-cover rounded-3xl mb-4 mx-auto" />
            <h3 className="text-2xl font-black mb-2">{t.about.badge}</h3>
            <p className="opacity-60">{t.about.badgeDesc}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Blog = () => {
  const { lang, t } = useLang();
  return (
    <section id="blog" className="py-20 max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">{t.blog.title} <span className="text-gradient">{t.blog.subtitle}</span></h2>
        <p className="opacity-60">{t.blog.desc}</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {BLOG_POSTS.map((p, i) => (
          <motion.article key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, y: -10, boxShadow: "0 0 25px rgba(99, 102, 241, 0.3)" }} className="glass rounded-3xl overflow-hidden cursor-pointer border border-transparent hover:border-brand-500/30 transition-colors">
            <div className="overflow-hidden">
              <motion.img whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }} src={p.img} alt={p.title[lang]} className="h-48 w-full object-cover" />
            </div>
            <div className="p-6">
              <p className="text-xs opacity-60 mb-2">{p.date[lang]}</p>
              <h3 className="text-xl font-black mb-2">{p.title[lang]}</h3>
              <p className="opacity-60 text-sm mb-4">{p.desc[lang]}</p>
              <motion.button whileHover={{ x: 5 }} className="text-brand-500 font-bold text-sm">{t.blog.readMore}</motion.button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

const Contact = () => {
 const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setSent(true); 
    addToast(t.contact.form.sent, 'success');
    setTimeout(() => setSent(false), 3000); 
    setForm({ name: "", email: "", msg: "" }); 
  };
  return (
    <section id="contact" className="py-20 max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">{t.contact.title} <span className="text-gradient">{t.contact.subtitle}</span></h2>
        <p className="opacity-60">{t.contact.desc}</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[{ icon: MapPin, title: t.contact.addr.title, desc: t.contact.addr.desc }, { icon: Phone, title: t.contact.phone.title, desc: t.contact.phone.desc }, { icon: Mail, title: t.contact.email.title, desc: t.contact.email.desc }].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, x: 10, boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)" }} className="glass rounded-2xl p-6 flex items-center gap-4 border border-white/10">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg">
                <c.icon size={24} className="text-white" />
              </motion.div>
              <div><h4 className="font-bold">{c.title}</h4><p className="text-sm opacity-60">{c.desc}</p></div>
            </motion.div>
          ))}
          <div className="flex gap-3">
            <motion.a href="#" whileHover={{ scale: 1.2, rotate: 15, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/10"><FaTelegram size={20} className="text-blue-400" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.2, rotate: 15, boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)" }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/10"><FaInstagram size={20} className="text-pink-600" /></motion.a>
          </div>
        </div>
        <motion.form initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-4 border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
          <motion.input whileFocus={{ scale: 1.02, boxShadow: "0 0 15px rgba(99, 102, 241, 0.3)" }} type="text" placeholder={t.contact.form.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <motion.input whileFocus={{ scale: 1.02, boxShadow: "0 0 15px rgba(99, 102, 241, 0.3)" }} type="email" placeholder={t.contact.form.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <motion.textarea whileFocus={{ scale: 1.02, boxShadow: "0 0 15px rgba(99, 102, 241, 0.3)" }} placeholder={t.contact.form.msg} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} required rows={5} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)" }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold flex items-center justify-center gap-2">
            <Send size={18} /> {sent ? t.contact.form.sent : t.contact.form.btn}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};

const FAQ = () => {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-20 max-w-4xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">{t.faq.title} <span className="text-gradient">{t.faq.subtitle}</span></h2>
        <p className="opacity-60">{t.faq.desc}</p>
      </motion.div>
      <div className="space-y-4">
        {t.faq.items.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-brand-500/30 transition-colors">
            <motion.button whileHover={{ x: 5 }} onClick={() => setOpen(open === i ? null : i)} className="w-full p-6 text-right flex items-center justify-between font-bold">
              <span>{f.q}</span>
              <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.3 }}>▼</motion.span>
            </motion.button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 opacity-70 text-sm leading-relaxed overflow-hidden">
                  {f.a}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => {
  const { lang, t } = useLang();
  return (
    <footer className="glass border-t border-white/10 mt-20 py-12 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black shadow-lg shadow-brand-500/30">DA</div>
              <span className="text-xl font-black text-gradient">{t.brand}</span>
            </div>
            <p className="text-sm opacity-60">{t.footer.desc}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: 0.1 }}>
            <h4 className="font-bold mb-4">{t.footer.quick}</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#home" className="hover:text-brand-500 transition-all">{t.nav.home}</a></li>
              <li><a href="#products" className="hover:text-brand-500 transition-all">{t.nav.products}</a></li>
              <li><a href="#about" className="hover:text-brand-500 transition-all">{t.nav.about}</a></li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: 0.2 }}>
            <h4 className="font-bold mb-4">{t.footer.services}</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#faq" className="hover:text-brand-500 transition-all">{t.nav.faq}</a></li>
              <li><a href="#contact" className="hover:text-brand-500 transition-all">{t.nav.contact}</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-all">{lang === 'fa' ? 'قوانین' : 'Terms'}</a></li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: 0.3 }}>
            <h4 className="font-bold mb-4">{t.footer.newsletter}</h4>
            <p className="text-sm opacity-60 mb-3">{t.footer.newsletterDesc}</p>
            <div className="flex gap-2">
              <input type="email" placeholder={lang === 'fa' ? 'ایمیل' : 'Email'} className="flex-1 px-3 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)" }} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-bold">{t.footer.subscribe}</motion.button>
            </div>
          </motion.div>
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="border-t border-white/10 pt-8 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <motion.div whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(236, 72, 153, 0.5)" }} className="relative rounded-full p-1 bg-gradient-to-r from-indigo-500 to-pink-500">
              <img src={img} alt="Amir Ali Mohammadi" className="relative w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-900 animate-bounce " />
            </motion.div>
            <div className="text-center">
              <a href="https://amirresume.netlify.app" rel='noopener noreferrer' target='_blank'
               className="text-lg font-bold text-gradient mb-1 animate-float">{t.footer.creator}</a>
              <div className="flex items-center justify-center gap-3">
                <motion.a href="https://linkedin.com/in/amirali-react87" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, y: -2, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-brand-500/20 transition-colors border border-white/10"><FaLinkedin size={18} className="text-blue-600" /></motion.a>
                <motion.a href="https://www.instagram.com/amir_site2026" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, y: -2, boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)" }} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-brand-500/20 transition-colors border border-white/10"><FaInstagram size={18} className="text-pink-600" /></motion.a>
                
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="border-t border-white/10 pt-6 text-center text-sm opacity-60">
          <p>{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};

// ============ TOAST PROVIDER ============
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastCtx.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`pointer-events-auto glass px-6 py-3 rounded-xl border-l-4 shadow-2xl flex items-center gap-3 min-w-[250px] ${
                toast.type === 'success' ? 'border-green-500' : toast.type === 'error' ? 'border-red-500' : 'border-blue-500'
              }`}
            >
              {toast.type === 'success' && <Check size={20} className="text-green-500" />}
              {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
              {toast.type === 'info' && <Zap size={20} className="text-blue-500" />}
              <span className="font-medium text-sm">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
};

// ============ MAIN APP ============
export default function App() {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    const s = localStorage.getItem("theme") as Theme;
    return s || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });
  const [lang, setLang] = useState<Lang>(() => {
    const s = localStorage.getItem("lang") as Lang;
    return s || "fa";
  });
  const [user, setUser] = useState<UserT | null>(() => {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  });
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const s = localStorage.getItem("cart");
    return s ? JSON.parse(s) : [];
  });
  
  const [wishlist, setWishlist] = useState<number[]>(() => {
    const s = localStorage.getItem("wishlist");
    return s ? JSON.parse(s) : [];
  });

  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const toggleLang = () => setLang((l) => (l === "fa" ? "en" : "fa"));

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const e = validateEmail(email); if (e) return { ok: false, msg: e };
    const p = validatePassword(password); if (p) return { ok: false, msg: p };
    const u: UserT = { name: email.split("@")[0], email };
    setUser(u); localStorage.setItem("user", JSON.stringify(u));
    return { ok: true };
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    if (!name.trim()) return { ok: false, msg: lang === 'fa' ? "نام الزامی است" : "Name is required" };
    const e = validateEmail(email); if (e) return { ok: false, msg: e };
    const p = validatePassword(password); if (p) return { ok: false, msg: p };
    const u: UserT = { name, email };
    setUser(u); localStorage.setItem("user", JSON.stringify(u));
    return { ok: true };
  };

  const logout = () => { setUser(null); localStorage.removeItem("user"); };

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === p.id);
      if (exists) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const removeFromCart = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);
  
  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggle: toggleTheme }}>
      <LangCtx.Provider value={{ lang, toggle: toggleLang, t: translations[lang] }}>
        <AuthCtx.Provider value={{ user, login, register, logout }}>
          <CartCtx.Provider value={{ items: cart, add: addToCart, remove: removeFromCart, clear: clearCart, wishlist, toggleWishlist }}>
            <ToastProvider>
              <div className="min-h-screen">
                <AnimatePresence mode="wait">
                  {loading && <LoadingScreen key="loading" onFinish={() => setLoading(false)} />}
                </AnimatePresence>
                
                {!loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Navbar onAuth={() => setShowAuth(true)} onCart={() => setShowCart(true)} />
                    <main className="pt-16">
                      <Hero onAuth={() => setShowAuth(true)} />
                      <Features />
                      <ProductSlider />
                      <Categories />
                      <Offers />
                      <About />
                      <Blog />
                      <Contact />
                      <FAQ />
                    </main>
                    <Footer />
                    <AnimatePresence>{showAuth && <AuthModal key="auth" onClose={() => setShowAuth(false)} />}</AnimatePresence>
                    <AnimatePresence>{showCart && <CartModal key="cart" onClose={() => setShowCart(false)} onAuth={() => { setShowCart(false); setShowAuth(true); }} />}</AnimatePresence>
                  </motion.div>
                )}
              </div>
            </ToastProvider>
          </CartCtx.Provider>
        </AuthCtx.Provider>
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}