import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const { user, request } = useAuth();

  // Load cart from server or local storage on mount
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

  // Sync cart to local storage (if guest)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('aerion_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addItem = async (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id || cartItem._id === item._id);
    let newItems;

    if (!existingItem) {
      newItems = [...cartItems, { ...item, quantity: 1 }];
    } else {
      newItems = cartItems.map((cartItem) =>
        (cartItem.id === item.id || cartItem._id === item._id) 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      );
    }

    setCartItems(newItems);

    if (user) {
      await request('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: item._id || item.id, quantity: 1 }),
      });
    }
  };

  const removeItem = async (itemId) => {
    const newItems = cartItems
      .map((cartItem) =>
        (cartItem.id === itemId || cartItem._id === itemId) 
          ? { ...cartItem, quantity: cartItem.quantity - 1 } 
          : cartItem
      )
      .filter((cartItem) => cartItem.quantity > 0);

    setCartItems(newItems);

    if (user) {
      await request('/cart/remove', {
        method: 'POST',
        body: JSON.stringify({ productId: itemId, quantity: 1 }),
      });
    }
  };

  const deleteItem = async (itemId) => {
    setCartItems((prevItems) => prevItems.filter((cartItem) => cartItem.id !== itemId && cartItem._id !== itemId));

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
      addItem,
      removeItem,
      deleteItem,
      clearCart,
    }),
    [cartItems, user, request]
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
