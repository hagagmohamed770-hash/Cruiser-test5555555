const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

router.get('/', async (req, res) => {
    try {
        const brokers = await db.all('SELECT * FROM brokers ORDER BY created_at DESC');
        res.json({ success: true, data: brokers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب السماسرة' });
    }
});

module.exports = router;