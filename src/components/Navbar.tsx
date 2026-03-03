import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, LogOut, LayoutDashboard, Store, Package } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export const Navbar = () => {
  const { role, logout, user } = useUser();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();

  const isConsumer = role === 'consumer';
  const isAdmin = role === 'admin';
  const isProducer = role === 'producer';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">SenAgri Market</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {isConsumer && (
              <>
                <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>Catalogue</Link>
                <Link to="/packs" className={`text-sm font-medium ${location.pathname === '/packs' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>Packs</Link>
              </>
            )}
            {isProducer && (
              <>
                <Link to="/" className={`flex items-center gap-2 text-sm font-medium ${location.pathname === '/' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/inventory" className={`flex items-center gap-2 text-sm font-medium ${location.pathname === '/inventory' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>
                  <Package size={18} /> Inventaire
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link to="/" className={`flex items-center gap-2 text-sm font-medium ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                  <LayoutDashboard size={18} /> Admin Panel
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right mr-2">
              <p className={cn(
                "text-[10px] uppercase font-bold",
                isAdmin ? "text-blue-600" : isProducer ? "text-yellow-600" : "text-green-600"
              )}>
                {role === 'consumer' ? 'Consommateur' : role === 'producer' ? 'Producteur' : 'Administrateur'}
              </p>
              <p className="text-xs font-medium text-gray-600">{user?.email || 'Mode Prototype'}</p>
            </div>
            {isConsumer && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-500 hover:text-green-600 transition-colors"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                console.log('Navbar: Logout button clicked');
                logout();
              }} 
              className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2"
              title="Se déconnecter"
            >
              <span className="text-xs font-bold hidden sm:inline">QUITTER</span>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
