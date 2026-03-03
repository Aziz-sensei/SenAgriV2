import { useProducts } from '../contexts/ProductContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatFCFA } from '../utils/format';
import { CATEGORY_LABELS } from '../constants';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../types';
import { 
  Users, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  AlertCircle,
  Search,
  Filter,
  Edit3,
  Plus,
  History,
  UserX,
  Key
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export const AdminDashboard = () => {
  const { products, deleteProduct, addProduct, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'activity'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Mock data for users
  const [users, setUsers] = useState([
    { id: 'u1', name: 'Moussa Diop', email: 'moussa@example.com', role: 'producer', joined: '2026-01-15' },
    { id: 'u2', name: 'Fatou Sow', email: 'fatou@example.com', role: 'consumer', joined: '2026-02-10' },
    { id: 'u3', name: 'Amadou Fall', email: 'amadou@example.com', role: 'producer', joined: '2026-02-20' },
  ]);

  // Mock activity
  const [activities] = useState([
    { id: 1, type: 'product', action: 'Ajout', target: 'Tomates Cerises', user: 'Moussa Diop', time: 'Il y a 10 min' },
    { id: 2, type: 'user', action: 'Inscription', target: 'Fatou Sow', user: 'Système', time: 'Il y a 1h' },
    { id: 3, type: 'order', action: 'Vente', target: 'Pack Famille', user: 'Amadou Fall', time: 'Il y a 3h' },
    { id: 4, type: 'product', action: 'Suppression', target: 'Produit Inadéquat', user: 'Admin', time: 'Il y a 5h' },
  ]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const handleEdit = (product: Product) => {
    console.log('AdminDashboard: Opening edit for', product.id, product.name);
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Supprimer cet utilisateur définitivement ?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleResetPassword = (email: string) => {
    alert(`Un lien de réinitialisation a été envoyé à ${email}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Administration Système</h1>
          </div>
          <p className="text-gray-500">Contrôle total sur les produits, les utilisateurs et les flux de la plateforme.</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={18} /> Ajouter un Produit
        </Button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Utilisateurs</h3>
          <p className="text-2xl font-bold">{users.length + 1237}</p>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Package size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Produits</h3>
          <p className="text-2xl font-bold">{products.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Valeur Stock</h3>
          <p className="text-2xl font-bold">{formatFCFA(totalValue)}</p>
        </Card>

        <Card className="p-6 border-l-4 border-red-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ruptures</h3>
          <p className="text-2xl font-bold">{outOfStockCount}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('products')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
            activeTab === 'products' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          Gestion Produits
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
            activeTab === 'users' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          Utilisateurs
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
            activeTab === 'activity' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          Activité Récente
        </button>
      </div>

      {activeTab === 'products' && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Rechercher un produit ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter size={18} /> Filtres Avancés
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4">Vendeur</th>
                  <th className="px-6 py-4">Prix</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase">
                            {CATEGORY_LABELS[product.category] || product.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">Producteur #{product.producerId?.substring(0, 5) || 'Admin'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{formatFCFA(product.price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        product.stock === 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      )}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-300 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            console.log('AdminDashboard: Requesting delete for', product.id, product.name);
                            if (window.confirm(`ADMIN: Supprimer définitivement "${product.name}" ?`)) {
                              deleteProduct(product.id)
                                .then(() => console.log('AdminDashboard: Delete successful'))
                                .catch(err => console.error('AdminDashboard: Delete failed', err));
                            }
                          }}
                          className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Gestion des Utilisateurs</h2>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                    user.role === 'producer' ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  )}>
                    {user.role}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:bg-blue-100"
                      onClick={() => handleResetPassword(user.email)}
                    >
                      <Key size={14} className="mr-1" /> Reset Pass
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-100"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <UserX size={14} className="mr-1" /> Bannir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History size={24} className="text-blue-600" /> Flux d'Activité
          </h2>
          <div className="space-y-6">
            {activities.map(activity => (
              <div key={activity.id} className="flex gap-4 items-start border-l-2 border-gray-100 pl-4 pb-6 last:pb-0">
                <div className={cn(
                  "p-2 rounded-lg",
                  activity.type === 'product' ? "bg-green-50 text-green-600" : 
                  activity.type === 'user' ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"
                )}>
                  {activity.type === 'product' ? <Package size={16} /> : 
                   activity.type === 'user' ? <Users size={16} /> : <TrendingUp size={16} />}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-bold text-gray-900">{activity.user}</span>
                    <span className="text-gray-500 mx-1">a effectué un</span>
                    <span className="font-bold text-blue-600">{activity.action}</span>
                    <span className="text-gray-500 mx-1">sur</span>
                    <span className="font-bold text-gray-900">{activity.target}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addProduct}
        onEdit={updateProduct}
        initialData={editingProduct}
      />
    </div>
  );
};
