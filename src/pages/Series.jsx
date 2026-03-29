import React, { useEffect, useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';

export default function Series() {
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setProducts(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <PageWrapper>
      <section className="section-block page-section">
        <div className="site-container">
          <SectionHeading title="Flight Series" subtitle="Find your speed, feel, and durability standard." />
          
          {loading ? (
            <div className="text-center py-20">Loading our collection...</div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
