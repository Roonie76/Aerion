import React, { useState, useEffect, useRef } from 'react';
import { Menu, ShoppingCart, User, X, LogOut, Package, ChevronRight } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../context';
import logo from '../assets/logo.png';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Flight Series', path: '/series' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobilePanelRef = useRef(null);
  const mobileTriggerRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const panel = mobilePanelRef.current;
    const previousFocus = document.activeElement;
    if (!panel) return;

    const focusable = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    document.body.style.overflow = 'hidden';
    first?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || focusable.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    panel.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      panel.removeEventListener('keydown', onKeyDown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      } else {
        mobileTriggerRef.current?.focus();
      }
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;

    const onPointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onEscape);
    };
  }, [userMenuOpen]);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <div className="header-left">
          <NavLink to="/" className="brand-logo-link" aria-label="AERION Home" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="AERION Mark" className="brand-image-logo" />
            <span className="brand-text">AERION</span>
          </NavLink>
        </div>

        <nav className="main-nav" aria-label="Primary">
          <div className="nav-links-wrapper">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`.trim()}
              >
                <span className="nav-link-text">{item.label}</span>
                <span className="nav-link-indicator" />
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <div className="user-dropdown" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-menu-trigger glassmorphic-card"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-controls="desktop-user-menu"
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  <div className="user-avatar-small">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="user-name-short">{user?.name?.split(' ')[0]}</span>
                </button>
                <div id="desktop-user-menu" className={`user-dropdown-content glassmorphic-card ${userMenuOpen ? 'open' : ''}`.trim()} role="menu">
                  <NavLink to="/account" className="dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                    <Package size={16} />
                    <span>My Account</span>
                  </NavLink>
                  <button
                    type="button"
                    role="menuitem"
                    className="dropdown-item logout-action"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <NavLink to="/login" className="nav-link auth-pill" onClick={() => setMenuOpen(false)}>
                <User size={16} />
                <span>Account</span>
              </NavLink>
            )}

            <button
              type="button"
              className="cart-trigger"
              aria-label={`Shopping Cart, ${itemCount} items`}
              onClick={() => {
                setMenuOpen(false);
                setUserMenuOpen(false);
                navigate('/cart');
              }}
            >
              <div className="cart-icon-container">
                <ShoppingCart size={20} />
                {itemCount > 0 && <span className="cart-count-badge">{itemCount}</span>}
              </div>
            </button>

            <button
              ref={mobileTriggerRef}
              type="button"
              className="menu-button-mobile"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-panel"
              aria-haspopup="dialog"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      <div
        id="mobile-navigation-panel"
        className={`mobile-panel-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <div
          ref={mobilePanelRef}
          className="mobile-panel-content glassmorphic-card"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          tabIndex={-1}
        >
          <nav className="mobile-nav-list" aria-label="Primary mobile">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `mobile-link-item ${isActive ? 'active' : ''}`.trim()}
              >
                <span>{item.label}</span>
                <ChevronRight size={16} />
              </NavLink>
            ))}

            {!isAuthenticated ? (
              <NavLink to="/login" className="mobile-link-item auth-link" onClick={() => setMenuOpen(false)}>
                <span>Join / Login</span>
                <User size={16} />
              </NavLink>
            ) : (
              <>
                <NavLink to="/account" className="mobile-link-item" onClick={() => setMenuOpen(false)}>
                  <span>My Account</span>
                  <Package size={16} />
                </NavLink>
                <button
                  type="button"
                  className="mobile-link-item logout-mobile"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                >
                  <span>Logout</span>
                  <LogOut size={16} />
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
