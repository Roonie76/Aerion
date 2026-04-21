// UPDATED: Interactive Product Card with 3D Tilt and Motion
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import Button from './Button';
import Picture from './Picture';
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
  const { cartItems, addItem, removeItem } = useCart();
  
  // UPDATED: Subtle 3D Tilt Effect
  const tiltRef = useTiltEffect(5, 1000);
  
  const productId = product.id || product._id;
  const productImage = product.img || product.image;

  // NEW: Get current quantity in cart
  const cartItem = cartItems.find(item => (item._id || item.id) === productId);
  const quantity = cartItem ? cartItem.quantity : 0;
  const openProduct = () => navigate(`/product/${productId}`);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleRemoveOne = (e) => {
    e.stopPropagation();
    removeItem(productId);
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProduct();
    }
  };

  return (
    <article 
      ref={tiltRef} 
      className="product-card animate-on-scroll"
      onClick={openProduct}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`${product.name} details`}
    >
      <div className="product-card-image-wrap">
        <Picture
          src={productImage}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 33vw"
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
          
          {quantity > 0 ? (
            <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="qty-btn" onClick={handleRemoveOne} aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className="qty-value">{quantity}</span>
              <button type="button" className="qty-btn" onClick={handleAddToCart} aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <Button className="product-card-cta" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
