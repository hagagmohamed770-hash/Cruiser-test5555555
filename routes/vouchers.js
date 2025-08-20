const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const { logAudit } = require('../utils/audit');

const db = new Database();

router.get('/', async (req, res) => {
    try {
        const { type, status, date, page = 1, limit = 50 } = req.query;
        let sql = 'SELECT * FROM vouchers WHERE 1=1';
        const params = [];

        if (type) {
            sql += ' AND voucher_type = ?';
            params.push(type);
        }

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (date) {
            sql += ' AND date = ?';
            params.push(date);
        }

        sql += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (page - 1) * limit);

        const vouchers = await db.all(sql, params);
        res.json({ success: true, data: vouchers });

    } catch (error) {
        console.error('Error fetching vouchers:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب السندات' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { voucher_number, voucher_type, amount, description, date, related_id, related_type } = req.body;

        if (!voucher_number || !voucher_type || !amount || !date) {
            return res.status(400).json({ success: false, error: 'جميع البيانات المطلوبة يجب أن تكون مملوءة' });
        }

        const result = await db.run(
            'INSERT INTO vouchers (voucher_number, voucher_type, amount, description, date, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [voucher_number, voucher_type, amount, description, date, related_id, related_type]
        );

        const newVoucher = await db.get('SELECT * FROM vouchers WHERE id = ?', [result.id]);
        await logAudit('vouchers', result.id, 'CREATE', null, newVoucher, req);

        res.status(201).json({ success: true, data: newVoucher, message: 'تم إنشاء السند بنجاح' });

    } catch (error) {
        console.error('Error creating voucher:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في إنشاء السند' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingVoucher = await db.get('SELECT * FROM vouchers WHERE id = ?', [id]);
        if (!existingVoucher) {
            return res.status(404).json({ success: false, error: 'السند غير موجود' });
        }

        const fields = Object.keys(updateData).filter(key => key !== 'id');
        const values = fields.map(field => updateData[field]);
        values.push(id);

        const sql = `UPDATE vouchers SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.run(sql, values);

        const updatedVoucher = await db.get('SELECT * FROM vouchers WHERE id = ?', [id]);
        await logAudit('vouchers', id, 'UPDATE', existingVoucher, updatedVoucher, req);

        res.json({ success: true, data: updatedVoucher, message: 'تم تحديث السند بنجاح' });

    } catch (error) {
        console.error('Error updating voucher:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في تحديث السند' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const voucher = await db.get('SELECT * FROM vouchers WHERE id = ?', [id]);
        if (!voucher) {
            return res.status(404).json({ success: false, error: 'السند غير موجود' });
        }

        await db.run('DELETE FROM vouchers WHERE id = ?', [id]);
        await logAudit('vouchers', id, 'DELETE', voucher, null, req);

        res.json({ success: true, message: 'تم حذف السند بنجاح' });

    } catch (error) {
        console.error('Error deleting voucher:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في حذف السند' });
    }
});

module.exports = router;