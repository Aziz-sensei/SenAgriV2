import { Product } from './types';

export const CATEGORY_LABELS: Record<string, string> = {
  legume: 'Légumes',
  fruit: 'Fruits',
  cereale: 'Céréales',
  elevage: 'Volaille & Élevage',
  pack: 'Packs Agricoles'
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Riz local de Casamance',
    description: 'Riz long grain parfumé, cultivé traditionnellement en Casamance.',
    price: 800,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    category: 'cereale',
    stock: 100,
    producerId: 'p1'
  },
  {
    id: '2',
    name: 'Tomates fraîches',
    description: 'Tomates charnues et mûres à point, idéales pour vos sauces.',
    price: 500,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    category: 'legume',
    stock: 50,
    producerId: 'p1'
  },
  {
    id: '3',
    name: 'Oignons locaux',
    description: 'Oignons de qualité supérieure, récoltés dans la zone des Niayes.',
    price: 400,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=800',
    category: 'legume',
    stock: 200,
    producerId: 'p2'
  },
  {
    id: '4',
    name: 'Arachides décortiquées',
    description: 'Arachides croquantes, parfaites pour la pâte d\'arachide ou le goûter.',
    price: 600,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1567892324421-1c44371e1f9a?auto=format&fit=crop&q=80&w=800',
    category: 'cereale',
    stock: 80,
    producerId: 'p2'
  },
  {
    id: '5',
    name: 'Poulets fermiers',
    description: 'Poulets élevés en plein air, nourris aux grains naturels.',
    price: 3000,
    unit: 'unité',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800',
    category: 'elevage',
    stock: 30,
    producerId: 'p3'
  },
  {
    id: '6',
    name: 'Maïs local',
    description: 'Maïs jaune riche en nutriments, idéal pour le bétail ou la consommation humaine.',
    price: 300,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800',
    category: 'cereale',
    stock: 150,
    producerId: 'p3'
  },
  {
    id: 'p-1',
    name: 'Pack Famille Essentiel',
    description: 'L\'essentiel pour une famille : Riz, Huile, Oignons, Pommes de terre.',
    price: 15000,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    category: 'pack',
    stock: 10,
    producerId: 'admin',
    isPack: true,
    packComposition: [
      { name: 'Riz local', quantity: '10kg', price: 8000 },
      { name: 'Huile de tournesol', quantity: '5L', price: 4500 },
      { name: 'Oignons', quantity: '5kg', price: 2000 },
      { name: 'Pommes de terre', quantity: '2kg', price: 500 }
    ]
  },
  {
    id: 'p-2',
    name: 'Pack Étudiant',
    description: 'Petit pack économique pour les étudiants.',
    price: 5000,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1506484334402-40f21557d66a?auto=format&fit=crop&q=80&w=800',
    category: 'pack',
    stock: 25,
    producerId: 'admin',
    isPack: true,
    packComposition: [
      { name: 'Riz local', quantity: '2kg', price: 1600 },
      { name: 'Huile', quantity: '1L', price: 1000 },
      { name: 'Oignons', quantity: '1kg', price: 400 },
      { name: 'Pâtes alimentaires', quantity: '4 paquets', price: 2000 }
    ]
  },
  {
    id: 'p-3',
    name: 'Pack Premium',
    description: 'Le meilleur de nos terroirs dans un seul pack.',
    price: 25000,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800',
    category: 'pack',
    stock: 5,
    producerId: 'admin',
    isPack: true,
    packComposition: [
      { name: 'Riz parfumé', quantity: '25kg', price: 18000 },
      { name: 'Huile Premium', quantity: '10L', price: 9000 },
      { name: 'Oignons Niayes', quantity: '10kg', price: 4000 },
      { name: 'Poulets fermiers', quantity: '2 unités', price: 6000 }
    ]
  }
];
