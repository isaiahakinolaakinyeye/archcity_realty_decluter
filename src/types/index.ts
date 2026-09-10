export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  customerType?: 'BUYER' | 'SELLER' | 'BOTH' | 'PROSPECT';
  purchaseCount?: number;
  totalPurchased?: number;
  totalPaid?: number;
  outstandingBalance?: number;
  itemsSoldToBusinessCount?: number;
  totalReceivedByCustomer?: number;
  lastTransactionDate?: string | null;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  productCount?: number;
  totalUnitsPurchased?: number;
  totalUnitsSold?: number;
  totalUnitsRemaining?: number;
  totalSalesRevenue?: number;
  totalPurchaseCost?: number;
  realizedProfit?: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  image?: string;
  categoryId: string;
  categoryName?: string;
  quantityPurchased: number;
  quantitySold: number;
  quantityRemaining: number;
  purchasePricePerUnit: number;
  sellingPricePerUnit?: number;
  sellerCustomerId: string;
  seller?: {
    id: string;
    name: string;
    phone: string;
    address?: string;
  } | null;
  unitProfit?: number;
  potentialTotalProfit?: number;
  realizedProfit?: number;
  purchaseDate?: string;
  status: 'AVAILABLE' | 'PARTIALLY SOLD' | 'SOLD OUT';
  createdAt?: string;
}

export interface Payment {
  id: string;
  saleId: string;
  amount: number;
  paymentDate: string;
  recordedBy?: string;
  createdAt?: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  categoryName?: string;
  categoryId?: string;
  buyerCustomerId: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  quantity: number;
  sellingPricePerUnit: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: 'PAID' | 'PARTIALLY PAID' | 'UNPAID';
  soldBy: string;
  soldByName?: string;
  saleDate: string;
  paymentCount?: number;
  lastPaymentDate?: string | null;
  payments?: Payment[];
  createdAt?: string;
}

export interface AdminAnalytics {
  cards: {
    totalPurchaseCost: number;
    totalSales: number;
    totalMoneyCollected: number;
    outstandingPayments: number;
    totalProfit: number;
    itemsPurchased: number;
    itemsSold: number;
    itemsRemaining: number;
  };
  salesTrend: Array<{
    month: string;
    sales: number;
    cash: number;
    orders: number;
  }>;
  categoryStats: Array<{
    id: string;
    name: string;
    revenue: number;
    unitsSold: number;
  }>;
  inventoryStatus: {
    available: number;
    partiallySold: number;
    soldOut: number;
    totalCount: number;
  };
}

export interface StaffAnalytics {
  todaySales: number;
  monthSales: number;
  totalCollected: number;
  outstandingInstallmentBalance: number;
  numberOfSales: number;
}
