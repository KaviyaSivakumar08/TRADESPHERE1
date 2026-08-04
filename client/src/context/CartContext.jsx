import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const cartKey = user ? `tradesphere_cart_${user.id}` : null;
  const [items, setItems] = useState([]);

  // Load only the logged-in user's cart.
  useEffect(() => {
    const savedCart = cartKey
      ? JSON.parse(localStorage.getItem(cartKey) || '[]')
      : [];

    setItems(savedCart);
  }, [cartKey]);

  // Save only to the logged-in user's cart.
  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [cartKey, items]);

  const add = (crop) => {
    if (!user) {
      return { requiresLogin: true };
    }

    setItems((currentItems) => {
      const exists = currentItems.find((item) => item._id === crop._id);

      if (exists) {
        return currentItems.map((item) =>
          item._id === crop._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, crop.quantity),
              }
            : item,
        );
      }

      return [...currentItems, { ...crop, quantity: 1 }];
    });

    return { requiresLogin: false };
  };

  const change = (cropId, quantity) => {
    setItems((currentItems) =>
      quantity < 1
        ? currentItems.filter((item) => item._id !== cropId)
        : currentItems.map((item) =>
            item._id === cropId
              ? { ...item, quantity: Math.min(quantity, item.quantity) }
              : item,
          ),
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        change,
        clear: () => setItems([]),
        count: items.reduce((total, item) => total + item.quantity, 0),
        total: items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);