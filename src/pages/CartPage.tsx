import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatFCFA } from '../utils/format';
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle2, Truck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

import { useNavigate } from 'react-router-dom';

export const CartPage = () => {
  const navigate = useNavigate();
  const { 
    items, 
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
  const [isOrdered, setIsOrdered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const handleCheckout = async () => {
    setIsProcessing(true);
    const order = await checkout();
    setIsProcessing(false);
    if (order) {
      setConfirmedOrder(order);
      setIsOrdered(true);
    } else {
      alert("Une erreur est survenue lors de la commande. Veuillez réessayer.");
    }
  };

  if (isOrdered && confirmedOrder) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-50 p-10 rounded-3xl border-2 border-green-100"
        >
          <CheckCircle2 size={72} className="text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">Commande Confirmée !</h2>
          <p className="text-gray-600 mb-6">Merci de soutenir l'agriculture locale.</p>
          
          <div className="bg-white rounded-2xl p-6 text-left space-y-3 mb-6 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">N° Commande</span>
              <span className="font-mono font-bold text-green-700">{confirmedOrder.id?.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">{formatFCFA(confirmedOrder.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Statut</span>
              <span className="inline-flex items-center gap-1 text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-1 rounded-full">
                ● En préparation
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{new Date(confirmedOrder.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paiement</span>
              <span className="font-medium">À la livraison</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">Nous vous contacterons pour confirmer la livraison.</p>
          
          <Link to="/">
            <Button className="w-full">Retour au catalogue</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
        <p className="text-gray-500 mb-8">Découvrez nos produits frais et remplissez votre panier.</p>
        <Link to="/">
          <Button>Voir le catalogue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;

              return (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-4 flex gap-4 items-center">
                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
                    <div className="flex-grow">
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="text-green-600 font-medium">{formatFCFA(product.price)} / {product.unit}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                        disabled={item.quantity >= product.stock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold">{formatFCFA(product.price * item.quantity)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
            
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-bold text-gray-700">Mode de livraison</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setDeliveryMethod('home')}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                    deliveryMethod === 'home' 
                      ? "border-green-600 bg-green-50" 
                      : "border-gray-100 hover:border-green-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Truck size={20} className={deliveryMethod === 'home' ? "text-green-600" : "text-gray-400"} />
                    <span className="font-bold text-sm">À domicile</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">1 500 F</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod('relay')}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                    deliveryMethod === 'relay' 
                      ? "border-green-600 bg-green-50" 
                      : "border-gray-100 hover:border-green-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className={deliveryMethod === 'relay' ? "text-green-600" : "text-gray-400"} />
                    <span className="font-bold text-sm">Point Relais</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">500 F</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>{formatFCFA(deliveryFee)}</span>
              </div>
              <div className="pt-4 border-t flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-green-600">{formatFCFA(total)}</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? 'Traitement...' : 'Confirmer la commande'}
            </Button>
            <p className="text-[10px] text-gray-400 mt-4 text-center uppercase tracking-widest">
              Paiement à la livraison
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
