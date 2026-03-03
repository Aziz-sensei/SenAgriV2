-- ============================================================
-- SenAgri Market - Script SQL Supabase
-- À exécuter dans: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ============================
-- 1. TABLE: profiles
-- ============================
-- Stocke le rôle de chaque utilisateur (consumer, producer, admin)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'producer', 'admin')) DEFAULT 'consumer',
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- 2. TABLE: products
-- ============================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  image TEXT,
  category TEXT NOT NULL CHECK (category IN ('legume', 'cereale', 'fruit', 'elevage', 'pack')),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  producer_id TEXT NOT NULL,
  is_pack BOOLEAN DEFAULT false,
  pack_composition JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- 3. TABLE: orders
-- ============================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total INTEGER NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  delivery_method TEXT CHECK (delivery_method IN ('home', 'relay')) DEFAULT 'home',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- 4. TABLE: order_items
-- ============================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time INTEGER NOT NULL CHECK (price_at_time >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- 5. INDEXES pour performance
-- ============================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_producer ON products(producer_id);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================
-- 6. TRIGGER: updated_at automatique
-- ============================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================

-- === PROFILES ===
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les profils
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Un utilisateur peut modifier son propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Un utilisateur peut insérer son propre profil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- === PRODUCTS ===
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les produits
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Les utilisateurs authentifiés peuvent ajouter des produits
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Le producteur peut modifier ses propres produits
CREATE POLICY "Producers can update own products"
  ON products FOR UPDATE
  USING (auth.uid()::text = producer_id OR producer_id = 'admin');

-- Le producteur peut supprimer ses propres produits
CREATE POLICY "Producers can delete own products"
  ON products FOR DELETE
  USING (auth.uid()::text = producer_id OR producer_id = 'admin');

-- === ORDERS ===
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Un utilisateur peut voir ses propres commandes
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs authentifiés peuvent créer des commandes
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- === ORDER_ITEMS ===
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Les items sont visibles si l'utilisateur est propriétaire de la commande
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Les utilisateurs authentifiés peuvent ajouter des items
CREATE POLICY "Authenticated users can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================
-- 8. FONCTION: créer un profil automatiquement à l'inscription
-- ============================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'consumer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 9. SEED DATA: Produits initiaux
-- ============================================================
INSERT INTO products (id, name, description, price, unit, image, category, stock, producer_id, is_pack, pack_composition) VALUES
  (
    gen_random_uuid(),
    'Riz local de Casamance',
    'Riz long grain parfumé, cultivé traditionnellement en Casamance.',
    800, 'kg',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    'cereale', 100, 'admin', false, NULL
  ),
  (
    gen_random_uuid(),
    'Tomates fraîches',
    'Tomates charnues et mûres à point, idéales pour vos sauces.',
    500, 'kg',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    'legume', 50, 'admin', false, NULL
  ),
  (
    gen_random_uuid(),
    'Oignons locaux',
    'Oignons de qualité supérieure, récoltés dans la zone des Niayes.',
    400, 'kg',
    'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=800',
    'legume', 200, 'admin', false, NULL
  ),
  (
    gen_random_uuid(),
    'Arachides décortiquées',
    'Arachides croquantes, parfaites pour la pâte d''arachide ou le goûter.',
    600, 'kg',
    'https://images.unsplash.com/photo-1567892324421-1c44371e1f9a?auto=format&fit=crop&q=80&w=800',
    'cereale', 80, 'admin', false, NULL
  ),
  (
    gen_random_uuid(),
    'Poulets fermiers',
    'Poulets élevés en plein air, nourris aux grains naturels.',
    3000, 'unité',
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800',
    'elevage', 30, 'admin', false, NULL
  ),
  (
    gen_random_uuid(),
    'Maïs local',
    'Maïs jaune riche en nutriments, idéal pour le bétail ou la consommation humaine.',
    300, 'kg',
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800',
    'cereale', 150, 'admin', false, NULL
  ),
  (
    gen_random_uuid(),
    'Pack Famille Essentiel',
    'L''essentiel pour une famille : Riz, Huile, Oignons, Pommes de terre.',
    15000, 'pack',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    'pack', 10, 'admin', true,
    '[{"name": "Riz local", "quantity": "10kg", "price": 8000}, {"name": "Huile de tournesol", "quantity": "5L", "price": 4500}, {"name": "Oignons", "quantity": "5kg", "price": 2000}, {"name": "Pommes de terre", "quantity": "2kg", "price": 500}]'::jsonb
  ),
  (
    gen_random_uuid(),
    'Pack Étudiant',
    'Petit pack économique pour les étudiants.',
    5000, 'pack',
    'https://images.unsplash.com/photo-1506484334402-40f21557d66a?auto=format&fit=crop&q=80&w=800',
    'pack', 25, 'admin', true,
    '[{"name": "Riz local", "quantity": "2kg", "price": 1600}, {"name": "Huile", "quantity": "1L", "price": 1000}, {"name": "Oignons", "quantity": "1kg", "price": 400}, {"name": "Pâtes alimentaires", "quantity": "4 paquets", "price": 2000}]'::jsonb
  ),
  (
    gen_random_uuid(),
    'Pack Premium',
    'Le meilleur de nos terroirs dans un seul pack.',
    25000, 'pack',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800',
    'pack', 5, 'admin', true,
    '[{"name": "Riz parfumé", "quantity": "25kg", "price": 18000}, {"name": "Huile Premium", "quantity": "10L", "price": 9000}, {"name": "Oignons Niayes", "quantity": "10kg", "price": 4000}, {"name": "Poulets fermiers", "quantity": "2 unités", "price": 6000}]'::jsonb
  );

-- ============================================================
-- DONE! Vérification rapide:
-- ============================================================
-- SELECT count(*) FROM products;       -- Devrait retourner 9
-- SELECT count(*) FROM profiles;       -- Dépend des inscriptions
-- SELECT * FROM products LIMIT 5;      -- Voir les produits
