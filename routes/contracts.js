const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const { logAudit } = require('../utils/audit');

const db = new Database();

// الحصول على جميع العقود
router.get('/', async (req, res) => {
    try {
        const { search, type, status, customer_id, unit_id, page = 1, limit = 50 } = req.query;
        let sql = `
            SELECT 
                c.*,
                cu.name as customer_name,
                cu.phone as customer_phone,
                u.name as unit_name,
                u.type as unit_type
            FROM contracts c
            JOIN customers cu ON c.customer_id = cu.id
            JOIN units u ON c.unit_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ' AND (c.contract_number LIKE ? OR cu.name LIKE ? OR u.name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (type) {
            sql += ' AND c.contract_type = ?';
            params.push(type);
        }

        if (status) {
            sql += ' AND c.status = ?';
            params.push(status);
        }

        if (customer_id) {
            sql += ' AND c.customer_id = ?';
            params.push(customer_id);
        }

        if (unit_id) {
            sql += ' AND c.unit_id = ?';
            params.push(unit_id);
        }

        sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (page - 1) * limit);

        const contracts = await db.all(sql, params);
        res.json({ success: true, data: contracts });

    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب العقود' });
    }
});

// إنشاء عقد جديد
router.post('/', async (req, res) => {
    try {
        const {
            contract_number,
            unit_id,
            customer_id,
            contract_type,
            start_date,
            end_date,
            total_amount,
            down_payment,
            monthly_payment,
            payment_method,
            notes
        } = req.body;

        if (!contract_number || !unit_id || !customer_id || !contract_type || !start_date || !total_amount) {
            return res.status(400).json({
                success: false,
                error: 'جميع البيانات المطلوبة يجب أن تكون مملوءة'
            });
        }

        const result = await db.run(
            `INSERT INTO contracts (contract_number, unit_id, customer_id, contract_type, start_date, end_date, total_amount, down_payment, monthly_payment, payment_method, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [contract_number, unit_id, customer_id, contract_type, start_date, end_date, total_amount, down_payment, monthly_payment, payment_method, notes]
        );

        const newContract = await db.get('SELECT * FROM contracts WHERE id = ?', [result.id]);
        await logAudit('contracts', result.id, 'CREATE', null, newContract, req);

        res.status(201).json({
            success: true,
            data: newContract,
            message: 'تم إنشاء العقد بنجاح'
        });

    } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في إنشاء العقد' });
    }
});

// تحديث عقد
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingContract = await db.get('SELECT * FROM contracts WHERE id = ?', [id]);
        if (!existingContract) {
            return res.status(404).json({ success: false, error: 'العقد غير موجود' });
        }

        const fields = Object.keys(updateData).filter(key => key !== 'id');
        const values = fields.map(field => updateData[field]);
        values.push(id);

        const sql = `UPDATE contracts SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.run(sql, values);

        const updatedContract = await db.get('SELECT * FROM contracts WHERE id = ?', [id]);
        await logAudit('contracts', id, 'UPDATE', existingContract, updatedContract, req);

        res.json({
            success: true,
            data: updatedContract,
            message: 'تم تحديث العقد بنجاح'
        });

    } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في تحديث العقد' });
    }
});

// حذف عقد
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await db.get('SELECT * FROM contracts WHERE id = ?', [id]);
        if (!contract) {
            return res.status(404).json({ success: false, error: 'العقد غير موجود' });
        }

        await db.run('DELETE FROM contracts WHERE id = ?', [id]);
        await logAudit('contracts', id, 'DELETE', contract, null, req);

        res.json({ success: true, message: 'تم حذف العقد بنجاح' });

    } catch (error) {
        console.error('Error deleting contract:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في حذف العقد' });
    }
});

module.exports = router;