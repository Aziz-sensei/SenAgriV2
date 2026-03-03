import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { X, Upload, Package, Tag, Info, Coins } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (product: Omit<Product, 'id' | 'producerId'>) => Promise<void>;
  onEdit?: (id: string, updates: Partial<Product>) => Promise<void>;
  initialData?: Product;
}

export const ProductModal = ({ isOpen, onClose, onAdd, onEdit, initialData }: ProductModalProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    unit: initialData?.unit || 'kg',
    category: initialData?.category || 'legume',
    stock: initialData?.stock?.toString() || '',
    image: initialData?.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
    isPack: initialData?.isPack || false,
    packComposition: initialData?.packComposition || [] as { name: string; quantity: string; price: number }[]
  });

  const addCompositionItem = () => {
    setFormData({
      ...formData,
      packComposition: [...formData.packComposition, { name: '', quantity: '', price: 0 }]
    });
  };

  const removeCompositionItem = (index: number) => {
    const newComp = [...formData.packComposition];
    newComp.splice(index, 1);
    setFormData({ ...formData, packComposition: newComp });
  };

  const updateCompositionItem = (index: number, field: string, value: any) => {
    const newComp = [...formData.packComposition];
    newComp[index] = { ...newComp[index], [field]: value };
    setFormData({ ...formData, packComposition: newComp });
  };

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

  // Update form if initialData changes (e.g. when switching between products to edit)
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description,
          price: initialData.price.toString(),
          unit: initialData.unit,
          category: initialData.category,
          stock: initialData.stock.toString(),
          image: initialData.image,
          isPack: !!initialData.isPack,
          packComposition: initialData.packComposition || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          unit: 'kg',
          category: 'legume',
          stock: '',
          image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
          isPack: false,
          packComposition: []
        });
      }
    }
  }, [initialData, isOpen]);

  const suggestImage = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tomat')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800';
    if (n.includes('carot')) return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800';
    if (n.includes('riz')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800';
    if (n.includes('oignon')) return 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=800';
    if (n.includes('pomme de terre')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800';
    if (n.includes('piment')) return 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=800';
    if (n.includes('pack')) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
    if (n.includes('poulet') || n.includes('volaille') || n.includes('coq')) return 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800';
    if (n.includes('maïs') || n.includes('mais')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800';
    return formData.image;
  };

  const handleNameChange = (name: string) => {
    const suggested = suggestImage(name);
    setFormData({ ...formData, name, image: suggested });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ProductModal: Submitting form', initialData ? 'EDIT' : 'ADD', formData);
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      unit: formData.unit,
      category: formData.category as any,
      stock: parseInt(formData.stock),
      image: formData.image,
      isPack: formData.isPack,
      packComposition: formData.isPack ? formData.packComposition : undefined
    };

    if (initialData && onEdit) {
      await onEdit(initialData.id, productData);
    } else if (onAdd) {
      await onAdd(productData);
    }
    
    onClose();
    if (!initialData) {
      setFormData({
        name: '',
        description: '',
        price: '',
        unit: 'kg',
        category: 'legume',
        stock: '',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
        isPack: false,
        packComposition: []
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden shadow-2xl border-none">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-600 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package size={24} /> {initialData ? 'Modifier le Produit' : 'Nouveau Produit'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex justify-center mb-4">
                    <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={formData.image} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                        <span className="text-[10px] text-white font-bold bg-black/40 px-2 py-0.5 rounded-full">APERÇU</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Tag size={16} /> Nom du produit
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => handleNameChange(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="ex: Tomates Cerises"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Info size={16} /> Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option value="legume">Légumes</option>
                      <option value="fruit">Fruits</option>
                      <option value="cereale">Céréales</option>
                      <option value="elevage">Volaille & Élevage</option>
                      <option value="pack">Packs Agricoles</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Coins size={16} /> Prix (FCFA)
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="ex: 1500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Package size={16} /> Unité
                    </label>
                    <select
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option value="kg">Kilogramme (kg)</option>
                      <option value="sac">Sac</option>
                      <option value="panier">Panier</option>
                      <option value="unité">Unité</option>
                      <option value="litre">Litre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Package size={16} /> Stock initial
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="ex: 50"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="isPack"
                      checked={formData.isPack}
                      onChange={e => setFormData({ ...formData, isPack: e.target.checked })}
                      className="w-5 h-5 accent-green-600"
                    />
                    <label htmlFor="isPack" className="text-sm font-bold text-gray-700">C'est un Pack Agricole</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none h-24"
                    placeholder="Décrivez votre produit..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Upload size={16} /> Image (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="URL de l'image..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    {initialData ? 'Enregistrer les modifications' : 'Ajouter le produit'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
