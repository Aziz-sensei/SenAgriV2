import { useProducts } from '../contexts/ProductContext';
import { ProductCard } from '../components/catalog/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { Search, Filter, X, ShoppingBasket, Sprout, Bird, MoreHorizontal, Package } from 'lucide-react';
import { cn } from '../utils/cn';

export const CatalogPage = ({ filterPacks = false }: { filterPacks?: boolean }) => {
  const { products, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'Tous', icon: <ShoppingBasket size={18} /> },
    { id: 'legume', name: 'Légumes', icon: <Sprout size={18} /> },
    { id: 'elevage', name: 'Volaille & Élevage', icon: <Bird size={18} /> },
    { id: 'others', name: 'Autres', icon: <MoreHorizontal size={18} /> },
    { id: 'pack', name: 'Packs Agricoles', icon: <Package size={18} /> },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Base filter: if we are on the /packs route, only show packs
      if (filterPacks && !p.isPack) return false;
      
      // Stock filter: don't show out of stock items in catalog unless it's a pack (packs might be special)
      if (!p.isPack && p.stock <= 0) return false;

      // Search filter
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'others') {
        return p.category === 'fruit' || p.category === 'cereale';
      }
      if (selectedCategory === 'pack') {
        return p.isPack === true;
      }
      return p.category === selectedCategory;
    });
  }, [products, searchTerm, selectedCategory, filterPacks]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement des produits frais...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {filterPacks ? 'Nos Packs Agricoles' : 'Produits du Terroir'}
            </h1>
            <p className="text-gray-500">
              {filterPacks 
                ? 'Des sélections optimisées pour vos besoins familiaux ou individuels.' 
                : 'Frais, locaux et de saison. Directement de nos champs à votre panier.'}
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters - Only show on main catalog or if not filtering by packs specifically */}
        {!filterPacks && (
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border-2",
                  selectedCategory === cat.id 
                    ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-100 scale-105" 
                    : "bg-white border-gray-100 text-gray-500 hover:border-green-200 hover:text-green-600"
                )}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, index) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Search size={32} />
          </div>
          <p className="text-gray-500 font-medium">Aucun produit ne correspond à votre recherche.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="mt-4 text-green-600 font-bold hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </motion.div>
      )}
    </div>
  );
};
