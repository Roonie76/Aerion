import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { toGA4Item, trackEvent } from '../lib/analytics';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartAnnouncement, setCartAnnouncement] = useState('');
  const { user, request } = useAuth();
  const announcementTimeoutRef = useRef(null);

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const result = await request('/cart');
        if (result.success) {
          setCartItems(result.data.items || []);
        }
      } else {
        const savedCart = localStorage.getItem('aerion_cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };

    loadCart();
  }, [user, request]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('aerion_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        window.clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  const announce = (message) => {
    setCartAnnouncement('');
    window.requestAnimationFrame(() => setCartAnnouncement(message));

    if (announcementTimeoutRef.current) {
      window.clearTimeout(announcementTimeoutRef.current);
    }

    announcementTimeoutRef.current = window.setTimeout(() => {
      setCartAnnouncement('');
    }, 1200);
  };

  const addItem = async (item) => {
    const itemId = item._id || item.id;
    if (!itemId) return;

    const existingItem = cartItems.find((cartItem) => (cartItem._id || cartItem.id) === itemId);
    let nextItems;

    if (!existingItem) {
      nextItems = [...cartItems, { ...item, quantity: 1 }];
    } else {
      nextItems = cartItems.map((cartItem) =>
        (cartItem._id || cartItem.id) === itemId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    }

    setCartItems(nextItems);
    announce('Added to cart.');
    trackEvent('add_to_cart', {
      currency: 'INR',
      value: Number(item.price) || 0,
      items: [toGA4Item(item)],
    });

    if (user) {
      await request('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: itemId, quantity: 1 }),
      });
    }
  };

  const removeItem = async (itemId) => {
    if (!itemId) return;
    const existingItem = cartItems.find((cartItem) => (cartItem._id || cartItem.id) === itemId);

    const nextItems = cartItems
      .map((cartItem) =>
        (cartItem._id || cartItem.id) === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      )
      .filter((cartItem) => cartItem.quantity > 0);

    setCartItems(nextItems);
    if (existingItem) {
      trackEvent('remove_from_cart', {
        currency: 'INR',
        value: Number(existingItem.price) || 0,
        items: [toGA4Item(existingItem)],
      });
    }

    if (user) {
      await request('/cart/remove', {
        method: 'POST',
        body: JSON.stringify({ productId: itemId, quantity: 1 }),
      });
    }
  };

  const deleteItem = async (itemId) => {
    if (!itemId) return;
    const existingItem = cartItems.find((cartItem) => (cartItem._id || cartItem.id) === itemId);

    setCartItems((current) => current.filter((cartItem) => (cartItem._id || cartItem.id) !== itemId));
    if (existingItem) {
      trackEvent('remove_from_cart', {
        currency: 'INR',
        value: (Number(existingItem.price) || 0) * (existingItem.quantity || 1),
        items: [toGA4Item(existingItem, existingItem.quantity || 1)],
      });
    }

    if (user) {
      await request(`/cart/${itemId}`, { method: 'DELETE' });
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('aerion_cart');

    if (user) {
      await request('/cart', { method: 'DELETE' });
    }
  };

  const value = useMemo(
    () => ({
      cartItems,
      cartAnnouncement,
      addItem,
      removeItem,
      deleteItem,
      clearCart,
    }),
    [cartAnnouncement, cartItems, user, request]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }
  return context;
}
