// UPDATED: Interactive Product Card with 3D Tilt and Motion
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useCart } from '../context';
import useTiltEffect from '../hooks/useTiltEffect';

import gsap from 'gsap';

// NEW: Refined Price Counter using GSAP
function PriceCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef(null);
  const proxy = useRef({ val: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(proxy.current, {
            val: parseInt(value),
            duration: 2,
            ease: "power3.out",
            onUpdate: () => setDisplayValue(Math.floor(proxy.current.val))
          });
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={countRef}>INR {displayValue.toLocaleString()}</span>;
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  // UPDATED: 3D Tilt Effect
  const tiltRef = useTiltEffect(10, 1000);
  
  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  const productId = product.id || product._id;
  const productImage = product.img || product.image;

  return (
    <article 
      ref={tiltRef} 
      className="product-card animate-on-scroll"
      onClick={() => navigate(`/product/${productId}`)}
    >
      <div className="product-card-image-wrap">
        <img
          src={productImage}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
      </div>

      <div className="product-card-body">
        <div className="product-card-headline">
          <h3>{product.name}</h3>
          <p className="product-price">
            <PriceCounter value={product.price} />
          </p>
        </div>

        <p className="product-category">{product.series}</p>
        <p className="product-description line-clamp-2">{product.description}</p>

        <div className="product-card-actions">
          <Button variant="outline" className="product-card-cta">
            Details
          </Button>
          <Button className="product-card-cta" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}
