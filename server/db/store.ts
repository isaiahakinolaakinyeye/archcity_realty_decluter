import { pool, pingDatabase } from './pool.js';
import {
  initialUsers,
  initialCategories,
  initialCustomers,
  initialProducts,
  initialSales,
  initialPayments,
  User,
  Category,
  Customer,
  Product,
  Sale,
  Payment,
} from './seedData.js';
import fs from 'fs';
import path from 'path';

let isPgConnected = false;

// In-memory persistent arrays for immediate use / fallback
let users: User[] = JSON.parse(JSON.stringify(initialUsers));
let categories: Category[] = JSON.parse(JSON.stringify(initialCategories));
let customers: Customer[] = JSON.parse(JSON.stringify(initialCustomers));
let products: Product[] = JSON.parse(JSON.stringify(initialProducts));
let sales: Sale[] = JSON.parse(JSON.stringify(initialSales));
let payments: Payment[] = JSON.parse(JSON.stringify(initialPayments));

export async function initStore() {
  isPgConnected = await pingDatabase();

  if (isPgConnected) {
    try {
      console.log('[DB] Connected to PostgreSQL! Initializing schema...');
      // Execute schema
      const schemaPath = path.resolve(process.cwd(), 'server', 'db', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('[DB] Schema migrations applied successfully.');
      }

      // Check if users exist; if not, seed Postgres
      const { rows: userRows } = await pool.query('SELECT COUNT(*) as count FROM users');
      if (parseInt(userRows[0].count, 10) === 0) {
        console.log('[DB] Seeding PostgreSQL database with initial data...');
        for (const u of initialUsers) {
          await pool.query(
            'INSERT INTO users (id, name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
            [u.id, u.name, u.email, u.password, u.role, u.createdAt]
          );
        }
        for (const c of initialCategories) {
          await pool.query(
            'INSERT INTO categories (id, name, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [c.id, c.name, c.createdAt]
          );
        }
        for (const cust of initialCustomers) {
          await pool.query(
            'INSERT INTO customers (id, name, phone, address, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
            [cust.id, cust.name, cust.phone, cust.address, cust.createdAt]
          );
        }
        for (const p of initialProducts) {
          await pool.query(
            `INSERT INTO products (id, name, image, category_id, quantity_purchased, quantity_sold, quantity_remaining, purchase_price_per_unit, selling_price_per_unit, seller_customer_id, purchase_date, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT DO NOTHING`,
            [
              p.id,
              p.name,
              p.image,
              p.categoryId,
              p.quantityPurchased,
              p.quantitySold,
              p.quantityRemaining,
              p.purchasePricePerUnit,
              p.sellingPricePerUnit,
              p.sellerCustomerId,
              p.purchaseDate,
              p.status,
              p.createdAt,
            ]
          );
        }
        for (const s of initialSales) {
          await pool.query(
            `INSERT INTO sales (id, product_id, buyer_customer_id, quantity, selling_price_per_unit, total_amount, amount_paid, balance, payment_status, sold_by, sale_date, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT DO NOTHING`,
            [
              s.id,
              s.productId,
              s.buyerCustomerId,
              s.quantity,
              s.sellingPricePerUnit,
              s.totalAmount,
              s.amountPaid,
              s.balance,
              s.paymentStatus,
              s.soldBy,
              s.saleDate,
              s.createdAt,
            ]
          );
        }
        for (const py of initialPayments) {
          await pool.query(
            'INSERT INTO payments (id, sale_id, amount, payment_date, recorded_by, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
            [py.id, py.saleId, py.amount, py.paymentDate, py.recordedBy, py.createdAt]
          );
        }
        console.log('[DB] Seeding complete.');
      } else {
        // Hydrate in-memory arrays from PostgreSQL on server startup
        try {
          const { rows: pRows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
          if (pRows.length > 0) {
            products = pRows.map((r) => ({
              id: r.id,
              name: r.name,
              image: r.image,
              categoryId: r.category_id,
              quantityPurchased: r.quantity_purchased,
              quantitySold: r.quantity_sold,
              quantityRemaining: r.quantity_remaining,
              purchasePricePerUnit: parseFloat(r.purchase_price_per_unit),
              sellingPricePerUnit: r.selling_price_per_unit !== null ? parseFloat(r.selling_price_per_unit) : 0,
              sellerCustomerId: r.seller_customer_id,
              purchaseDate: r.purchase_date,
              status: r.status,
              createdAt: r.created_at,
            }));
          }
          const { rows: custRows } = await pool.query('SELECT * FROM customers ORDER BY name ASC');
          if (custRows.length > 0) {
            customers = custRows.map((r) => ({
              id: r.id,
              name: r.name,
              phone: r.phone,
              address: r.address || '',
              createdAt: r.created_at,
            }));
          }
          const { rows: sRows } = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC');
          if (sRows.length > 0) {
            sales = sRows.map((r) => ({
              id: r.id,
              productId: r.product_id,
              buyerCustomerId: r.buyer_customer_id,
              quantity: r.quantity,
              sellingPricePerUnit: parseFloat(r.selling_price_per_unit),
              totalAmount: parseFloat(r.total_amount),
              amountPaid: parseFloat(r.amount_paid),
              balance: parseFloat(r.balance),
              paymentStatus: r.payment_status,
              soldBy: r.sold_by,
              saleDate: r.sale_date,
              createdAt: r.created_at,
            }));
          }
          const { rows: payRows } = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
          if (payRows.length > 0) {
            payments = payRows.map((r) => ({
              id: r.id,
              saleId: r.sale_id,
              amount: parseFloat(r.amount),
              paymentDate: r.payment_date,
              recordedBy: r.recorded_by,
              createdAt: r.created_at,
            }));
          }
          console.log(`[DB] Hydrated store from PostgreSQL: ${products.length} products, ${customers.length} customers, ${sales.length} sales, ${payments.length} payments.`);
        } catch (err: any) {
          console.error('[DB] Error hydrating from Postgres:', err.message);
        }
      }
    } catch (err: any) {
      console.error('[DB] Error during PostgreSQL initialization:', err.message);
      isPgConnected = false;
    }
  } else {
    console.log('[Store] Running with in-memory transaction store. All features active!');
  }
}


export const db = {
  getIsPgConnected: () => isPgConnected,

  // USERS
  users: {
    findByEmail: async (email: string): Promise<User | null> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
          if (res.rows[0]) {
            const r = res.rows[0];
            return {
              id: r.id,
              name: r.name,
              email: r.email,
              password: r.password,
              role: r.role,
              createdAt: r.created_at,
            };
          }
          return null;
        } catch {
          // fallback
        }
      }
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    findById: async (id: string): Promise<User | null> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
          if (res.rows[0]) {
            const r = res.rows[0];
            return {
              id: r.id,
              name: r.name,
              email: r.email,
              password: r.password,
              role: r.role,
              createdAt: r.created_at,
            };
          }
          return null;
        } catch {}
      }
      return users.find((u) => u.id === id) || null;
    },
    getAll: async (): Promise<Omit<User, 'password'>[]> => {
      return users.map(({ password, ...rest }) => rest);
    }
  },

  // CATEGORIES
  categories: {
    getAll: async (): Promise<Category[]> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM categories ORDER BY name ASC');
          return res.rows.map((r) => ({
            id: r.id,
            name: r.name,
            createdAt: r.created_at,
          }));
        } catch {}
      }
      return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    },
    findById: async (id: string): Promise<Category | null> => {
      return categories.find((c) => c.id === id) || null;
    },
    create: async (name: string): Promise<Category> => {
      const existing = categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
      if (existing) {
        throw new Error('A category with this name already exists');
      }
      const newCat: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      if (isPgConnected) {
        try {
          await pool.query('INSERT INTO categories (id, name, created_at) VALUES ($1, $2, $3)', [
            newCat.id,
            newCat.name,
            newCat.createdAt,
          ]);
        } catch (err: any) {
          throw new Error(err.message);
        }
      }
      categories.push(newCat);
      return newCat;
    },
    update: async (id: string, name: string): Promise<Category> => {
      const cat = categories.find((c) => c.id === id);
      if (!cat) throw new Error('Category not found');
      const duplicate = categories.find(
        (c) => c.id !== id && c.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (duplicate) throw new Error('Another category already has this name');
      cat.name = name.trim();
      if (isPgConnected) {
        try {
          await pool.query('UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
            cat.name,
            id,
          ]);
        } catch {}
      }
      return cat;
    },
    delete: async (id: string): Promise<void> => {
      const hasProducts = products.some((p) => p.categoryId === id);
      if (hasProducts) {
        throw new Error('Cannot delete category: products are assigned to this category.');
      }
      categories = categories.filter((c) => c.id !== id);
      if (isPgConnected) {
        try {
          await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        } catch {}
      }
    },
  },

  // CUSTOMERS
  customers: {
    getAll: async (): Promise<Customer[]> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM customers ORDER BY name ASC');
          return res.rows.map((r) => ({
            id: r.id,
            name: r.name,
            phone: r.phone,
            address: r.address || '',
            createdAt: r.created_at,
          }));
        } catch (err: any) {
          console.error('[DB] Error reading customers from Postgres:', err.message);
        }
      }
      return [...customers];
    },
    findById: async (id: string): Promise<Customer | null> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
          if (res.rows[0]) {
            const r = res.rows[0];
            return {
              id: r.id,
              name: r.name,
              phone: r.phone,
              address: r.address || '',
              createdAt: r.created_at,
            };
          }
          return null;
        } catch {}
      }
      return customers.find((c) => c.id === id) || null;
    },
    findByPhone: async (phone: string): Promise<Customer | null> => {
      const clean = phone.replace(/[\s-]/g, '');
      if (isPgConnected) {
        try {
          const res = await pool.query(
            "SELECT * FROM customers WHERE REPLACE(REPLACE(phone, ' ', ''), '-', '') = $1",
            [clean]
          );
          if (res.rows[0]) {
            const r = res.rows[0];
            return {
              id: r.id,
              name: r.name,
              phone: r.phone,
              address: r.address || '',
              createdAt: r.created_at,
            };
          }
          return null;
        } catch {}
      }
      return customers.find((c) => c.phone.replace(/[\s-]/g, '') === clean) || null;
    },
    createOrFind: async (data: { name: string; phone: string; address?: string }): Promise<Customer> => {
      const cleanPhone = data.phone.trim();
      const existing = await db.customers.findByPhone(cleanPhone);
      if (existing) {
        let changed = false;
        if (data.name && data.name.trim() !== existing.name) {
          existing.name = data.name.trim();
          changed = true;
        }
        if (data.address && data.address.trim() && data.address.trim() !== existing.address) {
          existing.address = data.address.trim();
          changed = true;
        }
        if (changed && isPgConnected) {
          try {
            await pool.query(
              'UPDATE customers SET name = $1, address = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
              [existing.name, existing.address, existing.id]
            );
          } catch {}
        }
        const memIdx = customers.findIndex((c) => c.id === existing.id);
        if (memIdx !== -1) customers[memIdx] = existing;
        return existing;
      }
      const newCust: Customer = {
        id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: data.name.trim(),
        phone: cleanPhone,
        address: data.address?.trim() || '',
        createdAt: new Date().toISOString(),
      };
      if (isPgConnected) {
        try {
          await pool.query(
            'INSERT INTO customers (id, name, phone, address, created_at) VALUES ($1, $2, $3, $4, $5)',
            [newCust.id, newCust.name, newCust.phone, newCust.address, newCust.createdAt]
          );
        } catch (err: any) {
          console.error('[DB] Error inserting customer to Postgres:', err.message);
        }
      }
      customers.push(newCust);
      return newCust;
    },
    update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
      const cust = await db.customers.findById(id);
      if (!cust) throw new Error('Customer not found');
      if (data.name) cust.name = data.name.trim();
      if (data.phone) cust.phone = data.phone.trim();
      if (data.address !== undefined) cust.address = data.address.trim();

      if (isPgConnected) {
        try {
          await pool.query(
            'UPDATE customers SET name = $1, phone = $2, address = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
            [cust.name, cust.phone, cust.address, id]
          );
        } catch (err: any) {
          console.error('[DB] Error updating customer in Postgres:', err.message);
        }
      }
      const memIdx = customers.findIndex((c) => c.id === id);
      if (memIdx !== -1) customers[memIdx] = cust;
      return cust;
    }
  },

  // PRODUCTS / INVENTORY
  products: {
    getAll: async (): Promise<Product[]> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
          return res.rows.map((r) => ({
            id: r.id,
            name: r.name,
            image: r.image,
            categoryId: r.category_id,
            quantityPurchased: r.quantity_purchased,
            quantitySold: r.quantity_sold,
            quantityRemaining: r.quantity_remaining,
            purchasePricePerUnit: parseFloat(r.purchase_price_per_unit),
            sellingPricePerUnit: r.selling_price_per_unit !== null && r.selling_price_per_unit !== undefined ? parseFloat(r.selling_price_per_unit) : 0,
            sellerCustomerId: r.seller_customer_id,
            purchaseDate: r.purchase_date,
            status: r.status,
            createdAt: r.created_at,
          }));
        } catch (err: any) {
          console.error('[DB] Error reading products from Postgres:', err.message);
        }
      }
      return [...products];
    },
    findById: async (id: string): Promise<Product | null> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
          if (res.rows[0]) {
            const r = res.rows[0];
            return {
              id: r.id,
              name: r.name,
              image: r.image,
              categoryId: r.category_id,
              quantityPurchased: r.quantity_purchased,
              quantitySold: r.quantity_sold,
              quantityRemaining: r.quantity_remaining,
              purchasePricePerUnit: parseFloat(r.purchase_price_per_unit),
              sellingPricePerUnit: r.selling_price_per_unit !== null && r.selling_price_per_unit !== undefined ? parseFloat(r.selling_price_per_unit) : 0,
              sellerCustomerId: r.seller_customer_id,
              purchaseDate: r.purchase_date,
              status: r.status,
              createdAt: r.created_at,
            };
          }
          return null;
        } catch {}
      }
      return products.find((p) => p.id === id) || null;
    },
    create: async (data: {
      name: string;
      image?: string;
      categoryId: string;
      quantity: number;
      purchasePricePerUnit: number;
      sellingPricePerUnit: number;
      sellerName: string;
      sellerPhone: string;
      sellerAddress?: string;
      purchaseDate?: string;
    }): Promise<Product> => {
      if (data.quantity <= 0) throw new Error('Quantity must be greater than 0');
      if (data.purchasePricePerUnit < 0 || data.sellingPricePerUnit < 0) {
        throw new Error('Prices cannot be negative');
      }

      // Find or create seller customer
      const seller = await db.customers.createOrFind({
        name: data.sellerName,
        phone: data.sellerPhone,
        address: data.sellerAddress,
      });

      const newProd: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: data.name.trim(),
        image:
          data.image?.trim() ||
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80',
        categoryId: data.categoryId,
        quantityPurchased: data.quantity,
        quantitySold: 0,
        quantityRemaining: data.quantity,
        purchasePricePerUnit: data.purchasePricePerUnit,
        sellingPricePerUnit: data.sellingPricePerUnit,
        sellerCustomerId: seller.id,
        purchaseDate: data.purchaseDate || new Date().toISOString(),
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      };

      if (isPgConnected) {
        try {
          await pool.query(
            `INSERT INTO products (id, name, image, category_id, quantity_purchased, quantity_sold, quantity_remaining, purchase_price_per_unit, selling_price_per_unit, seller_customer_id, purchase_date, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              newProd.id,
              newProd.name,
              newProd.image,
              newProd.categoryId,
              newProd.quantityPurchased,
              newProd.quantitySold,
              newProd.quantityRemaining,
              newProd.purchasePricePerUnit,
              newProd.sellingPricePerUnit,
              newProd.sellerCustomerId,
              newProd.purchaseDate,
              newProd.status,
              newProd.createdAt,
            ]
          );
          console.log(`[DB] Product saved to PostgreSQL successfully: ${newProd.id} (${newProd.name})`);
        } catch (err: any) {
          console.error('[DB] Error saving product to Postgres:', err.message);
        }
      }

      products.unshift(newProd);
      return newProd;
    },
    update: async (id: string, data: Partial<Product>): Promise<Product> => {
      const prod = await db.products.findById(id);
      if (!prod) throw new Error('Product not found');
      if (data.name) prod.name = data.name.trim();
      if (data.image) prod.image = data.image.trim();
      if (data.categoryId) prod.categoryId = data.categoryId;
      if (data.purchasePricePerUnit !== undefined) prod.purchasePricePerUnit = data.purchasePricePerUnit;
      if (data.sellingPricePerUnit !== undefined) prod.sellingPricePerUnit = data.sellingPricePerUnit;
      if (data.quantityPurchased !== undefined) {
        prod.quantityPurchased = data.quantityPurchased;
        prod.quantityRemaining = prod.quantityPurchased - prod.quantitySold;
      }
      // Re-evaluate status
      if (prod.quantityRemaining <= 0) {
        prod.status = 'SOLD OUT';
      } else if (prod.quantitySold > 0) {
        prod.status = 'PARTIALLY SOLD';
      } else {
        prod.status = 'AVAILABLE';
      }

      if (isPgConnected) {
        try {
          await pool.query(
            `UPDATE products SET name = $1, image = $2, category_id = $3, purchase_price_per_unit = $4, selling_price_per_unit = $5, quantity_purchased = $6, quantity_remaining = $7, status = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9`,
            [
              prod.name,
              prod.image,
              prod.categoryId,
              prod.purchasePricePerUnit,
              prod.sellingPricePerUnit,
              prod.quantityPurchased,
              prod.quantityRemaining,
              prod.status,
              id,
            ]
          );
        } catch (err: any) {
          console.error('[DB] Error updating product in Postgres:', err.message);
        }
      }
      const memIdx = products.findIndex((p) => p.id === id);
      if (memIdx !== -1) products[memIdx] = prod;
      return prod;
    },
    delete: async (id: string): Promise<void> => {
      const prod = await db.products.findById(id);
      if (!prod) throw new Error('Product not found');
      const salesList = await db.sales.getAll();
      const hasSales = salesList.some((s) => s.productId === id);
      if (hasSales) {
        throw new Error('Cannot delete product: sales have already been recorded for this product.');
      }
      products = products.filter((p) => p.id !== id);
      if (isPgConnected) {
        try {
          await pool.query('DELETE FROM products WHERE id = $1', [id]);
        } catch (err: any) {
          console.error('[DB] Error deleting product from Postgres:', err.message);
        }
      }
    }
  },

  // SALES & ATOMIC TRANSACTION LOGIC (Section 32, 42, 58)
  sales: {
    getAll: async (): Promise<Sale[]> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC');
          return res.rows.map((r) => ({
            id: r.id,
            productId: r.product_id,
            buyerCustomerId: r.buyer_customer_id,
            quantity: r.quantity,
            sellingPricePerUnit: parseFloat(r.selling_price_per_unit),
            totalAmount: parseFloat(r.total_amount),
            amountPaid: parseFloat(r.amount_paid),
            balance: parseFloat(r.balance),
            paymentStatus: r.payment_status,
            soldBy: r.sold_by,
            saleDate: r.sale_date,
            createdAt: r.created_at,
          }));
        } catch (err: any) {
          console.error('[DB] Error reading sales from Postgres:', err.message);
        }
      }
      return [...sales];
    },
    findById: async (id: string): Promise<Sale | null> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
          if (res.rows[0]) {
            const r = res.rows[0];
            return {
              id: r.id,
              productId: r.product_id,
              buyerCustomerId: r.buyer_customer_id,
              quantity: r.quantity,
              sellingPricePerUnit: parseFloat(r.selling_price_per_unit),
              totalAmount: parseFloat(r.total_amount),
              amountPaid: parseFloat(r.amount_paid),
              balance: parseFloat(r.balance),
              paymentStatus: r.payment_status,
              soldBy: r.sold_by,
              saleDate: r.sale_date,
              createdAt: r.created_at,
            };
          }
          return null;
        } catch {}
      }
      return sales.find((s) => s.id === id) || null;
    },
    createSale: async (data: {
      productId: string;
      quantity: number;
      buyerName: string;
      buyerPhone: string;
      buyerAddress?: string;
      sellingPricePerUnit?: number;
      amountPaid: number;
      paymentType: 'FULL' | 'INSTALLMENT';
      soldBy: string;
    }): Promise<{ sale: Sale; payment: Payment | null; product: Product; customer: Customer }> => {
      // 1. Check product and available quantity
      const prod = await db.products.findById(data.productId);
      if (!prod) {
        throw new Error('Product not found');
      }
      if (data.quantity <= 0) {
        throw new Error('Sale quantity must be at least 1');
      }
      if (data.quantity > prod.quantityRemaining) {
        throw new Error(
          `Cannot sell ${data.quantity} units. Only ${prod.quantityRemaining} units currently available.`
        );
      }

      // 2. Calculate amounts - allow bargaining / negotiated unit selling price
      const unitPrice =
        data.sellingPricePerUnit !== undefined && data.sellingPricePerUnit >= 0
          ? Number(data.sellingPricePerUnit)
          : (prod.sellingPricePerUnit ?? 0);

      const totalAmount = data.quantity * unitPrice;
      let initialPaid = Number(data.amountPaid) || 0;

      if (data.paymentType === 'FULL') {
        initialPaid = totalAmount;
      } else {
        if (initialPaid < 0) {
          throw new Error('Amount paid cannot be negative');
        }
        if (initialPaid > totalAmount) {
          throw new Error(`Amount paid (₦${initialPaid.toLocaleString()}) cannot exceed total sale amount (₦${totalAmount.toLocaleString()})`);
        }
      }

      const balance = totalAmount - initialPaid;
      let paymentStatus: 'PAID' | 'PARTIALLY PAID' | 'UNPAID' = 'UNPAID';
      if (balance === 0 && initialPaid > 0) {
        paymentStatus = 'PAID';
      } else if (initialPaid > 0 && balance > 0) {
        paymentStatus = 'PARTIALLY PAID';
      }

      // 3. Find or create customer by phone number (guarantee grouping)
      const buyer = await db.customers.createOrFind({
        name: data.buyerName,
        phone: data.buyerPhone,
        address: data.buyerAddress,
      });

      // 4. Create Sale
      const saleId = `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const newSale: Sale = {
        id: saleId,
        productId: prod.id,
        buyerCustomerId: buyer.id,
        quantity: data.quantity,
        sellingPricePerUnit: unitPrice,
        totalAmount,
        amountPaid: initialPaid,
        balance,
        paymentStatus,
        soldBy: data.soldBy,
        saleDate: now,
        createdAt: now,
      };

      // 5. Update Inventory multi-unit values safely
      prod.quantitySold += data.quantity;
      prod.quantityRemaining = prod.quantityPurchased - prod.quantitySold;
      if (prod.quantityRemaining <= 0) {
        prod.status = 'SOLD OUT';
      } else if (prod.quantitySold > 0) {
        prod.status = 'PARTIALLY SOLD';
      } else {
        prod.status = 'AVAILABLE';
      }

      // 6. Record initial payment if amount > 0
      let newPayment: Payment | null = null;
      if (initialPaid > 0) {
        newPayment = {
          id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          saleId: newSale.id,
          amount: initialPaid,
          paymentDate: now,
          recordedBy: data.soldBy,
          createdAt: now,
        };
        payments.push(newPayment);
      }

      sales.unshift(newSale);
      const memProdIdx = products.findIndex((p) => p.id === prod.id);
      if (memProdIdx !== -1) products[memProdIdx] = prod;

      // Persist to Postgres if active
      if (isPgConnected) {
        try {
          await pool.query(
            `UPDATE products SET quantity_sold = $1, quantity_remaining = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
            [prod.quantitySold, prod.quantityRemaining, prod.status, prod.id]
          );
          await pool.query(
            `INSERT INTO sales (id, product_id, buyer_customer_id, quantity, selling_price_per_unit, total_amount, amount_paid, balance, payment_status, sold_by, sale_date, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              newSale.id,
              newSale.productId,
              newSale.buyerCustomerId,
              newSale.quantity,
              newSale.sellingPricePerUnit,
              newSale.totalAmount,
              newSale.amountPaid,
              newSale.balance,
              newSale.paymentStatus,
              newSale.soldBy,
              newSale.saleDate,
              newSale.createdAt,
            ]
          );
          if (newPayment) {
            await pool.query(
              'INSERT INTO payments (id, sale_id, amount, payment_date, recorded_by, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
              [newPayment.id, newPayment.saleId, newPayment.amount, newPayment.paymentDate, newPayment.recordedBy, newPayment.createdAt]
            );
          }
        } catch (err: any) {
          console.error('[DB] Error saving sale to Postgres:', err.message);
        }
      }

      return { sale: newSale, payment: newPayment, product: prod, customer: buyer };
    }
  },

  // PAYMENTS (Section 15, 16)
  payments: {
    getAll: async (): Promise<Payment[]> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
          return res.rows.map((r) => ({
            id: r.id,
            saleId: r.sale_id,
            amount: parseFloat(r.amount),
            paymentDate: r.payment_date,
            recordedBy: r.recorded_by,
            createdAt: r.created_at,
          }));
        } catch (err: any) {
          console.error('[DB] Error reading payments from Postgres:', err.message);
        }
      }
      return [...payments];
    },
    getBySaleId: async (saleId: string): Promise<Payment[]> => {
      if (isPgConnected) {
        try {
          const res = await pool.query('SELECT * FROM payments WHERE sale_id = $1 ORDER BY payment_date ASC', [saleId]);
          return res.rows.map((r) => ({
            id: r.id,
            saleId: r.sale_id,
            amount: parseFloat(r.amount),
            paymentDate: r.payment_date,
            recordedBy: r.recorded_by,
            createdAt: r.created_at,
          }));
        } catch (err: any) {
          console.error('[DB] Error reading payments by saleId from Postgres:', err.message);
        }
      }
      return payments
        .filter((p) => p.saleId === saleId)
        .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
    },
    addPayment: async (data: {
      saleId: string;
      amount: number;
      recordedBy: string;
      paymentDate?: string;
    }): Promise<{ payment: Payment; sale: Sale }> => {
      const sale = await db.sales.findById(data.saleId);
      if (!sale) throw new Error('Sale not found');

      if (data.amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }
      if (data.amount > sale.balance) {
        throw new Error(
          `Payment amount (₦${data.amount.toLocaleString()}) exceeds outstanding balance of ₦${sale.balance.toLocaleString()}`
        );
      }

      const now = data.paymentDate || new Date().toISOString();
      const newPayment: Payment = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        saleId: sale.id,
        amount: data.amount,
        paymentDate: now,
        recordedBy: data.recordedBy,
        createdAt: now,
      };

      payments.push(newPayment);

      // Re-sum all payments for this sale to ensure absolute data truth
      const allPaymentsForSale = isPgConnected
        ? await db.payments.getBySaleId(sale.id)
        : payments.filter((p) => p.saleId === sale.id);
      
      const totalPaid = allPaymentsForSale.reduce((sum, p) => sum + p.amount, 0) + (isPgConnected ? data.amount : 0);
      sale.amountPaid = totalPaid;
      sale.balance = Math.max(0, sale.totalAmount - totalPaid);

      if (sale.balance === 0) {
        sale.paymentStatus = 'PAID';
      } else if (sale.amountPaid > 0) {
        sale.paymentStatus = 'PARTIALLY PAID';
      } else {
        sale.paymentStatus = 'UNPAID';
      }

      if (isPgConnected) {
        try {
          await pool.query(
            'INSERT INTO payments (id, sale_id, amount, payment_date, recorded_by, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
            [newPayment.id, newPayment.saleId, newPayment.amount, newPayment.paymentDate, newPayment.recordedBy, newPayment.createdAt]
          );
          await pool.query(
            'UPDATE sales SET amount_paid = $1, balance = $2, payment_status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
            [sale.amountPaid, sale.balance, sale.paymentStatus, sale.id]
          );
        } catch (err: any) {
          console.error('[DB] Error saving payment to Postgres:', err.message);
        }
      }

      const memSaleIdx = sales.findIndex((s) => s.id === sale.id);
      if (memSaleIdx !== -1) sales[memSaleIdx] = sale;

      return { payment: newPayment, sale };
    }
  }
};
