import React, { useState } from 'react';
import { Product } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatFCFA } from '../../utils/format';
import { ShoppingCart, Package, Eye } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { PackDetailsModal } from '../PackDetailsModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const isOutOfStock = product.stock === 0;

  const handleCardClick = () => {
    if (product.isPack) {
      setIsDetailsOpen(true);
    }
  };

  return (
    <>
      <Card 
        className={`flex flex-col h-full group ${product.isPack ? 'cursor-pointer hover:ring-2 hover:ring-green-500 transition-all' : ''}`}
        onClick={handleCardClick}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {product.isPack && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[12px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-lg flex items-center gap-1.5">
              <Package size={14} />
              Pack Agricole
            </div>
          )}
          {product.isPack && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-white text-green-600 font-black px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                <Eye size={18} /> VOIR DÉTAILS
              </span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-red-600 font-bold px-4 py-2 rounded-lg rotate-[-10deg]">ÉPUISÉ</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
            <span className="text-green-600 font-bold whitespace-nowrap">{formatFCFA(product.price)}</span>
          </div>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Package size={14} /> {product.stock} {product.unit} dispos
            </span>
            <div className="flex gap-2">
              {product.isPack && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailsOpen(true);
                  }}
                >
                  Détails
                </Button>
              )}
              <Button 
                size="sm" 
                disabled={isOutOfStock}
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product.id, 1);
                }}
              >
                <ShoppingCart size={16} /> {product.isPack ? 'Choisir' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {product.isPack && (
        <PackDetailsModal 
          isOpen={isDetailsOpen} 
          onClose={() => setIsDetailsOpen(false)} 
          product={product} 
        />
      )}
    </>
  );
};
