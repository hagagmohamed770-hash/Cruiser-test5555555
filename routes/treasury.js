const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const { logAudit } = require('../utils/audit');

const db = new Database();

// الحصول على الخزائن
router.get('/safes', async (req, res) => {
    try {
        const safes = await db.all('SELECT * FROM safes ORDER BY created_at DESC');
        res.json({ success: true, data: safes });
    } catch (error) {
        console.error('Error fetching safes:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب الخزائن' });
    }
});

// إنشاء خزينة جديدة
router.post('/safes', async (req, res) => {
    try {
        const { name, balance, currency, notes } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'اسم الخزينة مطلوب' });
        }

        const result = await db.run(
            'INSERT INTO safes (name, balance, currency, notes) VALUES (?, ?, ?, ?)',
            [name, balance || 0, currency || 'SAR', notes]
        );

        const newSafe = await db.get('SELECT * FROM safes WHERE id = ?', [result.id]);
        await logAudit('safes', result.id, 'CREATE', null, newSafe, req);

        res.status(201).json({ success: true, data: newSafe, message: 'تم إنشاء الخزينة بنجاح' });

    } catch (error) {
        console.error('Error creating safe:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في إنشاء الخزينة' });
    }
});

// تحديث رصيد الخزينة
router.put('/safes/:id/balance', async (req, res) => {
    try {
        const { id } = req.params;
        const { balance } = req.body;

        const safe = await db.get('SELECT * FROM safes WHERE id = ?', [id]);
        if (!safe) {
            return res.status(404).json({ success: false, error: 'الخزينة غير موجودة' });
        }

        await db.run(
            'UPDATE safes SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [balance, id]
        );

        const updatedSafe = await db.get('SELECT * FROM safes WHERE id = ?', [id]);
        await logAudit('safes', id, 'UPDATE', safe, updatedSafe, req);

        res.json({ success: true, data: updatedSafe, message: 'تم تحديث رصيد الخزينة بنجاح' });

    } catch (error) {
        console.error('Error updating safe balance:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في تحديث رصيد الخزينة' });
    }
});

// الحصول على التحويلات
router.get('/transfers', async (req, res) => {
    try {
        const { from_safe_id, to_safe_id, date, page = 1, limit = 50 } = req.query;
        let sql = `
            SELECT 
                t.*,
                fs.name as from_safe_name,
                ts.name as to_safe_name
            FROM transfers t
            LEFT JOIN safes fs ON t.from_safe_id = fs.id
            LEFT JOIN safes ts ON t.to_safe_id = ts.id
            WHERE 1=1
        `;
        const params = [];

        if (from_safe_id) {
            sql += ' AND t.from_safe_id = ?';
            params.push(from_safe_id);
        }

        if (to_safe_id) {
            sql += ' AND t.to_safe_id = ?';
            params.push(to_safe_id);
        }

        if (date) {
            sql += ' AND DATE(t.date) = ?';
            params.push(date);
        }

        sql += ' ORDER BY t.date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (page - 1) * limit);

        const transfers = await db.all(sql, params);
        res.json({ success: true, data: transfers });

    } catch (error) {
        console.error('Error fetching transfers:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب التحويلات' });
    }
});

// إنشاء تحويل
router.post('/transfers', async (req, res) => {
    try {
        const { from_safe_id, to_safe_id, amount, description, date } = req.body;

        if (!from_safe_id || !to_safe_id || !amount || !date) {
            return res.status(400).json({ success: false, error: 'جميع البيانات المطلوبة يجب أن تكون مملوءة' });
        }

        // التحقق من رصيد الخزينة المصدر
        const fromSafe = await db.get('SELECT * FROM safes WHERE id = ?', [from_safe_id]);
        if (!fromSafe) {
            return res.status(404).json({ success: false, error: 'الخزينة المصدر غير موجودة' });
        }

        if (fromSafe.balance < amount) {
            return res.status(400).json({ success: false, error: 'رصيد الخزينة المصدر غير كافي' });
        }

        // إنشاء التحويل
        const result = await db.run(
            'INSERT INTO transfers (from_safe_id, to_safe_id, amount, description, date) VALUES (?, ?, ?, ?, ?)',
            [from_safe_id, to_safe_id, amount, description, date]
        );

        // تحديث أرصدة الخزائن
        await db.run(
            'UPDATE safes SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [amount, from_safe_id]
        );

        await db.run(
            'UPDATE safes SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [amount, to_safe_id]
        );

        const newTransfer = await db.get('SELECT * FROM transfers WHERE id = ?', [result.id]);
        await logAudit('transfers', result.id, 'CREATE', null, newTransfer, req);

        res.status(201).json({ success: true, data: newTransfer, message: 'تم إنشاء التحويل بنجاح' });

    } catch (error) {
        console.error('Error creating transfer:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في إنشاء التحويل' });
    }
});

// إحصائيات الخزينة
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_safes,
                SUM(balance) as total_balance,
                AVG(balance) as avg_balance
            FROM safes
        `);

        // الخزائن حسب العملة
        const safesByCurrency = await db.all(`
            SELECT 
                currency,
                COUNT(*) as count,
                SUM(balance) as total_balance
            FROM safes
            GROUP BY currency
        `);

        // التحويلات الشهرية
        const monthlyTransfers = await db.all(`
            SELECT 
                strftime('%Y-%m', date) as month,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM transfers
            WHERE date >= DATE('now', '-12 months')
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month DESC
        `);

        res.json({
            success: true,
            data: {
                ...stats,
                safes_by_currency: safesByCurrency,
                monthly_transfers: monthlyTransfers
            }
        });

    } catch (error) {
        console.error('Error fetching treasury stats:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب إحصائيات الخزينة' });
    }
});

module.exports = router;