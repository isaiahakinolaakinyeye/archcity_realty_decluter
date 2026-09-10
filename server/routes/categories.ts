import { Router } from 'express';
import { db } from '../db/store.js';

export const categoriesRouter = Router();

// GET /api/categories
categoriesRouter.get('/', async (req, res) => {
  try {
    const categories = await db.categories.getAll();
    const products = await db.products.getAll();
    const sales = await db.sales.getAll();

    // Enrich categories with Section 30 usage statistics
    const enriched = categories.map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);
      const catProductIds = new Set(catProducts.map((p) => p.id));
      const catSales = sales.filter((s) => catProductIds.has(s.productId));

      const totalUnitsPurchased = catProducts.reduce((sum, p) => sum + p.quantityPurchased, 0);
      const totalUnitsSold = catProducts.reduce((sum, p) => sum + p.quantitySold, 0);
      const totalUnitsRemaining = catProducts.reduce((sum, p) => sum + p.quantityRemaining, 0);

      const totalSalesRevenue = catSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalPurchaseCost = catProducts.reduce(
        (sum, p) => sum + p.purchasePricePerUnit * p.quantityPurchased,
        0
      );

      // Profit on sold items
      const realizedProfit = catSales.reduce((sum, s) => {
        const prod = catProducts.find((p) => p.id === s.productId);
        if (!prod) return sum;
        return sum + (s.sellingPricePerUnit - prod.purchasePricePerUnit) * s.quantity;
      }, 0);

      return {
        ...cat,
        productCount: catProducts.length,
        totalUnitsPurchased,
        totalUnitsSold,
        totalUnitsRemaining,
        totalSalesRevenue,
        totalPurchaseCost,
        realizedProfit,
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
categoriesRouter.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const cat = await db.categories.create(name.trim());
    return res.status(201).json(cat);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:id
categoriesRouter.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const updated = await db.categories.update(req.params.id, name.trim());
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
categoriesRouter.delete('/:id', async (req, res) => {
  try {
    await db.categories.delete(req.params.id);
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});
