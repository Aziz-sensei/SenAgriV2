import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, ShoppingCart, Info, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatFCFA } from '../utils/format';
import { useCart } from '../contexts/CartContext';

interface PackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const PackDetailsModal = ({ isOpen, onClose, product }: PackDetailsModalProps) => {
  const { addToCart } = useCart();

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product.id, 1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden shadow-2xl border-none">
              <div className="relative h-64">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Pack Agricole
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-1">{product.name}</h2>
                  <p className="text-white/80 text-sm">{product.description}</p>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Info size={18} className="text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Composition du Pack</h3>
                </div>

                <div className="space-y-4 mb-8">
                  {product.packComposition?.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-200 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500 font-medium">Quantité : {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-600">{formatFCFA(item.price)}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Valeur estimée</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Prix Total du Pack</p>
                    <p className="text-4xl font-black text-green-600">{formatFCFA(product.price)}</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full md:w-auto px-12 h-14 rounded-2xl shadow-lg shadow-green-200"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={20} className="mr-2" /> Ajouter au panier
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
