const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

router.get('/', async (req, res) => {
    try {
        const auditLog = await db.all('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100');
        res.json({ success: true, data: auditLog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب سجل التغييرات' });
    }
});

module.exports = router;