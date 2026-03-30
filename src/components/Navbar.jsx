import React, { useState, useEffect } from 'react';
import { Menu, ShoppingCart, User, X, LogOut, Package, ChevronRight, Search } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../context';
import logo from '../assets/logo.png';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Flight Series', path: '/series' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [menuOpen]);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <div className="header-left">
          <NavLink to="/" className="brand-logo-link" aria-label="AERION Home" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="AERION Mark" className="brand-image-logo" />
            <span className="brand-text">AERION</span>
          </NavLink>
        </div>

        <nav className="main-nav" aria-label="Main Navigation">
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
                <span className="nav-link-indicator"></span>
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            <button className="icon-button search-trigger" aria-label="Search">
              <Search size={18} />
            </button>

            {isAuthenticated ? (
              <div className="user-dropdown">
                <button className="user-menu-trigger glassmorphic-card">
                  <div className="user-avatar-small">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="user-name-short">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="user-dropdown-content glassmorphic-card">
                  <NavLink to="/account" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <Package size={16} />
                    <span>My Account</span>
                  </NavLink>
                  <button
                    type="button"
                    className="dropdown-item logout-action"
                    onClick={() => {
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
                navigate('/cart');
              }}
            >
              <div className="cart-icon-container">
                <ShoppingCart size={20} />
                {itemCount > 0 && <span className="cart-count-badge">{itemCount}</span>}
              </div>
            </button>

            <button
              type="button"
              className="menu-button-mobile"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      <div id="mobile-navigation-panel" className={`mobile-panel-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        <div className="mobile-panel-content glassmorphic-card" onClick={(e) => e.stopPropagation()}>
          <nav className="mobile-nav-list" aria-label="Mobile Navigation">
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
                    logout();
                    setMenuOpen(false);
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
