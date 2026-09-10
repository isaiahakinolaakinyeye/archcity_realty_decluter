import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Product } from '../../types';
import { formatNaira } from '../../utils/formatters';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Package,
  Tag,
  CheckCircle2,
  AlertCircle,
  Layers,
  Star,
  MapPin,
  Mail,
  Calendar,
} from 'lucide-react';

const WHATSAPP = '2348136826000';
const PHONE_1 = '08136826000';
const PHONE_2 = '08156217376';
const EMAIL = 'archcityrealty1234@gmail.com';
const ADDRESS = 'No39 Tanke Iledu, Ilorin';
const COMPANY = 'Archcity Realty';

const formatDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.publicInventory
      .getById(id)
      .then((p) => setProduct(p))
      .catch(() => setError('Item not found or no longer available.'))
      .finally(() => setLoading(false));
  }, [id]);

  const whatsappMsg = product
    ? `Hi, I found your store online and I'm interested in buying the *${product.name}*. Is it still available?`
    : "Hi, I'm interested in an item from your store.";

  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">

      {/* ── Nav ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                to="/shop"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Shop</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow">
                <Star className="w-3.5 h-3.5 text-white" fill="white" />
              </div>
              <span className="text-sm font-extrabold text-blue-900">{COMPANY}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            <div className="rounded-2xl bg-slate-200 h-80 md:h-[420px]" />
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-slate-200 rounded-full w-1/4" />
              <div className="h-7 bg-slate-200 rounded-full w-3/4" />
              <div className="h-5 bg-slate-200 rounded-full w-1/3 mt-6" />
              <div className="h-12 bg-slate-200 rounded-xl mt-8" />
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-14 h-14 text-red-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-700">{error}</h2>
            <Link
              to="/shop"
              className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
            >
              Browse All Items
            </Link>
          </div>
        )}

        {/* Product */}
        {!loading && product && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

            {/* Image */}
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden bg-blue-50 border border-blue-100 shadow-sm aspect-square max-h-[460px]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-blue-300">
                    <Package className="w-16 h-16" />
                    <p className="text-sm font-semibold mt-3 text-blue-400">No image available</p>
                  </div>
                )}
              </div>

              {/* Business trust card */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sold by</p>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0 shadow">
                    <Star className="w-5 h-5 text-white" fill="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{COMPANY}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <p className="text-xs text-slate-500 truncate">{ADDRESS}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <a
                    href={`tel:${PHONE_1}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition"
                  >
                    <Phone className="w-3 h-3" /> {PHONE_1}
                  </a>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition truncate"
                  >
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{EMAIL}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Category + availability */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  <Tag className="w-3 h-3" />
                  {(product as any).categoryName || 'Item'}
                </span>
                {product.quantityRemaining > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {product.quantityRemaining === 1 ? 'Last one!' : `${product.quantityRemaining} available`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    <AlertCircle className="w-3 h-3" />
                    Sold Out
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="p-5 bg-white rounded-2xl border border-blue-100 shadow-sm">
                {product.sellingPricePerUnit && product.sellingPricePerUnit > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-3xl font-extrabold text-blue-700">
                      {formatNaira(product.sellingPricePerUnit)}
                    </p>
                    {product.quantityPurchased > 1 && (
                      <p className="text-xs text-slate-400 mt-1">per unit · {product.quantityRemaining} in stock</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-xl font-bold text-slate-500 italic">Contact us for price</p>
                    <p className="text-xs text-slate-400 mt-1">Message us on WhatsApp or call for the best price.</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
                  <Layers className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Quantity</p>
                  <p className="font-bold text-slate-800 text-sm">{product.quantityPurchased}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Available</p>
                  <p className="font-bold text-slate-800 text-sm">{product.quantityRemaining}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
                  <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">Listed</p>
                  <p className="font-bold text-slate-800 text-[11px]">{formatDate(product.purchaseDate)}</p>
                </div>
              </div>

              {/* CTA Buttons */}
              {product.quantityRemaining > 0 ? (
                <div className="space-y-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-extrabold rounded-2xl text-base transition shadow-lg shadow-green-500/30 active:scale-95"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.853L.057 23.25c-.07.247.162.475.408.398l5.524-1.765A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.015-1.381l-.36-.214-3.728 1.191 1.21-3.645-.235-.373A9.81 9.81 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" />
                    </svg>
                    Message on WhatsApp
                  </a>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${PHONE_1}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-600/25 active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      {PHONE_1}
                    </a>
                    <a
                      href={`tel:${PHONE_2}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl text-sm transition active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      {PHONE_2}
                    </a>
                  </div>

                  <p className="text-center text-xs text-slate-400">
                    Available Mon – Sat · Fast response guaranteed
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                    <p className="font-bold text-red-700">This item is currently sold out.</p>
                    <p className="text-sm text-red-500 mt-1">Contact us — we may have similar items available.</p>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-extrabold rounded-2xl text-base transition shadow-lg shadow-green-500/30"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Ask About Similar Items
                  </a>
                </div>
              )}

              {/* Browse more */}
              <Link
                to="/shop"
                className="flex items-center justify-center gap-2 w-full py-3 border border-blue-200 text-blue-700 font-semibold rounded-xl text-sm hover:bg-blue-50 transition"
              >
                Browse More Items
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
