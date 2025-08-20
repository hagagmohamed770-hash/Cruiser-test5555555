const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const { logAudit } = require('../utils/audit');

const db = new Database();

// الحصول على جميع الأقساط
router.get('/', async (req, res) => {
    try {
        const { contract_id, status, due_date, page = 1, limit = 50 } = req.query;
        let sql = `
            SELECT 
                i.*,
                c.contract_number,
                cu.name as customer_name,
                u.name as unit_name
            FROM installments i
            JOIN contracts c ON i.contract_id = c.id
            JOIN customers cu ON c.customer_id = cu.id
            JOIN units u ON c.unit_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (contract_id) {
            sql += ' AND i.contract_id = ?';
            params.push(contract_id);
        }

        if (status) {
            sql += ' AND i.status = ?';
            params.push(status);
        }

        if (due_date) {
            sql += ' AND i.due_date = ?';
            params.push(due_date);
        }

        sql += ' ORDER BY i.due_date ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (page - 1) * limit);

        const installments = await db.all(sql, params);
        res.json({ success: true, data: installments });

    } catch (error) {
        console.error('Error fetching installments:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب الأقساط' });
    }
});

// إنشاء أقساط لعقد
router.post('/generate', async (req, res) => {
    try {
        const { contract_id, number_of_installments, start_date, amount_per_installment } = req.body;

        const contract = await db.get('SELECT * FROM contracts WHERE id = ?', [contract_id]);
        if (!contract) {
            return res.status(404).json({ success: false, error: 'العقد غير موجود' });
        }

        // حذف الأقساط الموجودة للعقد
        await db.run('DELETE FROM installments WHERE contract_id = ?', [contract_id]);

        // إنشاء الأقساط الجديدة
        for (let i = 1; i <= number_of_installments; i++) {
            const dueDate = new Date(start_date);
            dueDate.setMonth(dueDate.getMonth() + i - 1);

            await db.run(
                'INSERT INTO installments (contract_id, installment_number, amount, due_date) VALUES (?, ?, ?, ?)',
                [contract_id, i, amount_per_installment, dueDate.toISOString().split('T')[0]]
            );
        }

        res.json({ success: true, message: 'تم إنشاء الأقساط بنجاح' });

    } catch (error) {
        console.error('Error generating installments:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في إنشاء الأقساط' });
    }
});

// تحديث حالة القسط
router.put('/:id/pay', async (req, res) => {
    try {
        const { id } = req.params;
        const { paid_amount, paid_date, notes } = req.body;

        const installment = await db.get('SELECT * FROM installments WHERE id = ?', [id]);
        if (!installment) {
            return res.status(404).json({ success: false, error: 'القسط غير موجود' });
        }

        const status = paid_amount >= installment.amount ? 'paid' : 'partial';
        
        await db.run(
            'UPDATE installments SET paid_amount = ?, paid_date = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [paid_amount, paid_date, status, notes, id]
        );

        const updatedInstallment = await db.get('SELECT * FROM installments WHERE id = ?', [id]);
        await logAudit('installments', id, 'UPDATE', installment, updatedInstallment, req);

        res.json({ success: true, data: updatedInstallment, message: 'تم تحديث القسط بنجاح' });

    } catch (error) {
        console.error('Error updating installment:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في تحديث القسط' });
    }
});

module.exports = router;