const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

// الحصول على جميع الوحدات
router.get('/', async (req, res) => {
    try {
        const units = await db.all('SELECT * FROM units ORDER BY created_at DESC');
        res.json({ success: true, data: units });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الوحدات' });
    }
});

// إضافة وحدة جديدة
router.post('/', async (req, res) => {
    try {
        const { name, type, area, price, location, description } = req.body;
        const result = await db.run(
            'INSERT INTO units (name, type, area, price, location, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, type, area, price, location, description]
        );
        const newUnit = await db.get('SELECT * FROM units WHERE id = ?', [result.id]);
        res.status(201).json({ success: true, message: 'تم إضافة الوحدة بنجاح', data: newUnit });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في إضافة الوحدة' });
    }
});

module.exports = router;