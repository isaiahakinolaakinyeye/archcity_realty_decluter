import { Router } from 'express';
import { db } from '../db/store.js';

export const salesRouter = Router();

// GET /api/sales
salesRouter.get('/', async (req, res) => {
  try {
    const { paymentStatus, categoryId, soldBy, month, year, search, customerId } = req.query;

    const sales = await db.sales.getAll();
    const products = await db.products.getAll();
    const categories = await db.categories.getAll();
    const customers = await db.customers.getAll();
    const users = await db.users.getAll();
    const payments = await db.payments.getAll();

    let enriched = sales.map((sale) => {
      const product = products.find((p) => p.id === sale.productId);
      const category = categories.find((c) => c.id === product?.categoryId);
      const buyer = customers.find((c) => c.id === sale.buyerCustomerId);
      const sellerStaff = users.find((u) => u.id === sale.soldBy);
      const salePayments = payments.filter((p) => p.saleId === sale.id);
      const lastPayment = salePayments.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];

      return {
        ...sale,
        productName: product?.name || 'Unknown Product',
        productImage: product?.image || '',
        categoryName: category?.name || 'Uncategorized',
        categoryId: category?.id,
        buyerName: buyer?.name || 'Unknown Buyer',
        buyerPhone: buyer?.phone || '',
        buyerAddress: buyer?.address || '',
        soldByName: sellerStaff?.name || 'System / Staff',
        paymentCount: salePayments.length,
        lastPaymentDate: lastPayment?.paymentDate || null,
        payments: salePayments,
      };
    });

    // Filters
    if (paymentStatus && paymentStatus !== 'ALL') {
      enriched = enriched.filter((s) => s.paymentStatus === paymentStatus);
    }

    if (categoryId && categoryId !== 'ALL') {
      enriched = enriched.filter((s) => s.categoryId === categoryId);
    }

    if (soldBy && soldBy !== 'ALL') {
      enriched = enriched.filter((s) => s.soldBy === soldBy);
    }

    if (customerId) {
      enriched = enriched.filter((s) => s.buyerCustomerId === customerId);
    }

    if (year && typeof year === 'string') {
      enriched = enriched.filter((s) => new Date(s.saleDate).getFullYear().toString() === year);
    }

    if (month && typeof month === 'string') {
      enriched = enriched.filter(
        (s) => (new Date(s.saleDate).getMonth() + 1).toString() === month
      );
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      enriched = enriched.filter(
        (s) =>
          s.productName.toLowerCase().includes(q) ||
          s.buyerName.toLowerCase().includes(q) ||
          s.buyerPhone.includes(q) ||
          s.categoryName.toLowerCase().includes(q)
      );
    }

    // Sort by newest sale date first
    enriched.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/sales/:id
salesRouter.get('/:id', async (req, res) => {
  try {
    const sale = await db.sales.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    const product = await db.products.findById(sale.productId);
    const category = product ? await db.categories.findById(product.categoryId) : null;
    const buyer = await db.customers.findById(sale.buyerCustomerId);
    const sellerStaff = sale.soldBy ? await db.users.findById(sale.soldBy) : null;
    const payments = await db.payments.getBySaleId(sale.id);

    return res.json({
      ...sale,
      product,
      categoryName: category?.name || 'Uncategorized',
      buyer,
      soldByName: sellerStaff?.name || 'Staff',
      payments,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/sales
salesRouter.post('/', async (req, res) => {
  try {
    const {
      productId,
      quantity,
      buyerName,
      buyerPhone,
      buyerAddress,
      sellingPricePerUnit,
      amountPaid,
      paymentType,
      soldBy,
    } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product is required' });
    }
    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    if (!buyerName || !buyerName.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!buyerPhone || !buyerPhone.trim()) {
      return res.status(400).json({ error: 'Customer phone number is required' });
    }

    const parsedPrice =
      sellingPricePerUnit !== undefined && sellingPricePerUnit !== '' && !isNaN(Number(sellingPricePerUnit))
        ? Number(sellingPricePerUnit)
        : undefined;

    const result = await db.sales.createSale({
      productId,
      quantity: parseInt(quantity, 10),
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerAddress: buyerAddress?.trim(),
      sellingPricePerUnit: parsedPrice,
      amountPaid: parseFloat(amountPaid) || 0,
      paymentType: paymentType === 'FULL' ? 'FULL' : 'INSTALLMENT',
      soldBy: soldBy || 'user-staff-1',
    });

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});
