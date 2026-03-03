import { useProducts } from '../contexts/ProductContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProductModal } from '../components/ProductModal';
import { formatFCFA, calculateCommission } from '../utils/format';
import { CATEGORY_LABELS } from '../constants';
import { TrendingUp, Package, AlertTriangle, Plus, Trash2, LayoutDashboard, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Custom Delete Button with inline confirmation
const DeleteButton = ({ onDelete, productName }: { onDelete: () => void, productName: string }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1">
        <button 
          onClick={() => {
            console.log('ProducerDashboard: Confirming delete for', productName);
            onDelete();
          }}
          className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all active:scale-95"
        >
          SÛR ?
        </button>
        <button 
          onClick={() => setIsConfirming(false)}
          className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-300 transition-all active:scale-95"
        >
          ANNULER
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setIsConfirming(true)}
      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
      title="Supprimer"
    >
      <Trash2 size={18} />
    </button>
  );
};

export const ProducerDashboard = () => {
  const { products, deleteProduct, addProduct, updateStock } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isInventoryView = location.pathname === '/inventory';
  
  // Mock stats
  const totalSales = 145000;
  const commission = calculateCommission(totalSales);
  const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isInventoryView ? 'Mon Inventaire' : 'Tableau de Bord'}
          </h1>
          <p className="text-gray-500">
            {isInventoryView 
              ? 'Gérez votre catalogue de produits et vos stocks.' 
              : 'Suivez vos performances et vos alertes en temps réel.'}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
          <Plus size={18} /> Nouveau Produit
        </Button>
      </header>

      {!isInventoryView ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <TrendingUp size={24} />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Ventes Totales</h3>
              <p className="text-3xl font-bold">{formatFCFA(totalSales)}</p>
              <p className="text-[10px] text-gray-400 mt-2">Commission SenAgri Market (5%): {formatFCFA(commission)}</p>
            </Card>

            <Card className="p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                  <Package size={24} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Produits Actifs</h3>
              <p className="text-3xl font-bold">{products.length}</p>
            </Card>

            <Card className="p-6 border-l-4 border-red-500">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Alertes Stock</h3>
              <p className="text-3xl font-bold">{lowStockProducts.length + outOfStock.length}</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Alerts Summary */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 bg-yellow-50/50 border-yellow-100">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-yellow-800">
                  <AlertTriangle size={18} /> Stock Faible
                </h3>
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{p.name}</span>
                      <span className="font-bold text-yellow-700">{p.stock} {p.unit}</span>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && <p className="text-xs text-gray-400">Aucune alerte pour le moment.</p>}
                </div>
              </Card>

              <Card className="p-6 bg-red-50/50 border-red-100">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-red-800">
                  <AlertTriangle size={18} /> Rupture de Stock
                </h3>
                <div className="space-y-3">
                  {outOfStock.slice(0, 5).map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{p.name}</span>
                      <span className="font-bold text-red-700">0 {p.unit}</span>
                    </div>
                  ))}
                  {outOfStock.length === 0 && <p className="text-xs text-gray-400">Tout est en stock !</p>}
                </div>
              </Card>
            </div>

            {/* Quick Inventory View */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Aperçu Inventaire</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
                    Voir tout <ArrowRight size={16} />
                  </Button>
                </div>
                <div className="space-y-4">
                  {products.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-grow">
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.stock} {product.unit} restants</p>
                      </div>
                      <p className="font-bold text-sm">{formatFCFA(product.price)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* Full Inventory View */
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <Package size={24} className="text-green-600" /> Liste des Produits
            </h2>
            <div className="flex gap-2">
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold uppercase text-gray-500">Total: {products.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Prix</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          {product.isPack && <span className="text-[8px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">PACK</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {CATEGORY_LABELS[product.category] || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{formatFCFA(product.price)}</p>
                      <p className="text-[10px] text-gray-400">par {product.unit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateStock(product.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                          title="Retirer 1"
                        >
                          -
                        </button>
                        <div className="flex flex-col items-center min-w-[60px]">
                          <span className={cn(
                            "text-sm font-bold",
                            product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-yellow-600" : "text-green-700"
                          )}>
                            {product.stock} {product.unit}
                          </span>
                          <div className={cn(
                            "w-full h-1 rounded-full mt-1",
                            product.stock === 0 ? "bg-red-200" : product.stock < 10 ? "bg-yellow-200" : "bg-green-200"
                          )} />
                        </div>
                        <button 
                          onClick={() => updateStock(product.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-all active:scale-90"
                          title="Ajouter 1"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => updateStock(product.id, 10)}
                          className="text-[10px] font-bold text-green-600 hover:bg-green-50 px-1.5 py-0.5 rounded transition-all ml-1"
                          title="Ajouter 10 unités"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        <DeleteButton onDelete={() => deleteProduct(product.id)} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-20">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400">Votre inventaire est vide.</p>
              <Button variant="ghost" className="mt-4" onClick={() => setIsModalOpen(true)}>
                Ajouter votre premier produit
              </Button>
            </div>
          )}
        </Card>
      )}

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addProduct} 
      />
    </div>
  );
};
