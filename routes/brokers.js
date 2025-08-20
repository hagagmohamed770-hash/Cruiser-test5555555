const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const { logAudit } = require('../utils/audit');

const db = new Database();

router.get('/', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 50 } = req.query;
        let sql = 'SELECT * FROM brokers WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (page - 1) * limit);

        const brokers = await db.all(sql, params);
        res.json({ success: true, data: brokers });

    } catch (error) {
        console.error('Error fetching brokers:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب السماسرة' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, phone, email, national_id, commission_rate, notes, status = 'active' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'اسم السمسار مطلوب' });
        }

        const result = await db.run(
            'INSERT INTO brokers (name, phone, email, national_id, commission_rate, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, phone, email, national_id, commission_rate, notes, status]
        );

        const newBroker = await db.get('SELECT * FROM brokers WHERE id = ?', [result.id]);
        await logAudit('brokers', result.id, 'CREATE', null, newBroker, req);

        res.status(201).json({ success: true, data: newBroker, message: 'تم إنشاء السمسار بنجاح' });

    } catch (error) {
        console.error('Error creating broker:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في إنشاء السمسار' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingBroker = await db.get('SELECT * FROM brokers WHERE id = ?', [id]);
        if (!existingBroker) {
            return res.status(404).json({ success: false, error: 'السمسار غير موجود' });
        }

        const fields = Object.keys(updateData).filter(key => key !== 'id');
        const values = fields.map(field => updateData[field]);
        values.push(id);

        const sql = `UPDATE brokers SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.run(sql, values);

        const updatedBroker = await db.get('SELECT * FROM brokers WHERE id = ?', [id]);
        await logAudit('brokers', id, 'UPDATE', existingBroker, updatedBroker, req);

        res.json({ success: true, data: updatedBroker, message: 'تم تحديث السمسار بنجاح' });

    } catch (error) {
        console.error('Error updating broker:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في تحديث السمسار' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const broker = await db.get('SELECT * FROM brokers WHERE id = ?', [id]);
        if (!broker) {
            return res.status(404).json({ success: false, error: 'السمسار غير موجود' });
        }

        await db.run('DELETE FROM brokers WHERE id = ?', [id]);
        await logAudit('brokers', id, 'DELETE', broker, null, req);

        res.json({ success: true, message: 'تم حذف السمسار بنجاح' });

    } catch (error) {
        console.error('Error deleting broker:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في حذف السمسار' });
    }
});

module.exports = router;