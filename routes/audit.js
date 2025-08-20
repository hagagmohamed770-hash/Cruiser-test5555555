const express = require('express');
const router = express.Router();
const { getAuditLog, getAuditStats, cleanOldAuditLogs } = require('../utils/audit');

// الحصول على سجل التغييرات
router.get('/', async (req, res) => {
    try {
        const { table_name, record_id, action, user_id, start_date, end_date, page = 1, limit = 50 } = req.query;
        
        const result = await getAuditLog({
            tableName: table_name,
            recordId: record_id,
            action,
            userId: user_id,
            startDate: start_date,
            endDate: end_date,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: result.logs,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب سجل التغييرات' });
    }
});

// إحصائيات سجل التغييرات
router.get('/stats', async (req, res) => {
    try {
        const stats = await getAuditStats();
        res.json({ success: true, data: stats });

    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب إحصائيات سجل التغييرات' });
    }
});

// تنظيف السجلات القديمة
router.delete('/clean', async (req, res) => {
    try {
        const { days = 365 } = req.query;
        const deletedCount = await cleanOldAuditLogs(parseInt(days));

        res.json({
            success: true,
            data: { deleted_count: deletedCount },
            message: `تم حذف ${deletedCount} سجل قديم`
        });

    } catch (error) {
        console.error('Error cleaning audit logs:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في تنظيف سجل التغييرات' });
    }
});

module.exports = router;