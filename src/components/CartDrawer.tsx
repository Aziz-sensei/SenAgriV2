import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, Truck, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { Button } from './ui/Button';
import { formatFCFA } from '../utils/format';
import { cn } from '../utils/cn';

import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    deliveryMethod, 
    setDeliveryMethod, 
    deliveryFee, 
    total,
    checkout
  } = useCart();
  const { products } = useProducts();

  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [confirmedOrder, setConfirmedOrder] = React.useState<any>(null);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const order = await checkout();
    setIsCheckingOut(false);
    
    if (order) {
      setConfirmedOrder(order);
    } else {
      alert('Une erreur est survenue lors de la commande. Veuillez vérifier votre connexion.');
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmedOrder(null);
    setIsCartOpen(false);
    navigate('/');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-green-600 text-white">
              <div className="flex items-center gap-3">
                <ShoppingBag size={24} />
                <h2 className="text-xl font-bold">Mon Panier</h2>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                  {items.length} articles
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
              {confirmedOrder ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <CheckCircle2 size={80} className="text-green-500 mx-auto" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Commande Confirmée !</h3>
                    <p className="text-gray-500 text-sm">Merci de soutenir l'agriculture locale</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-5 w-full text-left space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">N° Commande</span>
                      <span className="font-mono font-bold text-green-700">
                        {confirmedOrder.id?.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total payé</span>
                      <span className="font-bold text-lg">{formatFCFA(confirmedOrder.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Statut</span>
                      <span className="inline-flex items-center gap-1 text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-1 rounded-full">
                        ● En préparation
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium">
                        {new Date(confirmedOrder.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Paiement</span>
                      <span className="font-medium">À la livraison</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    Nous vous contacterons pour confirmer la livraison.
                  </p>

                  <Button className="w-full" onClick={handleCloseConfirmation}>
                    Retour au catalogue
                  </Button>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-gray-500 font-medium">Votre panier est vide</p>
                  <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                    Continuer mes achats
                  </Button>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-4">
                    {items.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      if (!product) return null;
                      const itemTotal = product.price * item.quantity;

                      return (
                        <div key={item.productId} className="flex gap-4 p-3 bg-gray-50 rounded-2xl group">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-20 h-20 rounded-xl object-cover shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-sm truncate pr-2">{product.name}</h3>
                              <button 
                                onClick={() => removeFromCart(item.productId)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">
                              {formatFCFA(product.price)} / {product.unit}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                                <button 
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="p-1 hover:bg-gray-50 rounded transition-colors"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-50 rounded transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <span className="font-bold text-green-600 text-sm">
                                {formatFCFA(itemTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Truck size={18} className="text-green-600" /> Mode de livraison
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryMethod('home')}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-left space-y-1",
                          deliveryMethod === 'home' 
                            ? "border-green-600 bg-green-50" 
                            : "border-gray-100 hover:border-green-200"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <Truck size={16} className={deliveryMethod === 'home' ? "text-green-600" : "text-gray-400"} />
                          <span className="text-[10px] font-bold text-green-600">1 500 F</span>
                        </div>
                        <p className="text-xs font-bold">À domicile</p>
                      </button>
                      <button
                        onClick={() => setDeliveryMethod('relay')}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-left space-y-1",
                          deliveryMethod === 'relay' 
                            ? "border-green-600 bg-green-50" 
                            : "border-gray-100 hover:border-green-200"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <MapPin size={16} className={deliveryMethod === 'relay' ? "text-green-600" : "text-gray-400"} />
                          <span className="text-[10px] font-bold text-green-600">500 F</span>
                        </div>
                        <p className="text-xs font-bold">Point Relais</p>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Sous-total</span>
                    <span>{formatFCFA(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Livraison ({deliveryMethod === 'home' ? 'Domicile' : 'Relais'})</span>
                    <span>{formatFCFA(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200">
                    <span>TOTAL</span>
                    <span className="text-green-600">{formatFCFA(total)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-14 text-lg font-bold" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Traitement...' : (
                    <>Commander <ArrowRight size={20} className="ml-2" /></>
                  )}
                </Button>
                <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                  Paiement à la livraison
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
