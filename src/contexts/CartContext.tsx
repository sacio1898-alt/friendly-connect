import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  stock: number;
  isDigital?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeFromCart: (productId: string, size?: string, color?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      const saved = localStorage.getItem('cart');
      setItems(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const cartRef = doc(db, 'carts', user.uid);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        setItems(cartSnap.data().items || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (newItems: CartItem[]) => {
    if (user) {
      await setDoc(doc(db, 'carts', user.uid), { items: newItems, updatedAt: new Date() });
    } else {
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const addQty = item.quantity || 1;
    const existing = items.find(i => 
      i.productId === item.productId && 
      i.selectedSize === item.selectedSize && 
      i.selectedColor === item.selectedColor
    );
    let newItems: CartItem[];
    if (existing) {
      newItems = items.map(i => 
        i.productId === item.productId && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor
          ? { ...i, quantity: Math.min(i.quantity + addQty, i.stock) }
          : i
      );
    } else {
      newItems = [...items, { ...item, quantity: Math.min(addQty, item.stock) }];
    }
    setItems(newItems);
    await saveCart(newItems);
  };

  const removeFromCart = async (productId: string, size?: string, color?: string) => {
    const newItems = items.filter(i => 
      !(i.productId === productId && i.selectedSize === size && i.selectedColor === color)
    );
    setItems(newItems);
    await saveCart(newItems);
  };

  const updateQuantity = async (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      return removeFromCart(productId, size, color);
    }
    const newItems = items.map(i =>
      i.productId === productId && i.selectedSize === size && i.selectedColor === color
        ? { ...i, quantity: Math.min(quantity, i.stock) }
        : i
    );
    setItems(newItems);
    await saveCart(newItems);
  };

  const clearCart = async () => {
    setItems([]);
    await saveCart([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
