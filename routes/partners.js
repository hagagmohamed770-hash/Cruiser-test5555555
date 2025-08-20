const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

router.get('/', async (req, res) => {
    try {
        const partners = await db.all('SELECT * FROM partners ORDER BY created_at DESC');
        res.json({ success: true, data: partners });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الشركاء' });
    }
});

module.exports = router;