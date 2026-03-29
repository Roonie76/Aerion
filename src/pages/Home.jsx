import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageWrapper from '../components/PageWrapper';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import Hero3D from '../components/Hero3D';
import { PRODUCTS } from '../data/products';
import useScrollAnimation from '../hooks/useScrollAnimation';

export default function Home() {
  const navigate = useNavigate();
  const gridRef = useRef(null);
  
  // UPDATED: Scroll Animations for the product grid
  useScrollAnimation(gridRef, 0.15);

  return (
    <PageWrapper>
      {/* NEW: 3D HERO SECTION */}
      <Hero3D />

      <section className="section-block">
        <div className="site-container">
          <SectionHeading
            title="Flight Collection"
            subtitle="Standardized excellence for every level of play."
          />

          <div ref={gridRef} className="product-grid">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-block section-alt">
        <div className="site-container performance-grid animate-on-scroll">
          <div className="performance-copy">
            <h2>Pure Performance</h2>
            <p>
              Every AERION shuttle passes controlled tuning for rotation, drag profile, and impact durability,
              delivering repeatable trajectories under competitive pressure.
            </p>
            <Link to="/about" className="performance-link">
              Learn More <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="stat-grid">
            <article className="stat-card">
              <p className="stat-value stat-red">100%</p>
              <p className="stat-label">Consistency</p>
            </article>
            <article className="stat-card">
              <p className="stat-value">18+</p>
              <p className="stat-label">QC Checks</p>
            </article>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
