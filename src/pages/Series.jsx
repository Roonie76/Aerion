import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { SkeletonGrid } from '../components/Skeleton';
import { useAuth } from '../context';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';
import { toGA4Item, trackEvent } from '../lib/analytics';

const FILTERS = ['All', 'Professional', 'Intermediate', 'Training'];

const S = {
  hero: {
    position: 'relative',
    padding: 'clamp(96px, 14vw, 140px) clamp(20px, 5vw, 64px) clamp(48px, 8vw, 72px)',
    background: 'radial-gradient(ellipse at 20% 20%, rgba(201,168,76,0.08) 0%, transparent 50%), linear-gradient(180deg, #070708 0%, #030303 100%)',
    borderBottom: '1px solid rgba(201,168,76,0.15)',
    overflow: 'hidden',
  },
  heroInner: { maxWidth: '1400px', margin: '0 auto' },
  crumbs: {
    display: 'flex', gap: '10px', flexWrap: 'wrap',
    fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'rgba(240,237,232,0.5)', marginBottom: 'clamp(24px, 4vw, 40px)',
  },
  crumbLink: { color: '#c9a84c', textDecoration: 'none' },
  heroLayout: {
    display: 'grid', gridTemplateColumns: '1.4fr 1fr',
    gap: '48px', alignItems: 'end',
  },
  eyebrow: {
    fontSize: '0.72rem', letterSpacing: '0.35em',
    textTransform: 'uppercase', color: '#c9a84c', marginBottom: '16px',
  },
  headline: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 'clamp(3.2rem, 7vw, 6rem)', fontWeight: 900,
    letterSpacing: '-0.015em', lineHeight: 0.95,
    color: '#f0ede8', textTransform: 'uppercase', marginBottom: '24px',
  },
  headlineGold: {
    background: 'linear-gradient(180deg, #f3d98b 0%, #c9a84c 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', color: 'transparent',
    fontStyle: 'italic',
    fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
  },
  lede: {
    fontSize: '1.05rem', lineHeight: 1.7,
    color: 'rgba(240,237,232,0.6)', maxWidth: '520px',
  },
  stats: { display: 'flex', gap: '32px', justifyContent: 'flex-end', flexWrap: 'wrap' },
  stat: { textAlign: 'right' },
  statNum: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 900,
    color: '#f0ede8', lineHeight: 1, letterSpacing: '-0.01em',
  },
  statLbl: {
    fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase',
    color: '#c9a84c', marginTop: '8px',
  },
  toolbar: {
    position: 'sticky', top: '64px', zIndex: 40,
    background: 'linear-gradient(180deg, rgba(3,3,3,0.95) 0%, rgba(3,3,3,0.85) 100%)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: 'clamp(14px, 3vw, 20px) clamp(16px, 5vw, 64px)',
    marginBottom: 'clamp(28px, 5vw, 48px)',
  },
  toolbarInner: {
    maxWidth: '1400px', margin: '0 auto',
    display: 'flex', alignItems: 'center',
    gap: '16px', flexWrap: 'wrap',
  },
  searchWrap: { flex: '1 1 240px', position: 'relative', maxWidth: '320px' },
  searchIcon: {
    position: 'absolute', top: '50%', left: '14px',
    transform: 'translateY(-50%)',
    color: 'rgba(240,237,232,0.45)', pointerEvents: 'none',
  },
  searchInput: {
    width: '100%', padding: '12px 14px 12px 40px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f0ede8', fontSize: '0.85rem', letterSpacing: '0.02em',
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 160ms ease',
  },
  filterBar: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  chip: (active) => ({
    padding: '10px 18px',
    background: active ? '#c9a84c' : 'transparent',
    color: active ? '#0b0b0d' : 'rgba(240,237,232,0.75)',
    border: active ? '1px solid #c9a84c' : '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.2em',
    textTransform: 'uppercase', transition: 'all 160ms ease',
  }),
  sort: {
    marginLeft: 'auto',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0ede8', fontSize: '0.78rem', letterSpacing: '0.08em',
    cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
    maxWidth: '100%',
  },
  resultCount: {
    fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase',
    color: 'rgba(240,237,232,0.5)', marginLeft: '8px',
  },
  content: {
    maxWidth: '1400px', margin: '0 auto',
    padding: '0 clamp(16px, 5vw, 64px) clamp(64px, 12vw, 120px)',
  },
};

export default function Series() {
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [query, setQuery] = useState('');
  const auth = useAuth() || {};
  const request = auth.request;
  const listTrackedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        if (typeof request === 'function') {
          const result = await request('/products');
          if (!cancelled && result && result.success && result.data && result.data.length > 0) {
            setProducts(result.data);
          }
        }
      } catch (_) { /* fall back to static */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [request]);

  useEffect(() => {
    if (loading || products.length === 0 || listTrackedRef.current) {
      return;
    }

    trackEvent('view_item_list', {
      item_list_name: 'Flight Series',
      items: products.map((product) => toGA4Item(product)),
    });
    listTrackedRef.current = true;
  }, [loading, products]);

  const displayed = useMemo(() => {
    let list = [...products];
    if (activeFilter !== 'All') {
      list = list.filter((p) => {
        const series = (p.series || '').toLowerCase();
        return series.indexOf(activeFilter.toLowerCase()) > -1;
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        (p.name && p.name.toLowerCase().indexOf(q) > -1) ||
        (p.series && p.series.toLowerCase().indexOf(q) > -1) ||
        (p.description && p.description.toLowerCase().indexOf(q) > -1)
      );
    }
    if (sortOrder === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeFilter, sortOrder, query]);

  const clearAll = () => {
    setActiveFilter('All');
    setQuery('');
    setSortOrder('default');
  };

  return (
    <div style={{ minHeight: '100vh', color: '#f0ede8', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Seo
        title="Flight Series — Tournament & Training Shuttlecocks"
        description="Browse the complete Aerion range: FL-05 training, FL-10 club, and FL-15 tournament shuttlecocks. Speed 76/77, hand-selected feathers."
      />
      <section style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.crumbs}>
            <Link to="/" style={S.crumbLink}>Home</Link>
            <span>/</span>
            <span>Flight Series</span>
          </div>

          <div className="aerion-series-hero" style={S.heroLayout}>
            <div>
              <div style={S.eyebrow}>The Collection</div>
              <h1 style={S.headline}>
                Find your flight.<br />
                <span style={S.headlineGold}>Own your game.</span>
              </h1>
              <p style={S.lede}>
                Three calibrated tiers - training, club, tournament - each engineered
                for the level of precision the player at that level demands. Same
                Aerion standard across the range.
              </p>
            </div>

            <div style={S.stats}>
              <div style={S.stat}>
                <div style={S.statNum}>{products.length}</div>
                <div style={S.statLbl}>Flight Grades</div>
              </div>
              <div style={S.stat}>
                <div style={S.statNum}>76/77</div>
                <div style={S.statLbl}>Speed Spec</div>
              </div>
              <div style={S.stat}>
                <div style={S.statNum}>
                  4.9<span style={{ fontSize: '0.5em', color: '#c9a84c' }}>&#9733;</span>
                </div>
                <div style={S.statLbl}>Player Rating</div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .aerion-series-hero {
              grid-template-columns: 1fr !important;
              gap: 36px !important;
            }
            .aerion-series-hero > div:last-child { justify-content: flex-start !important; }
            .aerion-series-hero > div:last-child > div { text-align: left !important; }
          }
          @media (max-width: 640px) {
            .aerion-series-hero > div:last-child { gap: 20px !important; }
          }
        `}</style>
      </section>

      <div style={S.toolbar}>
        <div style={S.toolbarInner}>
          <div style={S.searchWrap}>
            <label htmlFor="series-search" className="sr-only">Search products</label>
            <Search size={14} style={S.searchIcon} />
            <input
              id="series-search"
              type="search"
              placeholder="Search flight grade..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={S.searchInput}
              onFocus={(e) => { e.target.style.borderColor = '#c9a84c'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>

          <div style={S.filterBar}>
            {FILTERS.map((f) => (
              <button
                key={f} type="button"
                style={S.chip(activeFilter === f)}
                onClick={() => setActiveFilter(f)}
              >{f}</button>
            ))}
          </div>

          <select
            style={S.sort}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort products"
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <span style={S.resultCount} aria-live="polite" aria-atomic="true">
            {displayed.length} result{displayed.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div style={S.content}>
        {loading ? (
          <div role="status" aria-label="Loading collection">
            <SkeletonGrid count={6} />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 32px',
            border: '1px dashed rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <SlidersHorizontal size={32} color="#c9a84c" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.05em', color: '#f0ede8', marginBottom: '12px' }}>
              No Matches Found
            </h3>
            <p style={{ color: 'rgba(240,237,232,0.55)', marginBottom: '24px' }}>
              No products match your current filters.
            </p>
            <button type="button" className="lu-btn-ghost" onClick={clearAll} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <X size={14} /> Clear Filters
            </button>
          </div>
        ) : (
          <div className="lu-products-grid">
            {displayed.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
