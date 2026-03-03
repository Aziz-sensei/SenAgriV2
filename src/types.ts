export type Role = 'consumer' | 'producer' | 'admin' | null;

export type Category = 'legume' | 'cereale' | 'fruit' | 'elevage' | 'pack';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: Category;
  stock: number;
  producerId: string;
  isPack?: boolean;
  includedProducts?: string[]; // IDs of products in pack
  packComposition?: {
    name: string;
    quantity: string;
    price: number;
  }[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface UserState {
  role: Role;
}
