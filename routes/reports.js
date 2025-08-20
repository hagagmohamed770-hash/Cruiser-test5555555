const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

// تقرير عام
router.get('/dashboard', async (req, res) => {
    try {
        const [customersCount] = await db.all('SELECT COUNT(*) as count FROM customers');
        const [unitsCount] = await db.all('SELECT COUNT(*) as count FROM units');
        const [contractsCount] = await db.all('SELECT COUNT(*) as count FROM contracts');
        const [totalRevenue] = await db.all('SELECT SUM(total_amount) as total FROM contracts WHERE status = "active"');

        res.json({
            success: true,
            data: {
                totalCustomers: customersCount.count,
                totalUnits: unitsCount.count,
                totalContracts: contractsCount.count,
                totalRevenue: totalRevenue.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب التقرير' });
    }
});

module.exports = router;