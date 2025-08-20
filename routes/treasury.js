const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

router.get('/', async (req, res) => {
    try {
        const safes = await db.all('SELECT * FROM safes ORDER BY created_at DESC');
        res.json({ success: true, data: safes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الخزينة' });
    }
});

module.exports = router;