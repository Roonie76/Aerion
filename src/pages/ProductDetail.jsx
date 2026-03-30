import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import PageWrapper from '../components/PageWrapper';
import SectionHeading from '../components/SectionHeading';
import { useCart, useAuth } from '../context';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { addItem } = useCart();
  const { request } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const result = await request(`/products/${productId}`);
        if (result.success) {
          setProduct(result.data);
        }
        
        // Final fallback to static data if not found in backend
        if (!product) {
          const staticMatch = STATIC_PRODUCTS.find(p => p.id === productId || p._id === productId);
          if (staticMatch) setProduct(staticMatch);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        // On error, try static data
        const staticMatch = STATIC_PRODUCTS.find(p => p.id === productId || p._id === productId);
        if (staticMatch) setProduct(staticMatch);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    addItem(product);
    navigate('/cart');
  };

  if (loading) {
    return (
      <PageWrapper>
        <section className="section-block page-section">
          <div className="site-container py-20 text-center">
            Fetching model details...
          </div>
        </section>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <section className="section-block page-section">
          <div className="site-container">
            <SectionHeading title="Product Not Found" subtitle="The requested model is unavailable." />
            <Button onClick={() => navigate('/series')}>Back to Series</Button>
          </div>
        </section>
      </PageWrapper>
    );
  }

  const productImage = product.img || product.image;
  const feathers = product.feathers || product.metadata?.feathers;
  const speed = product.speed || product.metadata?.speed;
  const durability = product.durability || product.metadata?.durability;
  const stability = product.stability || product.metadata?.stability;
  const features = product.features || product.metadata?.features || [];

  return (
    <PageWrapper>
      <section className="section-block page-section">
        <div className="site-container">
          <SectionHeading title={product.name} subtitle={product.series} />

          <div className="detail-layout">
            <img
              src={productImage}
              alt={product.name}
              className="detail-image"
              loading="lazy"
              decoding="async"
              width="1200"
              height="1200"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="detail-panel">
              <p className="detail-description">{product.description}</p>

              <div className="detail-specs">
                <p>
                  <strong>Feathers:</strong> {feathers}
                </p>
                <p>
                  <strong>Speed:</strong> {speed}
                </p>
                <p>
                  <strong>Durability:</strong> {durability}
                </p>
                <p>
                  <strong>Stability:</strong> {stability}
                </p>
              </div>

              <div className="detail-tags">
                {features.map((feature) => (
                  <span key={feature}>{feature}</span>
                ))}
              </div>

              <div className="detail-actions">
                <Button onClick={handleAddToCart}>Add to Cart</Button>
                <Button variant="outline" onClick={() => navigate('/series')}>
                  Back to Series
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
