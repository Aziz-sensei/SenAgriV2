import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { RoleSelection } from './pages/RoleSelection';
import { AuthPage } from './pages/AuthPage';
import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { ProducerDashboard } from './pages/ProducerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';

const AppContent = () => {
  const { user, role, loading } = useUser();

  console.log('App Rendering State:', { 
    hasUser: !!user, 
    role: role, 
    isLoading: loading 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // 1. Show RoleSelection first if no role is selected
  if (!role) {
    return <RoleSelection />;
  }

  // 2. Then show AuthPage if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // 3. Finally show the app content
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-grow">
        <Routes>
          {role === 'consumer' ? (
            <>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/packs" element={<CatalogPage filterPacks />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : role === 'producer' ? (
            <>
              <Route path="/" element={<ProducerDashboard />} />
              <Route path="/inventory" element={<ProducerDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </main>
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2026 SenAgri Market - Marketplace Agricole du Sénégal</p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-300 uppercase tracking-widest">
            <span>Dakar</span>
            <span>Saint-Louis</span>
            <span>Casamance</span>
            <span>Kaolack</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <UserProvider>
        <ProductProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </UserProvider>
    </Router>
  );
}
