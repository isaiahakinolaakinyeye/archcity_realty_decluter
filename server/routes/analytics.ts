import { Router } from 'express';
import { db } from '../db/store.js';

export const analyticsRouter = Router();

// GET /api/analytics/admin
analyticsRouter.get('/admin', async (req, res) => {
  try {
    const { month, year } = req.query;

    let products = await db.products.getAll();
    let sales = await db.sales.getAll();
    let payments = await db.payments.getAll();
    let categories = await db.categories.getAll();

    // Filter sales and payments by year/month if selected
    if (year && typeof year === 'string') {
      sales = sales.filter((s) => new Date(s.saleDate).getFullYear().toString() === year);
      payments = payments.filter((p) => new Date(p.paymentDate).getFullYear().toString() === year);
      products = products.filter((p) => new Date(p.purchaseDate).getFullYear().toString() === year);
    }

    if (month && typeof month === 'string') {
      sales = sales.filter((s) => (new Date(s.saleDate).getMonth() + 1).toString() === month);
      payments = payments.filter((p) => (new Date(p.paymentDate).getMonth() + 1).toString() === month);
      products = products.filter((p) => (new Date(p.purchaseDate).getMonth() + 1).toString() === month);
    }

    // 1. Total Purchase Cost
    const totalPurchaseCost = products.reduce(
      (sum, p) => sum + p.purchasePricePerUnit * p.quantityPurchased,
      0
    );

    // 2. Total Sales
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    // 3. Total Money Collected (Actual cash payments received)
    const totalMoneyCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    // 4. Outstanding Payments (Sales total - Money collected on those sales)
    const outstandingPayments = sales.reduce((sum, s) => sum + s.balance, 0);

    // 5. Total Profit: (Selling price - Purchase cost) * quantity sold
    const allProducts = await db.products.getAll();
    const totalProfit = sales.reduce((sum, s) => {
      const prod = allProducts.find((p) => p.id === s.productId);
      if (!prod) return sum;
      const unitProfit = s.sellingPricePerUnit - prod.purchasePricePerUnit;
      return sum + unitProfit * s.quantity;
    }, 0);

    // 6. Units: Purchased, Sold, Remaining
    const itemsPurchased = products.reduce((sum, p) => sum + p.quantityPurchased, 0);
    const itemsSold = products.reduce((sum, p) => sum + p.quantitySold, 0);
    const itemsRemaining = products.reduce((sum, p) => sum + p.quantityRemaining, 0);

    // 7. Sales Growth Trend Chart (Monthly aggregation for current/selected year)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = year ? parseInt(year as string, 10) : new Date().getFullYear();
    const allYearSales = (await db.sales.getAll()).filter(
      (s) => new Date(s.saleDate).getFullYear() === currentYear
    );
    const allYearPayments = (await db.payments.getAll()).filter(
      (p) => new Date(p.paymentDate).getFullYear() === currentYear
    );

    const salesTrend = monthNames.map((monthName, idx) => {
      const monthSales = allYearSales.filter((s) => new Date(s.saleDate).getMonth() === idx);
      const monthPayments = allYearPayments.filter((p) => new Date(p.paymentDate).getMonth() === idx);
      const salesValue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const cashCollected = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        month: monthName,
        sales: salesValue,
        cash: cashCollected,
        orders: monthSales.length,
      };
    });

    // 8. Sales by Category
    const categoryStats = categories.map((cat) => {
      const catProducts = allProducts.filter((p) => p.categoryId === cat.id);
      const catProductIds = new Set(catProducts.map((p) => p.id));
      const catSales = sales.filter((s) => catProductIds.has(s.productId));
      const catRevenue = catSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const catUnitsSold = catSales.reduce((sum, s) => sum + s.quantity, 0);

      return {
        id: cat.id,
        name: cat.name,
        revenue: catRevenue,
        unitsSold: catUnitsSold,
      };
    });

    // 9. Inventory Status breakdown
    const inventoryStatus = {
      available: allProducts.filter((p) => p.status === 'AVAILABLE').length,
      partiallySold: allProducts.filter((p) => p.status === 'PARTIALLY SOLD').length,
      soldOut: allProducts.filter((p) => p.status === 'SOLD OUT').length,
      totalCount: allProducts.length,
    };

    return res.json({
      cards: {
        totalPurchaseCost,
        totalSales,
        totalMoneyCollected,
        outstandingPayments,
        totalProfit,
        itemsPurchased,
        itemsSold,
        itemsRemaining,
      },
      salesTrend,
      categoryStats,
      inventoryStatus,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/staff
analyticsRouter.get('/staff', async (req, res) => {
  try {
    const { staffId } = req.query;

    const allSales = await db.sales.getAll();
    const allPayments = await db.payments.getAll();

    // Today's date string YYYY-MM-DD
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter by staff if provided
    let staffSales = allSales;
    if (staffId && typeof staffId === 'string') {
      staffSales = allSales.filter((s) => s.soldBy === staffId);
    }

    const todaySales = staffSales.filter((s) => s.saleDate.slice(0, 10) === todayStr);
    const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

    const monthSales = staffSales.filter((s) => {
      const d = new Date(s.saleDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthSalesTotal = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);

    const totalCollected = staffSales.reduce((sum, s) => sum + s.amountPaid, 0);
    const outstandingInstallmentBalance = staffSales.reduce((sum, s) => sum + s.balance, 0);
    const numberOfSales = staffSales.length;

    return res.json({
      todaySales: todaySalesTotal,
      monthSales: monthSalesTotal,
      totalCollected,
      outstandingInstallmentBalance,
      numberOfSales,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
