const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

router.get('/', async (req, res) => {
    try {
        const vouchers = await db.all('SELECT * FROM vouchers ORDER BY created_at DESC');
        res.json({ success: true, data: vouchers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الإيصالات' });
    }
});

module.exports = router;