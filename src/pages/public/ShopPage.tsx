import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { formatNaira } from '../../utils/formatters';
import {
  Search,
  SlidersHorizontal,
  Tag,
  Phone,
  Mail,
  MapPin,
  Package,
  ChevronRight,
  X,
  Menu,
  CheckCircle,
  Star,
  Sparkles,
} from 'lucide-react';

const WHATSAPP = '2348136826000';
const PHONE_1 = '08136826000';
const PHONE_2 = '08156217376';
const EMAIL = 'archcityrealty1234@gmail.com';
const ADDRESS = 'No39 Tanke Iledu, Ilorin';
const COMPANY = 'Archcity Realty';

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const PlaceholderImage: React.FC<{ name: string }> = ({ name }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-500">
    <Package className="w-10 h-10 opacity-50" />
    <span className="text-[10px] font-semibold mt-1 opacity-50 text-center px-2 line-clamp-1">{name}</span>
  </div>
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const price = product.sellingPricePerUnit;
  return (
    <Link
      to={`/shop/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-52 bg-blue-50 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <PlaceholderImage name={product.name} />
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold uppercase backdrop-blur-sm">
            {product.categoryName || 'Item'}
          </span>
        </div>
        {product.quantityRemaining <= 3 && product.quantityRemaining > 0 && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold backdrop-blur-sm">
              Only {product.quantityRemaining} left!
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            {price && price > 0 ? (
              <span className="text-lg font-extrabold text-blue-700">{formatNaira(price)}</span>
            ) : (
              <span className="text-sm font-semibold text-slate-400 italic">Price on request</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
            View <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
    <div className="h-52 bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-slate-200 rounded-full w-3/4" />
      <div className="h-3 bg-slate-200 rounded-full w-1/2" />
      <div className="h-5 bg-slate-200 rounded-full w-1/3 mt-4" />
    </div>
  </div>
);

export const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProducts = useCallback(
    debounce(async (cat: string, q: string) => {
      setLoading(true);
      try {
        const data = await api.publicInventory.getAvailable({
          categoryId: cat !== 'ALL' ? cat : undefined,
          search: q || undefined,
        });
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    api.publicInventory.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory, search);
  }, [selectedCategory, search, fetchProducts]);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setSidebarOpen(false);
  };

  // Sidebar content (shared between mobile drawer and desktop)
  const SidebarContent = () => (
    <nav className="space-y-1">
      <button
        onClick={() => handleCategorySelect('ALL')}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
          selectedCategory === 'ALL'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
        }`}
      >
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        All Items
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategorySelect(cat.id)}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
            selectedCategory === cat.id
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
          }`}
        >
          <Tag className="w-4 h-4 flex-shrink-0" />
          {cat.name}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">

      {/* ── Top Navigation ────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-600/30">
                <Star className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <span className="text-base font-extrabold text-blue-900 leading-none">{COMPANY}</span>
                <p className="text-[9px] text-blue-400 font-semibold uppercase tracking-wider leading-none mt-0.5">Quality Pre-owned Items</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-semibold"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-green-500/30"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>
      </header>

      {/* ── Mobile sidebar drawer ─────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl p-6 overflow-y-auto lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Browse Categories</h3>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}

      {/* ── Hero Banner ───────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-4">
              <CheckCircle className="w-3.5 h-3.5 text-green-300" />
              <span>Verified Quality Items — All in Excellent Condition</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Quality Pre-owned Items<br />
              <span className="text-blue-200">at the Best Prices</span>
            </h1>
            <p className="mt-3 text-blue-100 text-sm md:text-base max-w-lg">
              Browse our collection of carefully selected, fairly used home and office items.
              Every item is in great condition and ready to use.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={`tel:${PHONE_1}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50 transition shadow-md"
              >
                <Phone className="w-4 h-4" />
                Call Us Now
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi%2C%20I%20found%20your%20store%20and%20I%27m%20interested%20in%20an%20item.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-sm transition shadow-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.853L.057 23.25c-.07.247.162.475.408.398l5.524-1.765A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.015-1.381l-.36-.214-3.728 1.191 1.21-3.645-.235-.373A9.81 9.81 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 sticky top-24">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Categories</h3>
              <SidebarContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedCategory === 'ALL'
                    ? 'All Available Items'
                    : categories.find((c) => c.id === selectedCategory)?.name || 'Items'}
                </h2>
                {!loading && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {products.length} {products.length === 1 ? 'item' : 'items'} found
                  </p>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Categories
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-blue-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No items found</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-xs">
                  {search
                    ? `No items matching "${search}". Try a different search term.`
                    : 'No items available in this category right now. Check back soon!'}
                </p>
                {(search || selectedCategory !== 'ALL') && (
                  <button
                    onClick={() => { setSearch(''); setSelectedCategory('ALL'); }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    View All Items
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="bg-blue-900 text-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="text-base font-extrabold text-white">{COMPANY}</span>
              </div>
              <p className="text-sm text-blue-300 leading-relaxed">
                Your trusted source for quality pre-owned home and office items in Ilorin.
              </p>
              <p className="text-[11px] text-blue-500 mt-2">RC: 3720926</p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">Contact Us</h4>
              <ul className="space-y-2 text-sm text-blue-300">
                <li>
                  <a href={`tel:${PHONE_1}`} className="flex items-center gap-2 hover:text-white transition">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {PHONE_1}
                  </a>
                </li>
                <li>
                  <a href={`tel:${PHONE_2}`} className="flex items-center gap-2 hover:text-white transition">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {PHONE_2}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-white transition">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{ADDRESS}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">Chat With Us</h4>
              <p className="text-sm text-blue-300 mb-4">
                Interested in an item? Message us directly on WhatsApp!
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi%2C%20I%27m%20interested%20in%20buying%20an%20item%20from%20your%20store.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-sm transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.853L.057 23.25c-.07.247.162.475.408.398l5.524-1.765A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.015-1.381l-.36-.214-3.728 1.191 1.21-3.645-.235-.373A9.81 9.81 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" />
                </svg>
                Open WhatsApp
              </a>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-8 pt-6 text-center text-xs text-blue-500">
            © {new Date().getFullYear()} {COMPANY}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
