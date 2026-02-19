import { createContext, useContext, useReducer, useEffect } from 'react';

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
  const [isOpen, setIsOpen] = useReducer((s) => !s, false);

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        dispatch({ type: 'HYDRATE', items: JSON.parse(stored) });
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
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
  };

  const removeItem = (productId) => dispatch({ type: 'REMOVE', productId });

  const updateQty = (productId, quantity) => dispatch({ type: 'UPDATE_QTY', productId, quantity });

  const clearCart = () => dispatch({ type: 'CLEAR' });

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, isOpen, toggleCart: setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
