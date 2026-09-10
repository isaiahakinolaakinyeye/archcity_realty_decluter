import { Router } from 'express';
import { db } from '../db/store.js';

export const inventoryRouter = Router();

// GET /api/inventory
inventoryRouter.get('/', async (req, res) => {
  try {
    const { status, categoryId, search, availableOnly, sellerId } = req.query;

    let items = await db.products.getAll();
    const categories = await db.categories.getAll();
    const customers = await db.customers.getAll();

    // Map enriched product objects
    let enriched = items.map((p) => {
      const category = categories.find((c) => c.id === p.categoryId);
      const seller = customers.find((c) => c.id === p.sellerCustomerId);
      const unitProfit = p.sellingPricePerUnit - p.purchasePricePerUnit;
      const potentialTotalProfit = unitProfit * p.quantityPurchased;
      const realizedProfit = unitProfit * p.quantitySold;

      return {
        ...p,
        categoryName: category ? category.name : 'Uncategorized',
        seller: seller
          ? { id: seller.id, name: seller.name, phone: seller.phone, address: seller.address }
          : null,
        unitProfit,
        potentialTotalProfit,
        realizedProfit,
      };
    });

    // Filter by availableOnly (For Staff Sales page - Section 10: Must ONLY show products that still have available quantity)
    if (availableOnly === 'true') {
      enriched = enriched.filter((p) => p.quantityRemaining > 0);
    }

    // Filter by status (AVAILABLE, PARTIALLY SOLD, SOLD OUT)
    if (status && status !== 'ALL') {
      enriched = enriched.filter((p) => p.status === status);
    }

    // Filter by category
    if (categoryId && categoryId !== 'ALL') {
      enriched = enriched.filter((p) => p.categoryId === categoryId);
    }

    // Filter by seller
    if (sellerId && sellerId !== 'ALL') {
      enriched = enriched.filter((p) => p.sellerCustomerId === sellerId);
    }

    // Search by product name, seller name, seller phone, or category
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      enriched = enriched.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.seller && p.seller.name.toLowerCase().includes(q)) ||
          (p.seller && p.seller.phone.includes(q))
      );
    }

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/:id
inventoryRouter.get('/:id', async (req, res) => {
  try {
    const item = await db.products.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const categories = await db.categories.getAll();
    const category = categories.find((c) => c.id === item.categoryId);
    const seller = item.sellerCustomerId ? await db.customers.findById(item.sellerCustomerId) : null;

    return res.json({
      ...item,
      categoryName: category?.name || 'Uncategorized',
      seller: seller ? { id: seller.id, name: seller.name, phone: seller.phone, address: seller.address } : null,
      unitProfit: item.sellingPricePerUnit - item.purchasePricePerUnit,
      potentialTotalProfit: (item.sellingPricePerUnit - item.purchasePricePerUnit) * item.quantityPurchased,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory (Admin only)
inventoryRouter.post('/', async (req, res) => {
  try {
    const {
      name,
      image,
      categoryId,
      quantity,
      purchasePricePerUnit,
      sellingPricePerUnit,
      sellerName,
      sellerPhone,
      sellerAddress,
      purchaseDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (!categoryId) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    if (purchasePricePerUnit === undefined || Number(purchasePricePerUnit) < 0) {
      return res.status(400).json({ error: 'Valid purchase price is required' });
    }
    // Selling price is optional — can be set later
    if (sellingPricePerUnit !== undefined && sellingPricePerUnit !== null && sellingPricePerUnit !== '' && Number(sellingPricePerUnit) < 0) {
      return res.status(400).json({ error: 'Selling price cannot be negative' });
    }
    if (!sellerName || !sellerName.trim()) {
      return res.status(400).json({ error: 'Seller name is required' });
    }
    if (!sellerPhone || !sellerPhone.trim()) {
      return res.status(400).json({ error: 'Seller phone number is required' });
    }

    const newProduct = await db.products.create({
      name: name.trim(),
      image: image?.trim(),
      categoryId,
      quantity: parseInt(quantity, 10),
      purchasePricePerUnit: parseFloat(purchasePricePerUnit),
      sellingPricePerUnit: (sellingPricePerUnit !== undefined && sellingPricePerUnit !== null && sellingPricePerUnit !== '')
        ? parseFloat(sellingPricePerUnit)
        : 0,
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      sellerAddress: sellerAddress?.trim(),
      purchaseDate,
    });

    return res.status(201).json(newProduct);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/inventory/:id
inventoryRouter.put('/:id', async (req, res) => {
  try {
    const updated = await db.products.update(req.params.id, req.body);
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/inventory/:id
inventoryRouter.delete('/:id', async (req, res) => {
  try {
    await db.products.delete(req.params.id);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});
