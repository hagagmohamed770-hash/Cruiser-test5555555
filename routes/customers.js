const express = require('express');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

// الحصول على جميع العملاء
router.get('/', async (req, res) => {
    try {
        const customers = await db.all('SELECT * FROM customers ORDER BY created_at DESC');
        
        res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('خطأ في جلب العملاء:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب العملاء'
        });
    }
});

// الحصول على عميل واحد
router.get('/:id', async (req, res) => {
    try {
        const customer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [req.params.id]
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'العميل غير موجود'
            });
        }

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error('خطأ في جلب العميل:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب العميل'
        });
    }
});

// إضافة عميل جديد
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, address, id_number, notes } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'اسم العميل مطلوب'
            });
        }

        const result = await db.run(
            `INSERT INTO customers (name, phone, email, address, id_number, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, phone, email, address, id_number, notes]
        );

        const newCustomer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [result.id]
        );

        res.status(201).json({
            success: true,
            message: 'تم إضافة العميل بنجاح',
            data: newCustomer
        });
    } catch (error) {
        console.error('خطأ في إضافة العميل:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إضافة العميل'
        });
    }
});

// تحديث عميل
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email, address, id_number, notes, status } = req.body;

        const customer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [req.params.id]
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'العميل غير موجود'
            });
        }

        await db.run(
            `UPDATE customers 
             SET name = ?, phone = ?, email = ?, address = ?, id_number = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, phone, email, address, id_number, notes, status, req.params.id]
        );

        const updatedCustomer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'تم تحديث العميل بنجاح',
            data: updatedCustomer
        });
    } catch (error) {
        console.error('خطأ في تحديث العميل:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث العميل'
        });
    }
});

// حذف عميل
router.delete('/:id', async (req, res) => {
    try {
        const customer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [req.params.id]
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'العميل غير موجود'
            });
        }

        await db.run('DELETE FROM customers WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'تم حذف العميل بنجاح'
        });
    } catch (error) {
        console.error('خطأ في حذف العميل:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف العميل'
        });
    }
});

module.exports = router;