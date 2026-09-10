export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STAFF';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  categoryId: string;
  quantityPurchased: number;
  quantitySold: number;
  quantityRemaining: number;
  purchasePricePerUnit: number;
  sellingPricePerUnit: number;
  sellerCustomerId: string;
  purchaseDate: string;
  status: 'AVAILABLE' | 'PARTIALLY SOLD' | 'SOLD OUT';
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  buyerCustomerId: string;
  quantity: number;
  sellingPricePerUnit: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: 'PAID' | 'PARTIALLY PAID' | 'UNPAID';
  soldBy: string;
  saleDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  saleId: string;
  amount: number;
  paymentDate: string;
  recordedBy: string;
  createdAt: string;
}

export const initialUsers: User[] = [
  {
    id: 'user-admin-1',
    name: 'Babajide Ogundimu (Admin)',
    email: 'admin@declutter.ng',
    password: 'admin123',
    role: 'ADMIN',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'user-staff-1',
    name: 'Chioma Okonjo (Staff)',
    email: 'staff@declutter.ng',
    password: 'staff123',
    role: 'STAFF',
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'user-staff-2',
    name: 'Emeka Okafor (Staff)',
    email: 'emeka@declutter.ng',
    password: 'staff123',
    role: 'STAFF',
    createdAt: '2026-02-01T09:00:00.000Z',
  }
];

export const initialCategories: Category[] = [
  { id: 'cat-electronics', name: 'Electronics', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat-furniture', name: 'Furniture', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat-appliances', name: 'Home Appliances', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat-office', name: 'Office Equipment', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat-kitchen', name: 'Kitchenware', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat-fashion', name: 'Fashion & Luxury', createdAt: '2026-01-01T00:00:00.000Z' },
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Tunde Adeyemi',
    phone: '08031234567',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'cust-2',
    name: 'Ngozi Eze',
    phone: '08029876543',
    address: '8 Allen Avenue, Ikeja, Lagos',
    createdAt: '2026-02-01T11:00:00.000Z',
  },
  {
    id: 'cust-3',
    name: 'Ibrahim Musa',
    phone: '08145551234',
    address: '22 Gana Street, Maitama, Abuja',
    createdAt: '2026-02-10T14:30:00.000Z',
  },
  {
    id: 'cust-4',
    name: 'Fatima Bello',
    phone: '08091112233',
    address: '5 Ahmadu Bello Way, Victoria Island, Lagos',
    createdAt: '2026-03-05T09:15:00.000Z',
  },
  {
    id: 'cust-5',
    name: 'David Adeleke',
    phone: '08076543210',
    address: '19 Bourdillon Road, Ikoyi, Lagos',
    createdAt: '2026-03-20T16:00:00.000Z',
  },
  {
    id: 'cust-6',
    name: 'Folashade Alakija',
    phone: '08123456789',
    address: '3 Glover Road, Ikoyi, Lagos',
    createdAt: '2026-04-12T13:45:00.000Z',
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Samsung 55-inch Crystal UHD 4K Smart TV',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-electronics',
    quantityPurchased: 1,
    quantitySold: 0,
    quantityRemaining: 1,
    purchasePricePerUnit: 180000,
    sellingPricePerUnit: 275000,
    sellerCustomerId: 'cust-1',
    purchaseDate: '2026-08-01T10:00:00.000Z',
    status: 'AVAILABLE',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Ergonomic High-Back Mesh Office Chair',
    image: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-office',
    quantityPurchased: 10,
    quantitySold: 4,
    quantityRemaining: 6,
    purchasePricePerUnit: 25000,
    sellingPricePerUnit: 45000,
    sellerCustomerId: 'cust-3',
    purchaseDate: '2026-08-10T12:00:00.000Z',
    status: 'PARTIALLY SOLD',
    createdAt: '2026-08-10T12:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'LG Dual Inverter 1.5HP Split Air Conditioner',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-appliances',
    quantityPurchased: 2,
    quantitySold: 2,
    quantityRemaining: 0,
    purchasePricePerUnit: 140000,
    sellingPricePerUnit: 215000,
    sellerCustomerId: 'cust-1',
    purchaseDate: '2026-07-15T09:30:00.000Z',
    status: 'SOLD OUT',
    createdAt: '2026-07-15T09:30:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Solid Teak Wood Dining Table + 6 Padded Chairs',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-furniture',
    quantityPurchased: 1,
    quantitySold: 0,
    quantityRemaining: 1,
    purchasePricePerUnit: 160000,
    sellingPricePerUnit: 250000,
    sellerCustomerId: 'cust-6',
    purchaseDate: '2026-08-20T15:00:00.000Z',
    status: 'AVAILABLE',
    createdAt: '2026-08-20T15:00:00.000Z',
  },
  {
    id: 'prod-5',
    name: 'Apple MacBook Pro M1 16GB 512GB Space Gray',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-electronics',
    quantityPurchased: 1,
    quantitySold: 1,
    quantityRemaining: 0,
    purchasePricePerUnit: 480000,
    sellingPricePerUnit: 680000,
    sellerCustomerId: 'cust-6',
    purchaseDate: '2026-07-28T11:00:00.000Z',
    status: 'SOLD OUT',
    createdAt: '2026-07-28T11:00:00.000Z',
  },
  {
    id: 'prod-6',
    name: 'Kenwood Titanium Chef Stand Mixer with Bowl',
    image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-kitchen',
    quantityPurchased: 4,
    quantitySold: 1,
    quantityRemaining: 3,
    purchasePricePerUnit: 50000,
    sellingPricePerUnit: 85000,
    sellerCustomerId: 'cust-3',
    purchaseDate: '2026-08-15T14:00:00.000Z',
    status: 'PARTIALLY SOLD',
    createdAt: '2026-08-15T14:00:00.000Z',
  },
  {
    id: 'prod-7',
    name: 'Hisense 200L Deep Freezer with Fast Freeze',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-appliances',
    quantityPurchased: 1,
    quantitySold: 0,
    quantityRemaining: 1,
    purchasePricePerUnit: 95000,
    sellingPricePerUnit: 155000,
    sellerCustomerId: 'cust-1',
    purchaseDate: '2026-09-01T10:00:00.000Z',
    status: 'AVAILABLE',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'prod-8',
    name: 'Designer Italian Leather Sectional Sofa (L-Shape)',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-furniture',
    quantityPurchased: 1,
    quantitySold: 0,
    quantityRemaining: 1,
    purchasePricePerUnit: 220000,
    sellingPricePerUnit: 360000,
    sellerCustomerId: 'cust-6',
    purchaseDate: '2026-09-02T13:00:00.000Z',
    status: 'AVAILABLE',
    createdAt: '2026-09-02T13:00:00.000Z',
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sale-1',
    productId: 'prod-3',
    buyerCustomerId: 'cust-2',
    quantity: 2,
    sellingPricePerUnit: 215000,
    totalAmount: 430000,
    amountPaid: 430000,
    balance: 0,
    paymentStatus: 'PAID',
    soldBy: 'user-staff-1',
    saleDate: '2026-07-25T14:30:00.000Z',
    createdAt: '2026-07-25T14:30:00.000Z',
  },
  {
    id: 'sale-2',
    productId: 'prod-5',
    buyerCustomerId: 'cust-5',
    quantity: 1,
    sellingPricePerUnit: 680000,
    totalAmount: 680000,
    amountPaid: 450000,
    balance: 230000,
    paymentStatus: 'PARTIALLY PAID',
    soldBy: 'user-staff-1',
    saleDate: '2026-08-05T11:20:00.000Z',
    createdAt: '2026-08-05T11:20:00.000Z',
  },
  {
    id: 'sale-3',
    productId: 'prod-2',
    buyerCustomerId: 'cust-4',
    quantity: 2,
    sellingPricePerUnit: 45000,
    totalAmount: 90000,
    amountPaid: 50000,
    balance: 40000,
    paymentStatus: 'PARTIALLY PAID',
    soldBy: 'user-staff-2',
    saleDate: '2026-08-15T16:00:00.000Z',
    createdAt: '2026-08-15T16:00:00.000Z',
  },
  {
    id: 'sale-4',
    productId: 'prod-2',
    buyerCustomerId: 'cust-1',
    quantity: 2,
    sellingPricePerUnit: 45000,
    totalAmount: 90000,
    amountPaid: 90000,
    balance: 0,
    paymentStatus: 'PAID',
    soldBy: 'user-admin-1',
    saleDate: '2026-08-22T10:45:00.000Z',
    createdAt: '2026-08-22T10:45:00.000Z',
  },
  {
    id: 'sale-5',
    productId: 'prod-6',
    buyerCustomerId: 'cust-2',
    quantity: 1,
    sellingPricePerUnit: 85000,
    totalAmount: 85000,
    amountPaid: 85000,
    balance: 0,
    paymentStatus: 'PAID',
    soldBy: 'user-staff-1',
    saleDate: '2026-09-03T12:15:00.000Z',
    createdAt: '2026-09-03T12:15:00.000Z',
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'pay-1',
    saleId: 'sale-1',
    amount: 430000,
    paymentDate: '2026-07-25T14:30:00.000Z',
    recordedBy: 'user-staff-1',
    createdAt: '2026-07-25T14:30:00.000Z',
  },
  {
    id: 'pay-2',
    saleId: 'sale-2',
    amount: 300000,
    paymentDate: '2026-08-05T11:20:00.000Z',
    recordedBy: 'user-staff-1',
    createdAt: '2026-08-05T11:20:00.000Z',
  },
  {
    id: 'pay-3',
    saleId: 'sale-2',
    amount: 150000,
    paymentDate: '2026-08-20T10:00:00.000Z',
    recordedBy: 'user-admin-1',
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'pay-4',
    saleId: 'sale-3',
    amount: 50000,
    paymentDate: '2026-08-15T16:00:00.000Z',
    recordedBy: 'user-staff-2',
    createdAt: '2026-08-15T16:00:00.000Z',
  },
  {
    id: 'pay-5',
    saleId: 'sale-4',
    amount: 90000,
    paymentDate: '2026-08-22T10:45:00.000Z',
    recordedBy: 'user-admin-1',
    createdAt: '2026-08-22T10:45:00.000Z',
  },
  {
    id: 'pay-6',
    saleId: 'sale-5',
    amount: 85000,
    paymentDate: '2026-09-03T12:15:00.000Z',
    recordedBy: 'user-staff-1',
    createdAt: '2026-09-03T12:15:00.000Z',
  }
];
