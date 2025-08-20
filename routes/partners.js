const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const { logAudit } = require('../utils/audit');

const db = new Database();

router.get('/', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 50 } = req.query;
        let sql = 'SELECT * FROM partners WHERE 1=1';
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

        const partners = await db.all(sql, params);
        res.json({ success: true, data: partners });

    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب الشركاء' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, phone, email, national_id, address, share_percentage, notes, status = 'active' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'اسم الشريك مطلوب' });
        }

        const result = await db.run(
            'INSERT INTO partners (name, phone, email, national_id, address, share_percentage, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, phone, email, national_id, address, share_percentage, notes, status]
        );

        const newPartner = await db.get('SELECT * FROM partners WHERE id = ?', [result.id]);
        await logAudit('partners', result.id, 'CREATE', null, newPartner, req);

        res.status(201).json({ success: true, data: newPartner, message: 'تم إنشاء الشريك بنجاح' });

    } catch (error) {
        console.error('Error creating partner:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في إنشاء الشريك' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingPartner = await db.get('SELECT * FROM partners WHERE id = ?', [id]);
        if (!existingPartner) {
            return res.status(404).json({ success: false, error: 'الشريك غير موجود' });
        }

        const fields = Object.keys(updateData).filter(key => key !== 'id');
        const values = fields.map(field => updateData[field]);
        values.push(id);

        const sql = `UPDATE partners SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.run(sql, values);

        const updatedPartner = await db.get('SELECT * FROM partners WHERE id = ?', [id]);
        await logAudit('partners', id, 'UPDATE', existingPartner, updatedPartner, req);

        res.json({ success: true, data: updatedPartner, message: 'تم تحديث الشريك بنجاح' });

    } catch (error) {
        console.error('Error updating partner:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في تحديث الشريك' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const partner = await db.get('SELECT * FROM partners WHERE id = ?', [id]);
        if (!partner) {
            return res.status(404).json({ success: false, error: 'الشريك غير موجود' });
        }

        await db.run('DELETE FROM partners WHERE id = ?', [id]);
        await logAudit('partners', id, 'DELETE', partner, null, req);

        res.json({ success: true, message: 'تم حذف الشريك بنجاح' });

    } catch (error) {
        console.error('Error deleting partner:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في حذف الشريك' });
    }
});

module.exports = router;