import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'producerId'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (retries = 3) => {
    if (!isSupabaseConfigured()) {
      const saved = localStorage.getItem('senagri_products');
      if (saved) setProducts(JSON.parse(saved));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`ProductContext: Fetching products (Attempt ${4 - retries}/3)...`);
      
      // Add a longer timeout to prevent infinite loading
      const fetchPromise = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Products fetch timeout')), 60000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Supabase error fetching products:', error);
        throw error;
      }
      
      if (data) {
        console.log('ProductContext: Products fetched successfully, count:', data.length);
        // Map Supabase snake_case to camelCase if necessary
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          unit: p.unit,
          image: p.image,
          category: p.category,
          stock: p.stock,
          producerId: p.producer_id,
          isPack: p.is_pack,
          packComposition: p.pack_composition
        }));
        setProducts(mappedProducts.length > 0 ? mappedProducts : MOCK_PRODUCTS);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    } catch (err: any) {
      console.error('Error fetching products from Supabase:', err.message);
      
      if (retries > 1) {
        const delay = (4 - retries) * 2000; // Exponential backoff: 2s, 4s
        console.log(`ProductContext: Retrying in ${delay/1000} seconds... (${retries - 1} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProducts(retries - 1);
      }
      
      // Fallback to mock data if all retries fail
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync local storage for fallback
  useEffect(() => {
    localStorage.setItem('senagri_products', JSON.stringify(products));
  }, [products]);

  const addProduct = async (newProd: Omit<Product, 'id' | 'producerId'>) => {
    console.log('ProductContext: Starting addProduct for', newProd.name);
    
    // 1. Create a temporary ID for optimistic UI
    const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
    const product: Product = {
      ...newProd,
      id: tempId,
      producerId: 'me',
    };
    
    // 2. Update local state immediately (Optimistic UI)
    console.log('ProductContext: Updating local state with temp product');
    setProducts(prev => [product, ...prev]);

    // 3. Sync with Supabase if possible
    if (isSupabaseConfigured()) {
      console.log('ProductContext: Supabase is configured, attempting sync...');
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.warn('ProductContext: User not authenticated for Supabase sync', userError);
          return; // Keep the optimistic product locally
        }

        console.log('ProductContext: Authenticated as', user.id, 'sending to Supabase...');
        const { data, error } = await supabase.from('products').insert([{
          name: newProd.name,
          description: newProd.description,
          price: newProd.price,
          unit: newProd.unit,
          image: newProd.image,
          category: newProd.category,
          stock: newProd.stock,
          producer_id: user.id,
          is_pack: newProd.isPack
        }]).select();
        
        if (error) {
          console.error('ProductContext: Supabase insert error:', error);
          throw error;
        }
        
        if (data && data[0]) {
          console.log('ProductContext: Supabase sync successful, replacing temp ID');
          const realProduct: Product = {
            id: data[0].id,
            name: data[0].name,
            description: data[0].description,
            price: data[0].price,
            unit: data[0].unit,
            image: data[0].image,
            category: data[0].category,
            stock: data[0].stock,
            producerId: data[0].producer_id,
            isPack: data[0].is_pack
          };
          setProducts(prev => prev.map(p => p.id === tempId ? realProduct : p));
        }
      } catch (err) {
        console.error('ProductContext: Critical error during sync:', err);
        // We keep the optimistic product so the user doesn't lose their work visually
      }
    } else {
      console.log('ProductContext: Supabase not configured, product remains local only');
    }
  };

  const deleteProduct = async (id: string) => {
    console.log('ProductContext: Deleting product', id);
    
    // 1. Update local state immediately (Optimistic UI)
    setProducts(prev => {
      const filtered = prev.filter(p => p.id !== id);
      console.log('ProductContext: Local state updated, new count:', filtered.length);
      return filtered;
    });

    // 2. Sync with Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        console.log('ProductContext: Product deleted from Supabase');
      } catch (err) {
        console.error('ProductContext: Error deleting product from Supabase:', err);
        // If it's a mock product (ID is numeric or not a UUID), it's fine that it fails in Supabase
        // But if it was a real product and failed, we might want to revert, 
        // but for now let's keep it simple and optimistic.
      }
    }
  };

  const adjustStock = async (id: string, amount: number) => {
    console.log('ProductContext: Adjusting stock for', id, 'by', amount);
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStock = Math.max(0, product.stock + amount);
    
    // 1. Update local state immediately
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, stock: newStock } : p
    ));

    // 2. Sync with Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', id);
        if (error) throw error;
        console.log('ProductContext: Stock updated in Supabase');
      } catch (err) {
        console.error('ProductContext: Error updating stock in Supabase:', err);
        // We don't revert optimistic update to keep UI smooth
      }
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    console.log('ProductContext: Updating product', id, updates);
    
    // 1. Update local state immediately
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      console.log('ProductContext: Local state updated, product found:', updated.some(p => p.id === id));
      return updated;
    });

    // 2. Sync with Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabaseUpdates: any = {};
        if (updates.name) supabaseUpdates.name = updates.name;
        if (updates.description) supabaseUpdates.description = updates.description;
        if (updates.price) supabaseUpdates.price = updates.price;
        if (updates.unit) supabaseUpdates.unit = updates.unit;
        if (updates.image) supabaseUpdates.image = updates.image;
        if (updates.category) supabaseUpdates.category = updates.category;
        if (updates.stock !== undefined) supabaseUpdates.stock = updates.stock;
        if (updates.isPack !== undefined) supabaseUpdates.is_pack = updates.isPack;

        const { error } = await supabase
          .from('products')
          .update(supabaseUpdates)
          .eq('id', id);
        if (error) throw error;
        console.log('ProductContext: Product updated in Supabase');
      } catch (err) {
        console.error('ProductContext: Error updating product in Supabase:', err);
      }
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      addProduct, 
      deleteProduct, 
      updateStock: adjustStock,
      updateProduct,
      refreshProducts: fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};
