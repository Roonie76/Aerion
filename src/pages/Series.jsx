import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';

const FILTERS = ['All', 'Professional', 'Intermediate', 'Training'];

export default function Series() {
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const { request } = useAuth();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const result = await request('/products');
        if (result.success && result.data.length > 0) {
          setProducts(result.data);
        }
      } catch {
        // fallback to static data
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const displayed = useMemo(() => {
    let list = [...products];
    if (activeFilter !== 'All') {
      list = list.filter((p) => {
        const series = (p.series || '').toLowerCase();
        return series.includes(activeFilter.toLowerCase());
      });
    }
    if (sortOrder === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeFilter, sortOrder]);

  return (
    <section className="lu-section" style={{ minHeight: '100vh' }}>
      <div className="lu-container">
        <div className="lu-section-header">
          <p className="lu-overline">The Collection</p>
          <h1 className="lu-section-title">Flight Series</h1>
          <p className="lu-section-sub">Find your speed, feel, and durability standard.</p>
        </div>

        {/* Controls */}
        <div className="lu-series-controls">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`lu-filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
          <select
            className="lu-sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort products"
          >
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            Loading collection…
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>No products match this filter.</p>
            <button className="lu-btn-ghost" onClick={() => setActiveFilter('All')}>Clear Filter</button>
          </div>
        ) : (
          <div className="lu-products-grid">
            {displayed.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
