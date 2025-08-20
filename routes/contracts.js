const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

// الحصول على جميع العقود
router.get('/', async (req, res) => {
    try {
        const contracts = await db.all(`
            SELECT c.*, cu.name as customer_name, u.name as unit_name 
            FROM contracts c 
            LEFT JOIN customers cu ON c.customer_id = cu.id 
            LEFT JOIN units u ON c.unit_id = u.id 
            ORDER BY c.created_at DESC
        `);
        res.json({ success: true, data: contracts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب العقود' });
    }
});

module.exports = router;