import { Router } from 'express';
import { db } from '../db/store.js';

export const customersRouter = Router();

// GET /api/customers
customersRouter.get('/', async (req, res) => {
  try {
    const { filter, search } = req.query;

    const customers = await db.customers.getAll();
    const sales = await db.sales.getAll();
    const products = await db.products.getAll();
    const payments = await db.payments.getAll();

    let enriched = customers.map((c) => {
      // Buying transactions
      const customerSales = sales.filter((s) => s.buyerCustomerId === c.id);
      const purchaseCount = customerSales.length;
      const totalPurchased = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalPaid = customerSales.reduce((sum, s) => sum + s.amountPaid, 0);
      const outstandingBalance = customerSales.reduce((sum, s) => sum + s.balance, 0);

      // Selling transactions (products where sellerCustomerId = c.id)
      const customerItemsSoldToBusiness = products.filter((p) => p.sellerCustomerId === c.id);
      const itemsSoldToBusinessCount = customerItemsSoldToBusiness.reduce(
        (sum, p) => sum + p.quantityPurchased,
        0
      );
      const totalReceivedByCustomer = customerItemsSoldToBusiness.reduce(
        (sum, p) => sum + p.purchasePricePerUnit * p.quantityPurchased,
        0
      );

      // Determine customer type
      let customerType: 'BUYER' | 'SELLER' | 'BOTH' | 'PROSPECT' = 'PROSPECT';
      const isBuyer = purchaseCount > 0;
      const isSeller = customerItemsSoldToBusiness.length > 0;
      if (isBuyer && isSeller) customerType = 'BOTH';
      else if (isBuyer) customerType = 'BUYER';
      else if (isSeller) customerType = 'SELLER';

      // Find last transaction date
      const dates: number[] = [
        ...customerSales.map((s) => new Date(s.saleDate).getTime()),
        ...customerItemsSoldToBusiness.map((p) => new Date(p.purchaseDate).getTime()),
      ];
      const lastTransactionDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

      return {
        ...c,
        customerType,
        purchaseCount,
        totalPurchased,
        totalPaid,
        outstandingBalance,
        itemsSoldToBusinessCount,
        totalReceivedByCustomer,
        lastTransactionDate,
      };
    });

    // Search by name or phone
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      enriched = enriched.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.replace(/[\s-]/g, '').includes(q.replace(/[\s-]/g, ''))
      );
    }

    // Filters (Section 27)
    if (filter) {
      switch (filter) {
        case 'BUYING':
          enriched = enriched.filter((c) => c.customerType === 'BUYER' || c.customerType === 'BOTH');
          break;
        case 'SELLING':
          enriched = enriched.filter((c) => c.customerType === 'SELLER' || c.customerType === 'BOTH');
          break;
        case 'MOST_FREQUENT_BUYERS':
          enriched = enriched
            .filter((c) => c.purchaseCount > 0)
            .sort((a, b) => b.purchaseCount - a.purchaseCount);
          break;
        case 'HIGHEST_VALUE_BUYERS':
          enriched = enriched
            .filter((c) => c.totalPurchased > 0)
            .sort((a, b) => b.totalPurchased - a.totalPurchased);
          break;
        case 'MOST_PAYING_CUSTOMERS':
          enriched = enriched
            .filter((c) => c.totalPaid > 0)
            .sort((a, b) => b.totalPaid - a.totalPaid);
          break;
        case 'MOST_FREQUENT_SELLERS':
          enriched = enriched
            .filter((c) => c.itemsSoldToBusinessCount > 0)
            .sort((a, b) => b.itemsSoldToBusinessCount - a.itemsSoldToBusinessCount);
          break;
        case 'HIGHEST_VALUE_SELLERS':
          enriched = enriched
            .filter((c) => c.totalReceivedByCustomer > 0)
            .sort((a, b) => b.totalReceivedByCustomer - a.totalReceivedByCustomer);
          break;
        case 'OUTSTANDING_BALANCE':
          enriched = enriched
            .filter((c) => c.outstandingBalance > 0)
            .sort((a, b) => b.outstandingBalance - a.outstandingBalance);
          break;
        default:
          break;
      }
    }

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
customersRouter.get('/:id', async (req, res) => {
  try {
    const customer = await db.customers.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const sales = await db.sales.getAll();
    const products = await db.products.getAll();
    const categories = await db.categories.getAll();

    // Buying transactions
    const customerSales = sales.filter((s) => s.buyerCustomerId === customer.id);
    const buyingTransactions = customerSales.map((s) => {
      const prod = products.find((p) => p.id === s.productId);
      const cat = categories.find((c) => c.id === prod?.categoryId);
      return {
        saleId: s.id,
        productId: s.productId,
        productName: prod?.name || 'Unknown Product',
        productImage: prod?.image || '',
        categoryName: cat?.name || 'Uncategorized',
        quantity: s.quantity,
        unitPrice: s.sellingPricePerUnit,
        totalAmount: s.totalAmount,
        amountPaid: s.amountPaid,
        balance: s.balance,
        paymentStatus: s.paymentStatus,
        date: s.saleDate,
      };
    });

    // Selling transactions
    const customerProducts = products.filter((p) => p.sellerCustomerId === customer.id);
    const sellingTransactions = customerProducts.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const totalReceived = p.purchasePricePerUnit * p.quantityPurchased;
      return {
        productId: p.id,
        productName: p.name,
        productImage: p.image,
        categoryName: cat?.name || 'Uncategorized',
        quantity: p.quantityPurchased,
        purchasePricePerUnit: p.purchasePricePerUnit,
        totalReceived,
        date: p.purchaseDate,
        status: p.status,
      };
    });

    // Aggregates
    const purchaseCount = customerSales.length;
    const totalSpent = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPaid = customerSales.reduce((sum, s) => sum + s.amountPaid, 0);
    const outstandingBalance = customerSales.reduce((sum, s) => sum + s.balance, 0);
    const itemsSoldToBusinessCount = customerProducts.reduce((sum, p) => sum + p.quantityPurchased, 0);
    const totalReceivedByCustomer = customerProducts.reduce(
      (sum, p) => sum + p.purchasePricePerUnit * p.quantityPurchased,
      0
    );

    let customerType: 'BUYER' | 'SELLER' | 'BOTH' | 'PROSPECT' = 'PROSPECT';
    const isBuyer = purchaseCount > 0;
    const isSeller = customerProducts.length > 0;
    if (isBuyer && isSeller) customerType = 'BOTH';
    else if (isBuyer) customerType = 'BUYER';
    else if (isSeller) customerType = 'SELLER';

    return res.json({
      ...customer,
      customerType,
      stats: {
        purchaseCount,
        totalSpent,
        totalPaid,
        outstandingBalance,
        itemsSoldToBusinessCount,
        totalReceivedByCustomer,
        totalTransactions: purchaseCount + customerProducts.length,
      },
      buyingTransactions,
      sellingTransactions,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
