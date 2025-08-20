const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const { logAudit } = require('../utils/audit');

const db = new Database();

// الحصول على جميع العملاء
router.get('/', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 50 } = req.query;
        let sql = 'SELECT * FROM customers WHERE 1=1';
        const params = [];

        // فلترة حسب البحث
        if (search) {
            sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR national_id LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // فلترة حسب الحالة
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        // ترتيب النتائج
        sql += ' ORDER BY created_at DESC';

        // الصفحات
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const customers = await db.all(sql, params);

        // الحصول على العدد الإجمالي
        let countSql = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
        const countParams = [];
        
        if (search) {
            countSql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR national_id LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (status) {
            countSql += ' AND status = ?';
            countParams.push(status);
        }

        const countResult = await db.get(countSql, countParams);
        const total = countResult.total;

        res.json({
            success: true,
            data: customers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب بيانات العملاء'
        });
    }
});

// الحصول على عميل واحد
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const customer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'العميل غير موجود'
            });
        }

        // الحصول على العقود المرتبطة
        const contracts = await db.all(
            'SELECT * FROM contracts WHERE customer_id = ? ORDER BY created_at DESC',
            [id]
        );

        // الحصول على الوحدات المرتبطة
        const units = await db.all(
            'SELECT * FROM units WHERE customer_id = ? ORDER BY created_at DESC',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...customer,
                contracts,
                units
            }
        });

    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب بيانات العميل'
        });
    }
});

// إنشاء عميل جديد
router.post('/', async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            national_id,
            address,
            notes,
            status = 'active'
        } = req.body;

        // التحقق من البيانات المطلوبة
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'اسم العميل مطلوب'
            });
        }

        // التحقق من عدم تكرار رقم الهوية الوطنية
        if (national_id) {
            const existingCustomer = await db.get(
                'SELECT id FROM customers WHERE national_id = ?',
                [national_id]
            );
            
            if (existingCustomer) {
                return res.status(400).json({
                    success: false,
                    error: 'رقم الهوية الوطنية مستخدم بالفعل'
                });
            }
        }

        const result = await db.run(
            `INSERT INTO customers (name, phone, email, national_id, address, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, phone, email, national_id, address, notes, status]
        );

        const newCustomer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [result.id]
        );

        // تسجيل العملية في سجل التغييرات
        await logAudit('customers', result.id, 'CREATE', null, newCustomer, req);

        res.status(201).json({
            success: true,
            data: newCustomer,
            message: 'تم إنشاء العميل بنجاح'
        });

    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في إنشاء العميل'
        });
    }
});

// تحديث عميل
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            phone,
            email,
            national_id,
            address,
            notes,
            status
        } = req.body;

        // التحقق من وجود العميل
        const existingCustomer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );

        if (!existingCustomer) {
            return res.status(404).json({
                success: false,
                error: 'العميل غير موجود'
            });
        }

        // التحقق من عدم تكرار رقم الهوية الوطنية
        if (national_id && national_id !== existingCustomer.national_id) {
            const duplicateCustomer = await db.get(
                'SELECT id FROM customers WHERE national_id = ? AND id != ?',
                [national_id, id]
            );
            
            if (duplicateCustomer) {
                return res.status(400).json({
                    success: false,
                    error: 'رقم الهوية الوطنية مستخدم بالفعل'
                });
            }
        }

        const result = await db.run(
            `UPDATE customers 
             SET name = ?, phone = ?, email = ?, national_id = ?, address = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, phone, email, national_id, address, notes, status, id]
        );

        const updatedCustomer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );

        // تسجيل العملية في سجل التغييرات
        await logAudit('customers', id, 'UPDATE', existingCustomer, updatedCustomer, req);

        res.json({
            success: true,
            data: updatedCustomer,
            message: 'تم تحديث العميل بنجاح'
        });

    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في تحديث العميل'
        });
    }
});

// حذف عميل
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // التحقق من وجود العميل
        const customer = await db.get(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'العميل غير موجود'
            });
        }

        // التحقق من عدم وجود عقود مرتبطة
        const contracts = await db.get(
            'SELECT COUNT(*) as count FROM contracts WHERE customer_id = ?',
            [id]
        );

        if (contracts.count > 0) {
            return res.status(400).json({
                success: false,
                error: 'لا يمكن حذف العميل لوجود عقود مرتبطة به'
            });
        }

        // التحقق من عدم وجود وحدات مرتبطة
        const units = await db.get(
            'SELECT COUNT(*) as count FROM units WHERE customer_id = ?',
            [id]
        );

        if (units.count > 0) {
            return res.status(400).json({
                success: false,
                error: 'لا يمكن حذف العميل لوجود وحدات مرتبطة به'
            });
        }

        await db.run('DELETE FROM customers WHERE id = ?', [id]);

        // تسجيل العملية في سجل التغييرات
        await logAudit('customers', id, 'DELETE', customer, null, req);

        res.json({
            success: true,
            message: 'تم حذف العميل بنجاح'
        });

    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في حذف العميل'
        });
    }
});

// إحصائيات العملاء
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_customers,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_customers,
                COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as with_phone,
                COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email
            FROM customers
        `);

        // العملاء الجدد هذا الشهر
        const newThisMonth = await db.get(`
            SELECT COUNT(*) as count 
            FROM customers 
            WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
        `);

        res.json({
            success: true,
            data: {
                ...stats,
                new_this_month: newThisMonth.count
            }
        });

    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب إحصائيات العملاء'
        });
    }
});

module.exports = router;