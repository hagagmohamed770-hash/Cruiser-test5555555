const express = require('express');
const router = express.Router();
const Database = require('../database/database');

const db = new Database();

// تقرير عام
router.get('/dashboard', async (req, res) => {
    try {
        // إحصائيات العملاء
        const customerStats = await db.get(`
            SELECT 
                COUNT(*) as total_customers,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_customers
            FROM customers
        `);

        // إحصائيات الوحدات
        const unitStats = await db.get(`
            SELECT 
                COUNT(*) as total_units,
                COUNT(CASE WHEN status = 'available' THEN 1 END) as available_units,
                COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_units,
                COUNT(CASE WHEN status = 'rented' THEN 1 END) as rented_units,
                SUM(price) as total_value,
                AVG(price) as avg_price
            FROM units
        `);

        // إحصائيات العقود
        const contractStats = await db.get(`
            SELECT 
                COUNT(*) as total_contracts,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
                SUM(total_amount) as total_contract_value,
                AVG(total_amount) as avg_contract_value
            FROM contracts
        `);

        // إحصائيات الأقساط
        const installmentStats = await db.get(`
            SELECT 
                COUNT(*) as total_installments,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_installments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_installments,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_installments,
                SUM(amount) as total_amount,
                SUM(paid_amount) as total_paid,
                SUM(amount - paid_amount) as total_remaining
            FROM installments
        `);

        // إحصائيات الخزينة
        const treasuryStats = await db.get(`
            SELECT 
                COUNT(*) as total_safes,
                SUM(balance) as total_balance
            FROM safes
        `);

        res.json({
            success: true,
            data: {
                customers: customerStats,
                units: unitStats,
                contracts: contractStats,
                installments: installmentStats,
                treasury: treasuryStats
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard report:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب التقرير' });
    }
});

// تقرير المبيعات
router.get('/sales', async (req, res) => {
    try {
        const { start_date, end_date, type } = req.query;
        let sql = `
            SELECT 
                c.*,
                cu.name as customer_name,
                u.name as unit_name,
                u.type as unit_type
            FROM contracts c
            JOIN customers cu ON c.customer_id = cu.id
            JOIN units u ON c.unit_id = u.id
            WHERE c.contract_type = 'sale'
        `;
        const params = [];

        if (start_date) {
            sql += ' AND c.start_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            sql += ' AND c.start_date <= ?';
            params.push(end_date);
        }

        sql += ' ORDER BY c.start_date DESC';

        const sales = await db.all(sql, params);

        // إحصائيات المبيعات
        const salesStats = await db.get(`
            SELECT 
                COUNT(*) as total_sales,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_sale_value,
                SUM(down_payment) as total_down_payments
            FROM contracts
            WHERE contract_type = 'sale'
            ${start_date ? 'AND start_date >= ?' : ''}
            ${end_date ? 'AND start_date <= ?' : ''}
        `, params);

        res.json({
            success: true,
            data: {
                sales,
                stats: salesStats
            }
        });

    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب تقرير المبيعات' });
    }
});

// تقرير الإيجارات
router.get('/rentals', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let sql = `
            SELECT 
                c.*,
                cu.name as customer_name,
                u.name as unit_name,
                u.type as unit_type
            FROM contracts c
            JOIN customers cu ON c.customer_id = cu.id
            JOIN units u ON c.unit_id = u.id
            WHERE c.contract_type = 'rent'
        `;
        const params = [];

        if (start_date) {
            sql += ' AND c.start_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            sql += ' AND c.start_date <= ?';
            params.push(end_date);
        }

        sql += ' ORDER BY c.start_date DESC';

        const rentals = await db.all(sql, params);

        // إحصائيات الإيجارات
        const rentalStats = await db.get(`
            SELECT 
                COUNT(*) as total_rentals,
                SUM(total_amount) as total_rental_value,
                AVG(monthly_payment) as avg_monthly_rent,
                SUM(monthly_payment) as total_monthly_income
            FROM contracts
            WHERE contract_type = 'rent'
            ${start_date ? 'AND start_date >= ?' : ''}
            ${end_date ? 'AND start_date <= ?' : ''}
        `, params);

        res.json({
            success: true,
            data: {
                rentals,
                stats: rentalStats
            }
        });

    } catch (error) {
        console.error('Error fetching rentals report:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب تقرير الإيجارات' });
    }
});

// تقرير الأقساط
router.get('/installments', async (req, res) => {
    try {
        const { status, due_date, customer_id } = req.query;
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

        if (status) {
            sql += ' AND i.status = ?';
            params.push(status);
        }

        if (due_date) {
            sql += ' AND i.due_date = ?';
            params.push(due_date);
        }

        if (customer_id) {
            sql += ' AND c.customer_id = ?';
            params.push(customer_id);
        }

        sql += ' ORDER BY i.due_date ASC';

        const installments = await db.all(sql, params);

        // الأقساط المتأخرة
        const overdueInstallments = await db.all(`
            SELECT 
                i.*,
                c.contract_number,
                cu.name as customer_name,
                u.name as unit_name
            FROM installments i
            JOIN contracts c ON i.contract_id = c.id
            JOIN customers cu ON c.customer_id = cu.id
            JOIN units u ON c.unit_id = u.id
            WHERE i.status = 'pending' AND i.due_date < DATE('now')
            ORDER BY i.due_date ASC
        `);

        res.json({
            success: true,
            data: {
                installments,
                overdue: overdueInstallments
            }
        });

    } catch (error) {
        console.error('Error fetching installments report:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب تقرير الأقساط' });
    }
});

// تقرير الشركاء
router.get('/partners', async (req, res) => {
    try {
        const partners = await db.all(`
            SELECT 
                p.*,
                COUNT(up.unit_id) as units_count,
                SUM(up.share_percentage) as total_share
            FROM partners p
            LEFT JOIN unit_partners up ON p.id = up.partner_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);

        // إحصائيات الشركاء
        const partnerStats = await db.get(`
            SELECT 
                COUNT(*) as total_partners,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_partners,
                AVG(share_percentage) as avg_share
            FROM partners
        `);

        res.json({
            success: true,
            data: {
                partners,
                stats: partnerStats
            }
        });

    } catch (error) {
        console.error('Error fetching partners report:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب تقرير الشركاء' });
    }
});

module.exports = router;