# SenAgri Market

Marketplace Agricole du Sénégal — React + Supabase

## Prérequis

- Node.js >= 18
- Un projet [Supabase](https://supabase.com)

## Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Créer un fichier `.env` à la racine avec vos clés Supabase :
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-anon-key
   VITE_ADMIN_EMAIL=bass123@gmail.com
   VITE_ADMIN_PASSWORD=passer123
   ```

3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## Déploiement (Vercel / Netlify)

1. Connecter le repo à Vercel ou Netlify
2. **Build command** : `npm run build`
3. **Output directory** : `dist`
4. Ajouter les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) dans les settings du projet

## Tables Supabase requises

- `profiles` (id uuid PK, role text)
- `products` (id uuid PK, name, description, price, unit, image, category, stock, producer_id, is_pack, pack_composition jsonb)
- `orders` (id uuid PK, total, status, delivery_method, created_at)
- `order_items` (id uuid PK, order_id, product_id, quantity, price_at_time)
