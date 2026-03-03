import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Order } from '../types';
import { useProducts } from './ProductContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export type DeliveryMethod = 'home' | 'relay';

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  deliveryFee: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  orders: Order[];
  checkout: () => Promise<Order | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('senagri_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('home');
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('senagri_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const { products, updateStock } = useProducts();

  useEffect(() => {
    localStorage.setItem('senagri_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('senagri_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (productId: string, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { productId, quantity }];
    });
    setIsCartOpen(true); // Open cart when adding item
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const checkout = async (): Promise<Order | null> => {
    const currentSubtotal = subtotal;
    const currentItems = [...items];
    const currentTotal = total;

    const newOrder: Order = {
      id: Math.random().toString(36).substring(7),
      items: currentItems,
      total: currentTotal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        // 1. Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{ 
            total: currentTotal, 
            status: 'pending',
            delivery_method: deliveryMethod
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // 2. Create order items
        const orderItems = currentItems.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_time: product?.price || 0
          };
        });

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        // 3. Update stocks
        for (const item of currentItems) {
          await updateStock(item.productId, item.quantity);
        }

        setOrders(prev => [order, ...prev]);
        clearCart();
        return order;
      } catch (err) {
        console.error('Checkout error with Supabase:', err);
        return null;
      }
    } else {
      // Mock checkout
      for (const item of currentItems) {
        await updateStock(item.productId, item.quantity);
      }
      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    }
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = items.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  const deliveryFee = subtotal > 0 ? (deliveryMethod === 'home' ? 1500 : 500) : 0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      subtotal,
      deliveryMethod,
      setDeliveryMethod,
      deliveryFee,
      total,
      isCartOpen,
      setIsCartOpen,
      orders,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
