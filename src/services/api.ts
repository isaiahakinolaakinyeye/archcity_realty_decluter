import {
  User,
  Product,
  Category,
  Customer,
  Sale,
  Payment,
  AdminAnalytics,
  StaffAnalytics,
} from '../types';

export const API_BASE = (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '') + '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('declutter_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => request<{ user: User }>('/auth/me'),
  },

  inventory: {
    getAll: (params?: {
      status?: string;
      categoryId?: string;
      search?: string;
      availableOnly?: boolean;
      sellerId?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.categoryId) query.append('categoryId', params.categoryId);
      if (params?.search) query.append('search', params.search);
      if (params?.availableOnly) query.append('availableOnly', 'true');
      if (params?.sellerId) query.append('sellerId', params.sellerId);
      const q = query.toString();
      return request<Product[]>(`/inventory${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => request<Product>(`/inventory/${id}`),
    create: (data: {
      name: string;
      image?: string;
      categoryId: string;
      quantity: number;
      purchasePricePerUnit: number;
      sellingPricePerUnit?: number;
      sellerName: string;
      sellerPhone: string;
      sellerAddress?: string;
      purchaseDate?: string;
    }) =>
      request<Product>('/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Product>) =>
      request<Product>(`/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/inventory/${id}`, {
        method: 'DELETE',
      }),
  },

  categories: {
    getAll: () => request<Category[]>('/categories'),
    create: (name: string) =>
      request<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    update: (id: string, name: string) =>
      request<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  sales: {
    getAll: (params?: {
      paymentStatus?: string;
      categoryId?: string;
      soldBy?: string;
      month?: string;
      year?: string;
      search?: string;
      customerId?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
      if (params?.categoryId) query.append('categoryId', params.categoryId);
      if (params?.soldBy) query.append('soldBy', params.soldBy);
      if (params?.month) query.append('month', params.month);
      if (params?.year) query.append('year', params.year);
      if (params?.search) query.append('search', params.search);
      if (params?.customerId) query.append('customerId', params.customerId);
      const q = query.toString();
      return request<Sale[]>(`/sales${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => request<Sale>(`/sales/${id}`),
    create: (data: {
      productId: string;
      quantity: number;
      buyerName: string;
      buyerPhone: string;
      buyerAddress?: string;
      sellingPricePerUnit?: number;
      amountPaid: number;
      paymentType: 'FULL' | 'INSTALLMENT';
      soldBy: string;
    }) =>
      request<{ sale: Sale; payment: Payment | null; product: Product; customer: Customer }>('/sales', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  payments: {
    getBySaleId: (saleId: string) => request<Payment[]>(`/payments?saleId=${saleId}`),
    addPayment: (data: { saleId: string; amount: number; recordedBy: string; paymentDate?: string }) =>
      request<{ payment: Payment; sale: Sale }>('/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  customers: {
    getAll: (params?: { filter?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.filter) query.append('filter', params.filter);
      if (params?.search) query.append('search', params.search);
      const q = query.toString();
      return request<Customer[]>(`/customers${q ? `?${q}` : ''}`);
    },
    getById: (id: string) =>
      request<
        Customer & {
          stats: {
            purchaseCount: number;
            totalSpent: number;
            totalPaid: number;
            outstandingBalance: number;
            itemsSoldToBusinessCount: number;
            totalReceivedByCustomer: number;
            totalTransactions: number;
          };
          buyingTransactions: Array<{
            saleId: string;
            productId: string;
            productName: string;
            productImage: string;
            categoryName: string;
            quantity: number;
            unitPrice: number;
            totalAmount: number;
            amountPaid: number;
            balance: number;
            paymentStatus: string;
            date: string;
          }>;
          sellingTransactions: Array<{
            productId: string;
            productName: string;
            productImage: string;
            categoryName: string;
            quantity: number;
            purchasePricePerUnit: number;
            totalReceived: number;
            date: string;
            status: string;
          }>;
        }
      >(`/customers/${id}`),
  },

  analytics: {
    getAdmin: (params?: { month?: string; year?: string }) => {
      const query = new URLSearchParams();
      if (params?.month) query.append('month', params.month);
      if (params?.year) query.append('year', params.year);
      const q = query.toString();
      return request<AdminAnalytics>(`/analytics/admin${q ? `?${q}` : ''}`);
    },
    getStaff: (params?: { staffId?: string }) => {
      const query = new URLSearchParams();
      if (params?.staffId) query.append('staffId', params.staffId);
      const q = query.toString();
      return request<StaffAnalytics>(`/analytics/staff${q ? `?${q}` : ''}`);
    },
  },

  // Public storefront — no auth required
  publicInventory: {
    getAvailable: (params?: { categoryId?: string; search?: string }) => {
      const query = new URLSearchParams();
      query.append('availableOnly', 'true');
      if (params?.categoryId && params.categoryId !== 'ALL') query.append('categoryId', params.categoryId);
      if (params?.search) query.append('search', params.search);
      return request<Product[]>(`/inventory?${query.toString()}`);
    },
    getById: (id: string) => request<Product>(`/inventory/${id}`),
    getCategories: () => request<Category[]>('/categories'),
  },

  upload: async (base64Data: string): Promise<{ url: string }> => {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64Data }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || 'Upload failed');
    return json as { url: string };
  },
};
