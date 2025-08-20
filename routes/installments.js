const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

router.get('/', async (req, res) => {
    try {
        const installments = await db.all('SELECT * FROM installments ORDER BY due_date');
        res.json({ success: true, data: installments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الأقساط' });
    }
});

module.exports = router;