// UPDATED: Standardized Cinematic App Container
import React, { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Lenis from 'lenis'; // FIXED
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { About, Contact, Cart, Home, ProductDetail, Series, Login, Register, Account } from './pages';

export default function App() {
  const location = useLocation();

  const lenisRef = useRef(null);

  useEffect(() => {
    // UPDATED: correct modern Lenis setup
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // UPDATED: Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateLenis);
      lenisRef.current = null;
    };
  }, []);

  // Force scroll to top on page change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <div key={location.pathname} className="route-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/series" element={<Series />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Account />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}
