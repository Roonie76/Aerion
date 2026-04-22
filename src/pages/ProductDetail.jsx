import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart, Minus, Plus, Check, ShieldCheck, Truck, RotateCcw,
  ArrowLeft, Feather, Gauge, Activity, Target,
} from 'lucide-react';
import { useCart, useAuth } from '../context';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';
import { toGA4Item, trackEvent } from '../lib/analytics';
import Picture from '../components/Picture';
import Seo from '../components/Seo';
import Skeleton from '../components/Skeleton';

const S = {
  page: {
    minHeight: '100vh',
    padding: 'clamp(96px, 14vw, 140px) clamp(16px, 5vw, 64px) clamp(64px, 12vw, 120px)',
    background: 'radial-gradient(ellipse at 70% 0%, rgba(201,168,76,0.06) 0%, transparent 55%), linear-gradient(180deg, #070708 0%, #030303 100%)',
    color: '#f0ede8',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  container: { maxWidth: '1400px', margin: '0 auto' },
  crumbs: {
    display: 'flex', alignItems: 'center', gap: '10px',
    fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'rgba(240,237,232,0.45)', marginBottom: '40px',
  },
  crumbLink: { color: '#c9a84c', textDecoration: 'none' },
  layout: { display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '64px', alignItems: 'start' },
  gallery: { position: 'sticky', top: '120px' },
  stage: {
    position: 'relative', aspectRatio: '1 / 1',
    background: 'radial-gradient(circle at 50% 40%, rgba(201,168,76,0.12) 0%, rgba(0,0,0,0) 65%), linear-gradient(145deg, #141416 0%, #08080a 100%)',
    border: '1px solid rgba(201,168,76,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  stageImg: {
    width: '78%', height: '78%', objectFit: 'contain',
    filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))',
    transition: 'transform 400ms ease',
  },
  stageNoise: {
    position: 'absolute', inset: 0,
    background: 'repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.015) 0, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)',
    pointerEvents: 'none', mixBlendMode: 'overlay',
  },
  stageMark: {
    position: 'absolute', top: '20px', left: '20px',
    fontSize: '0.62rem', letterSpacing: '0.32em',
    color: 'rgba(201,168,76,0.8)', textTransform: 'uppercase',
  },
  thumbs: { display: 'flex', gap: '12px', marginTop: '16px' },
  thumb: (active) => ({
    flex: 1, aspectRatio: '1 / 1',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.6) 100%)',
    border: active ? '1px solid #c9a84c' : '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer', padding: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 180ms ease',
  }),
  thumbImg: { width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))' },
  series: { fontSize: '0.7rem', letterSpacing: '0.32em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '12px' },
  title: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', fontWeight: 900,
    letterSpacing: '-0.01em', lineHeight: 0.95,
    color: '#f0ede8', marginBottom: '20px', textTransform: 'uppercase',
  },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '28px' },
  price: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '2.2rem', fontWeight: 700, color: '#f0ede8', letterSpacing: '0.02em',
  },
  priceUnit: { fontSize: '0.75rem', color: 'rgba(240,237,232,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' },
  stock: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontSize: '0.72rem', color: '#4ade80', letterSpacing: '0.2em',
    textTransform: 'uppercase', marginBottom: '24px',
  },
  stockDot: {
    width: '8px', height: '8px', background: '#4ade80',
    borderRadius: '50%', boxShadow: '0 0 10px rgba(74,222,128,0.8)',
  },
  desc: { fontSize: '1rem', lineHeight: 1.8, color: 'rgba(240,237,232,0.65)', marginBottom: '36px', maxWidth: '540px' },
  specsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px',
    marginBottom: '40px', padding: '24px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(201,168,76,0.12)',
  },
  specItem: { display: 'flex', gap: '14px', alignItems: 'flex-start' },
  specIcon: {
    width: '36px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(201,168,76,0.08)',
    border: '1px solid rgba(201,168,76,0.25)',
    color: '#c9a84c', flexShrink: 0,
  },
  specLabel: { fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(240,237,232,0.45)', textTransform: 'uppercase', marginBottom: '4px' },
  specValue: { fontSize: '0.92rem', fontWeight: 600, color: '#f0ede8', letterSpacing: '0.02em' },
  metersTitle: { fontSize: '0.7rem', letterSpacing: '0.3em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '16px' },
  meter: { marginBottom: '16px' },
  meterLabelRow: {
    display: 'flex', justifyContent: 'space-between',
    marginBottom: '8px', fontSize: '0.78rem', color: 'rgba(240,237,232,0.75)',
  },
  meterTrack: {
    height: '4px', background: 'rgba(255,255,255,0.06)',
    position: 'relative', overflow: 'hidden',
  },
  meterFill: (pct) => ({
    position: 'absolute', inset: '0 auto 0 0', width: pct + '%',
    background: 'linear-gradient(90deg, #c9a84c 0%, #f3d98b 100%)',
    transition: 'width 800ms ease',
  }),
  featureList: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '24px', marginBottom: '40px' },
  featurePill: {
    padding: '10px 16px', fontSize: '0.78rem',
    color: 'rgba(240,237,232,0.75)',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(201,168,76,0.2)',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
  },
  qtyRow: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' },
  qtyBox: {
    display: 'flex', alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.02)',
  },
  qtyBtn: {
    width: '44px', height: '44px', background: 'transparent', border: 'none',
    color: '#c9a84c', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyCount: {
    width: '44px', height: '44px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.95rem', fontWeight: 700, color: '#f0ede8',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  },
  qtyLabel: { fontSize: '0.7rem', letterSpacing: '0.25em', color: 'rgba(240,237,232,0.5)', textTransform: 'uppercase' },
  ctaRow: { display: 'flex', gap: '12px', marginBottom: '32px' },
  cta: {
    flex: 1, padding: '18px 24px', background: '#c9a84c', color: '#0b0b0d',
    border: 'none', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.22em',
    textTransform: 'uppercase', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    transition: 'all 180ms ease',
  },
  ctaGhost: {
    padding: '18px 24px', background: 'transparent', color: '#f0ede8',
    border: '1px solid rgba(240,237,232,0.25)',
    fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.22em',
    textTransform: 'uppercase', cursor: 'pointer',
    transition: 'all 180ms ease',
  },
  benefits: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', padding: '20px',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.015)',
  },
  benefit: { display: 'flex', gap: '10px', alignItems: 'center' },
  benefitIcon: { color: '#c9a84c' },
  benefitTxt: { fontSize: '0.72rem', color: 'rgba(240,237,232,0.6)', lineHeight: 1.4 },
  relatedSection: { marginTop: '120px' },
  relatedHead: {
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: '32px',
  },
  relatedTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900,
    letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#f0ede8',
  },
  relatedOverline: {
    fontSize: '0.68rem', letterSpacing: '0.3em', color: '#c9a84c',
    textTransform: 'uppercase', marginBottom: '10px',
  },
  relatedGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  relatedCard: {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.4) 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    textDecoration: 'none', color: 'inherit',
    display: 'flex', flexDirection: 'column',
    transition: 'all 240ms ease',
  },
  relatedImg: { aspectRatio: '1/1', width: '100%', objectFit: 'cover' },
  relatedBody: { padding: '20px' },
};

const GRADE_MAP = {
  low: 55, medium: 70, high: 85, supreme: 98,
  consistent: 75, elite: 88, perfect: 98, professional: 88,
};
const gradePct = (val) => {
  if (!val) return 70;
  const key = String(val).toLowerCase().trim();
  return GRADE_MAP[key] != null ? GRADE_MAP[key] : 75;
};

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { addItem } = useCart();
  const auth = useAuth() || {};
  const request = auth.request;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      let resolved = null;
      try {
        if (typeof request === 'function') {
          const result = await request('/products/' + productId);
          if (result && result.success && result.data) resolved = result.data;
        }
      } catch (_) { /* fall through */ }
      if (!resolved) {
        resolved = STATIC_PRODUCTS.find((p) => p.id === productId || p._id === productId);
      }
      if (!cancelled) { setProduct(resolved || null); setLoading(false); }
    }
    setLoading(true);
    fetchProduct();
    return () => { cancelled = true; };
  }, [productId, request]);

  useEffect(() => {
    if (!product) return;

    trackEvent('view_item', {
      currency: 'INR',
      value: Number(product.price) || 0,
      items: [toGA4Item(product)],
    });
  }, [product]);

  const related = useMemo(
    () => STATIC_PRODUCTS.filter((p) => p.id !== productId).slice(0, 3),
    [productId]
  );

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addItem(product);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.container} role="status" aria-label="Loading product">
          <Skeleton height="12px" width="180px" style={{ marginBottom: '40px' }} />
          <div className="aerion-pdp-layout" style={S.layout}>
            <div>
              <Skeleton height="520px" />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <Skeleton height="72px" width="33%" />
                <Skeleton height="72px" width="33%" />
                <Skeleton height="72px" width="33%" />
              </div>
            </div>
            <div style={{ paddingTop: '8px' }}>
              <Skeleton height="10px" width="120px" style={{ marginBottom: '16px' }} />
              <Skeleton height="48px" width="80%" style={{ marginBottom: '20px' }} />
              <Skeleton height="28px" width="40%" style={{ marginBottom: '28px' }} />
              <Skeleton height="14px" width="100%" style={{ marginBottom: '10px' }} />
              <Skeleton height="14px" width="92%" style={{ marginBottom: '10px' }} />
              <Skeleton height="14px" width="70%" style={{ marginBottom: '36px' }} />
              <Skeleton height="120px" style={{ marginBottom: '28px' }} />
              <Skeleton height="52px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={S.page}>
        <Seo title="Product Not Found" noindex />
        <div style={{ ...S.container, textAlign: 'center', paddingTop: '120px' }}>
          <p style={S.series}>404 &middot; Model Unavailable</p>
          <h1 style={S.title}>Product Not Found</h1>
          <p style={S.desc}>The requested shuttlecock could not be located in our inventory.</p>
          <Link to="/series" style={{ ...S.ctaGhost, display: 'inline-block' }}>Back to Flight Series</Link>
        </div>
      </div>
    );
  }

  const productImage = product.img || product.image;
  const feathers   = product.feathers   || (product.metadata && product.metadata.feathers);
  const speed      = product.speed      || (product.metadata && product.metadata.speed);
  const durability = product.durability || (product.metadata && product.metadata.durability);
  const stability  = product.stability  || (product.metadata && product.metadata.stability);
  const features   = product.features   || (product.metadata && product.metadata.features) || [];
  const price      = product.price != null ? product.price : 0;

  const seoTitle = product.name + (product.series ? ' — ' + product.series : '');
  const seoDesc  = product.description || 'Tournament-grade Aerion shuttlecock. Precision feathers, calibrated cork, tested flight.';
  const absImage = productImage && productImage.indexOf('http') === 0
    ? productImage
    : 'https://aerionsports.com' + (productImage && productImage.indexOf('/') === 0 ? productImage : '/' + (productImage || ''));
  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: seoDesc,
    image: absImage,
    sku: product.id || product._id,
    brand: { '@type': 'Brand', name: 'Aerion' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: price,
      availability: 'https://schema.org/InStock',
      url: 'https://aerionsports.com/product/' + (product.id || product._id || ''),
    },
  };

  return (
    <div style={S.page}>
      <Seo
        title={seoTitle}
        description={seoDesc}
        image={absImage}
        type="product"
        jsonLd={productJsonLd}
      />
      <div style={S.container}>
        <div style={S.crumbs}>
          <Link to="/" style={S.crumbLink}>Home</Link>
          <span>/</span>
          <Link to="/series" style={S.crumbLink}>Flight Series</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="aerion-pdp-layout" style={S.layout}>
          <div style={S.gallery}>
            <div style={S.stage}>
              <div style={S.stageMark}>Flight &middot; {product.name}</div>
              <Picture
                src={productImage}
                alt={product.name}
                style={S.stageImg}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 900px) 100vw, 50vw"
                widths={[480, 800, 1200, 1800]}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const dx = (e.clientX - r.left - r.width / 2) / 20;
                  const dy = (e.clientY - r.top - r.height / 2) / 20;
                  e.currentTarget.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.03)';
                }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0) scale(1)'; }}
              />
              <div style={S.stageNoise} aria-hidden="true" />
            </div>

            <div className="aerion-pdp-thumbs" style={S.thumbs}>
              {[0, 1, 2].map((i) => (
                <button key={i} type="button" onClick={() => setActiveImg(i)}
                  style={S.thumb(activeImg === i)} aria-label={'View angle ' + (i + 1)}>
                  <img src={productImage} alt="" style={{ ...S.thumbImg, filter: 'brightness(' + (1 - i * 0.1) + ')' }} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '8px' }}>
            <div style={S.series}>{product.series || 'Flight Series'}</div>
            <h1 style={S.title}>{product.name}</h1>

            <div style={S.priceRow}>
              <span style={S.price}>&#8377;{price.toLocaleString('en-IN')}</span>
              <span style={S.priceUnit}>/ tube of 6</span>
            </div>

            <div style={S.stock}><span style={S.stockDot} /> In Stock &middot; Ships Today</div>
            <p style={S.desc}>{product.description}</p>

            <div className="aerion-pdp-specs" style={S.specsGrid}>
              <div style={S.specItem}>
                <div style={S.specIcon}><Feather size={16} /></div>
                <div><div style={S.specLabel}>Feathers</div><div style={S.specValue}>{feathers || 'Grade A'}</div></div>
              </div>
              <div style={S.specItem}>
                <div style={S.specIcon}><Gauge size={16} /></div>
                <div><div style={S.specLabel}>Speed</div><div style={S.specValue}>{speed || '76/77'}</div></div>
              </div>
              <div style={S.specItem}>
                <div style={S.specIcon}><Activity size={16} /></div>
                <div><div style={S.specLabel}>Durability</div><div style={S.specValue}>{durability || 'High'}</div></div>
              </div>
              <div style={S.specItem}>
                <div style={S.specIcon}><Target size={16} /></div>
                <div><div style={S.specLabel}>Stability</div><div style={S.specValue}>{stability || 'Consistent'}</div></div>
              </div>
            </div>

            <div style={S.metersTitle}>Performance Profile</div>
            {[
              { label: 'Durability', val: durability },
              { label: 'Stability', val: stability },
              { label: 'Feel & Control', val: feathers && feathers.indexOf('A+') > -1 ? 'Supreme' : feathers && feathers.indexOf('A') > -1 ? 'Elite' : 'High' },
            ].map((m) => (
              <div key={m.label} style={S.meter}>
                <div style={S.meterLabelRow}>
                  <span>{m.label}</span>
                  <span style={{ color: '#c9a84c' }}>{m.val || '-'}</span>
                </div>
                <div style={S.meterTrack}><div style={S.meterFill(gradePct(m.val))} /></div>
              </div>
            ))}

            {features.length > 0 && (
              <div style={S.featureList}>
                {features.map((f) => (
                  <span key={f} style={S.featurePill}>
                    <Check size={13} style={{ color: '#c9a84c' }} /> {f}
                  </span>
                ))}
              </div>
            )}

            <div style={S.qtyRow}>
              <span style={S.qtyLabel}>Quantity</span>
              <div style={S.qtyBox}>
                <button type="button" style={S.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><Minus size={14} /></button>
                <div style={S.qtyCount}>{qty}</div>
                <button type="button" style={S.qtyBtn} onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase"><Plus size={14} /></button>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'rgba(240,237,232,0.5)' }}>
                Total: <strong style={{ color: '#f0ede8' }}>&#8377;{(price * qty).toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <div className="aerion-pdp-ctarow" style={S.ctaRow}>
              <button type="button" style={{ ...S.cta, background: added ? '#4ade80' : '#c9a84c' }} onClick={handleAddToCart}>
                {added ? (<><Check size={16} /> Added</>) : (<><ShoppingCart size={16} /> Add to Cart</>)}
              </button>
              <button type="button" style={S.ctaGhost} onClick={handleBuyNow}>Buy Now</button>
            </div>

            <div className="aerion-pdp-benefits" style={S.benefits}>
              <div style={S.benefit}>
                <ShieldCheck size={18} style={S.benefitIcon} />
                <div style={S.benefitTxt}>Secure checkout &middot; SSL &amp; Razorpay</div>
              </div>
              <div style={S.benefit}>
                <Truck size={18} style={S.benefitIcon} />
                <div style={S.benefitTxt}>Free shipping over &#8377;2,000</div>
              </div>
              <div style={S.benefit}>
                <RotateCcw size={18} style={S.benefitIcon} />
                <div style={S.benefitTxt}>7-day hassle-free returns</div>
              </div>
            </div>

            <Link to="/series" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '32px', color: 'rgba(240,237,232,0.55)', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              <ArrowLeft size={14} /> Back to Flight Series
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section style={S.relatedSection}>
            <div className="aerion-pdp-related-head" style={S.relatedHead}>
              <div>
                <div style={S.relatedOverline}>Complete the Kit</div>
                <h2 style={S.relatedTitle}>You May Also Like</h2>
              </div>
              <Link to="/series" style={{ color: '#c9a84c', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                View All &rarr;
              </Link>
            </div>

            <div style={S.relatedGrid}>
              {related.map((p) => (
                <Link key={p.id} to={'/product/' + p.id} style={S.relatedCard}>
                  <Picture src={p.img} alt={p.name} style={S.relatedImg} loading="lazy" sizes="(max-width: 900px) 100vw, 33vw" />
                  <div style={S.relatedBody}>
                    <div style={{ ...S.series, marginBottom: '8px' }}>{p.series}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.02em', marginBottom: '8px' }}>
                      {p.name}
                    </div>
                    <div style={{ color: '#c9a84c', fontWeight: 700 }}>
                      &#8377;{(p.price || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @media (max-width: 968px) {
          .aerion-pdp-layout { grid-template-columns: 1fr !important; gap: 48px !important; }
          .aerion-pdp-layout > div:first-child { position: static !important; }
        }
        @media (max-width: 640px) {
          .aerion-pdp-specs { grid-template-columns: 1fr !important; gap: 16px !important; padding: 18px !important; }
          .aerion-pdp-benefits { grid-template-columns: 1fr !important; gap: 14px !important; padding: 16px !important; }
          .aerion-pdp-ctarow { flex-direction: column !important; }
          .aerion-pdp-ctarow > button { width: 100% !important; }
          .aerion-pdp-related-head { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .aerion-pdp-thumbs { gap: 8px !important; }
        }
      `}</style>
    </div>
  );
}
