const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const { logAudit } = require('../utils/audit');

const db = new Database();

// الحصول على جميع الوحدات
router.get('/', async (req, res) => {
    try {
        const { search, type, status, customer_id, page = 1, limit = 50 } = req.query;
        let sql = `
            SELECT 
                u.*,
                c.name as customer_name,
                c.phone as customer_phone
            FROM units u
            LEFT JOIN customers c ON u.customer_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // فلترة حسب البحث
        if (search) {
            sql += ' AND (u.name LIKE ? OR u.location LIKE ? OR u.notes LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // فلترة حسب النوع
        if (type) {
            sql += ' AND u.type = ?';
            params.push(type);
        }

        // فلترة حسب الحالة
        if (status) {
            sql += ' AND u.status = ?';
            params.push(status);
        }

        // فلترة حسب العميل
        if (customer_id) {
            sql += ' AND u.customer_id = ?';
            params.push(customer_id);
        }

        // ترتيب النتائج
        sql += ' ORDER BY u.created_at DESC';

        // الصفحات
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const units = await db.all(sql, params);

        // الحصول على العدد الإجمالي
        let countSql = 'SELECT COUNT(*) as total FROM units u WHERE 1=1';
        const countParams = [];
        
        if (search) {
            countSql += ' AND (u.name LIKE ? OR u.location LIKE ? OR u.notes LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (type) {
            countSql += ' AND u.type = ?';
            countParams.push(type);
        }
        
        if (status) {
            countSql += ' AND u.status = ?';
            countParams.push(status);
        }
        
        if (customer_id) {
            countSql += ' AND u.customer_id = ?';
            countParams.push(customer_id);
        }

        const countResult = await db.get(countSql, countParams);
        const total = countResult.total;

        res.json({
            success: true,
            data: units,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب بيانات الوحدات'
        });
    }
});

// الحصول على وحدة واحدة
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const unit = await db.get(`
            SELECT 
                u.*,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email
            FROM units u
            LEFT JOIN customers c ON u.customer_id = c.id
            WHERE u.id = ?
        `, [id]);

        if (!unit) {
            return res.status(404).json({
                success: false,
                error: 'الوحدة غير موجودة'
            });
        }

        // الحصول على الشركاء
        const partners = await db.all(`
            SELECT 
                up.*,
                p.name as partner_name,
                p.phone as partner_phone
            FROM unit_partners up
            JOIN partners p ON up.partner_id = p.id
            WHERE up.unit_id = ?
        `, [id]);

        // الحصول على العقود المرتبطة
        const contracts = await db.all(`
            SELECT 
                c.*,
                cu.name as customer_name
            FROM contracts c
            JOIN customers cu ON c.customer_id = cu.id
            WHERE c.unit_id = ?
            ORDER BY c.created_at DESC
        `, [id]);

        res.json({
            success: true,
            data: {
                ...unit,
                partners,
                contracts
            }
        });

    } catch (error) {
        console.error('Error fetching unit:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب بيانات الوحدة'
        });
    }
});

// إنشاء وحدة جديدة
router.post('/', async (req, res) => {
    try {
        const {
            name,
            type,
            area,
            price,
            location,
            status = 'available',
            customer_id,
            notes,
            partners = []
        } = req.body;

        // التحقق من البيانات المطلوبة
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                error: 'اسم الوحدة ونوعها مطلوبان'
            });
        }

        // التحقق من عدم تكرار اسم الوحدة
        const existingUnit = await db.get(
            'SELECT id FROM units WHERE name = ?',
            [name]
        );
        
        if (existingUnit) {
            return res.status(400).json({
                success: false,
                error: 'اسم الوحدة مستخدم بالفعل'
            });
        }

        // إنشاء الوحدة
        const result = await db.run(
            `INSERT INTO units (name, type, area, price, location, status, customer_id, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, type, area, price, location, status, customer_id, notes]
        );

        const newUnit = await db.get(
            'SELECT * FROM units WHERE id = ?',
            [result.id]
        );

        // إضافة الشركاء إذا وجدوا
        if (partners.length > 0) {
            for (const partner of partners) {
                await db.run(
                    'INSERT INTO unit_partners (unit_id, partner_id, share_percentage) VALUES (?, ?, ?)',
                    [result.id, partner.partner_id, partner.share_percentage]
                );
            }
        }

        // تسجيل العملية في سجل التغييرات
        await logAudit('units', result.id, 'CREATE', null, newUnit, req);

        res.status(201).json({
            success: true,
            data: newUnit,
            message: 'تم إنشاء الوحدة بنجاح'
        });

    } catch (error) {
        console.error('Error creating unit:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في إنشاء الوحدة'
        });
    }
});

// تحديث وحدة
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            area,
            price,
            location,
            status,
            customer_id,
            notes,
            partners = []
        } = req.body;

        // التحقق من وجود الوحدة
        const existingUnit = await db.get(
            'SELECT * FROM units WHERE id = ?',
            [id]
        );

        if (!existingUnit) {
            return res.status(404).json({
                success: false,
                error: 'الوحدة غير موجودة'
            });
        }

        // التحقق من عدم تكرار اسم الوحدة
        if (name && name !== existingUnit.name) {
            const duplicateUnit = await db.get(
                'SELECT id FROM units WHERE name = ? AND id != ?',
                [name, id]
            );
            
            if (duplicateUnit) {
                return res.status(400).json({
                    success: false,
                    error: 'اسم الوحدة مستخدم بالفعل'
                });
            }
        }

        // تحديث الوحدة
        await db.run(
            `UPDATE units 
             SET name = ?, type = ?, area = ?, price = ?, location = ?, status = ?, customer_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, type, area, price, location, status, customer_id, notes, id]
        );

        // تحديث الشركاء
        if (partners.length > 0) {
            // حذف الشركاء الحاليين
            await db.run('DELETE FROM unit_partners WHERE unit_id = ?', [id]);
            
            // إضافة الشركاء الجدد
            for (const partner of partners) {
                await db.run(
                    'INSERT INTO unit_partners (unit_id, partner_id, share_percentage) VALUES (?, ?, ?)',
                    [id, partner.partner_id, partner.share_percentage]
                );
            }
        }

        const updatedUnit = await db.get(
            'SELECT * FROM units WHERE id = ?',
            [id]
        );

        // تسجيل العملية في سجل التغييرات
        await logAudit('units', id, 'UPDATE', existingUnit, updatedUnit, req);

        res.json({
            success: true,
            data: updatedUnit,
            message: 'تم تحديث الوحدة بنجاح'
        });

    } catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في تحديث الوحدة'
        });
    }
});

// حذف وحدة
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // التحقق من وجود الوحدة
        const unit = await db.get(
            'SELECT * FROM units WHERE id = ?',
            [id]
        );

        if (!unit) {
            return res.status(404).json({
                success: false,
                error: 'الوحدة غير موجودة'
            });
        }

        // التحقق من عدم وجود عقود مرتبطة
        const contracts = await db.get(
            'SELECT COUNT(*) as count FROM contracts WHERE unit_id = ?',
            [id]
        );

        if (contracts.count > 0) {
            return res.status(400).json({
                success: false,
                error: 'لا يمكن حذف الوحدة لوجود عقود مرتبطة بها'
            });
        }

        // حذف الشركاء المرتبطين
        await db.run('DELETE FROM unit_partners WHERE unit_id = ?', [id]);

        // حذف الوحدة
        await db.run('DELETE FROM units WHERE id = ?', [id]);

        // تسجيل العملية في سجل التغييرات
        await logAudit('units', id, 'DELETE', unit, null, req);

        res.json({
            success: true,
            message: 'تم حذف الوحدة بنجاح'
        });

    } catch (error) {
        console.error('Error deleting unit:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في حذف الوحدة'
        });
    }
});

// إحصائيات الوحدات
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_units,
                COUNT(CASE WHEN status = 'available' THEN 1 END) as available_units,
                COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_units,
                COUNT(CASE WHEN status = 'rented' THEN 1 END) as rented_units,
                COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved_units,
                SUM(CASE WHEN status = 'available' THEN price ELSE 0 END) as total_available_value,
                SUM(price) as total_value,
                AVG(price) as avg_price
            FROM units
        `);

        // الوحدات حسب النوع
        const unitsByType = await db.all(`
            SELECT 
                type,
                COUNT(*) as count,
                SUM(price) as total_value,
                AVG(price) as avg_price
            FROM units
            GROUP BY type
            ORDER BY count DESC
        `);

        // الوحدات حسب الحالة
        const unitsByStatus = await db.all(`
            SELECT 
                status,
                COUNT(*) as count,
                SUM(price) as total_value
            FROM units
            GROUP BY status
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: {
                ...stats,
                units_by_type: unitsByType,
                units_by_status: unitsByStatus
            }
        });

    } catch (error) {
        console.error('Error fetching unit stats:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب إحصائيات الوحدات'
        });
    }
});

module.exports = router;