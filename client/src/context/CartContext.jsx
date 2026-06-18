import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'cart_items';

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i.productId === action.item.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.item.productId
            ? { ...i, quantity: Math.min(i.quantity + action.item.quantity, i.stock) }
            : i
        );
      }
      return [...state, action.item];
    }
    case 'REMOVE':
      return state.filter((i) => i.productId !== action.productId);
    case 'UPDATE_QTY':
      return state.map((i) =>
        i.productId === action.productId
          ? { ...i, quantity: Math.max(1, Math.min(action.quantity, i.stock)) }
          : i
      );
    case 'CLEAR':
      return [];
    case 'HYDRATE':
      return action.items;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate items before hydrating:
        // 1. Ensure each item has required fields
        // 2. Quantity should not exceed current stock
        // 3. Remove invalid entries
        const validItems = Array.isArray(parsed)
          ? parsed.filter(item => 
              item.productId && 
              typeof item.quantity === 'number' && 
              item.quantity > 0 &&
              typeof item.stock === 'number' &&
              item.quantity <= item.stock
            )
          : [];
        
        if (validItems.length > 0) {
          dispatch({ type: 'HYDRATE', items: validItems });
        }
        
        // Log if we filtered out invalid items
        if (Array.isArray(parsed) && parsed.length > validItems.length) {
          console.info(`Cart: Removed ${parsed.length - validItems.length} invalid items from storage`);
        }
      } catch (err) {
        // Corrupted data, start fresh
        console.warn('Cart: Failed to restore from storage, starting fresh');
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    dispatch({
      type: 'ADD',
      item: {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || '',
        stock: product.stock,
        quantity,
      },
    });
  }, []);

  const removeItem = useCallback((productId) => dispatch({ type: 'REMOVE', productId }), []);

  const updateQty = useCallback((productId, quantity) => {
    dispatch({ type: 'UPDATE_QTY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);

  const totalItems = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((acc, i) => acc + i.price * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      totalItems,
      totalPrice,
      isOpen,
      toggleCart,
    }),
    [items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, isOpen, toggleCart]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
