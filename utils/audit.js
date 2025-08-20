const Database = require('../database/database');

const db = new Database();

/**
 * تسجيل عملية في سجل التغييرات
 * @param {string} tableName - اسم الجدول
 * @param {number} recordId - معرف السجل
 * @param {string} action - نوع العملية (CREATE, UPDATE, DELETE)
 * @param {Object} oldValues - القيم القديمة
 * @param {Object} newValues - القيم الجديدة
 * @param {Object} req - كائن الطلب
 */
async function logAudit(tableName, recordId, action, oldValues, newValues, req) {
    try {
        const userId = req.user?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

        await db.run(
            `INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                tableName,
                recordId,
                action,
                oldValues ? JSON.stringify(oldValues) : null,
                newValues ? JSON.stringify(newValues) : null,
                userId,
                ipAddress
            ]
        );
    } catch (error) {
        console.error('Error logging audit:', error);
        // لا نريد أن نوقف العملية إذا فشل تسجيل السجل
    }
}

/**
 * الحصول على سجل التغييرات
 * @param {Object} options - خيارات البحث
 */
async function getAuditLog(options = {}) {
    try {
        const {
            tableName,
            recordId,
            action,
            userId,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = options;

        let sql = `
            SELECT 
                al.*,
                u.username as user_username,
                u.full_name as user_full_name
            FROM audit_log al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (tableName) {
            sql += ' AND al.table_name = ?';
            params.push(tableName);
        }

        if (recordId) {
            sql += ' AND al.record_id = ?';
            params.push(recordId);
        }

        if (action) {
            sql += ' AND al.action = ?';
            params.push(action);
        }

        if (userId) {
            sql += ' AND al.user_id = ?';
            params.push(userId);
        }

        if (startDate) {
            sql += ' AND DATE(al.created_at) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            sql += ' AND DATE(al.created_at) <= ?';
            params.push(endDate);
        }

        sql += ' ORDER BY al.created_at DESC';

        // الصفحات
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const logs = await db.all(sql, params);

        // الحصول على العدد الإجمالي
        let countSql = 'SELECT COUNT(*) as total FROM audit_log al WHERE 1=1';
        const countParams = [];

        if (tableName) {
            countSql += ' AND al.table_name = ?';
            countParams.push(tableName);
        }

        if (recordId) {
            countSql += ' AND al.record_id = ?';
            countParams.push(recordId);
        }

        if (action) {
            countSql += ' AND al.action = ?';
            countParams.push(action);
        }

        if (userId) {
            countSql += ' AND al.user_id = ?';
            countParams.push(userId);
        }

        if (startDate) {
            countSql += ' AND DATE(al.created_at) >= ?';
            countParams.push(startDate);
        }

        if (endDate) {
            countSql += ' AND DATE(al.created_at) <= ?';
            countParams.push(endDate);
        }

        const countResult = await db.get(countSql, countParams);
        const total = countResult.total;

        return {
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };

    } catch (error) {
        console.error('Error getting audit log:', error);
        throw error;
    }
}

/**
 * الحصول على إحصائيات سجل التغييرات
 */
async function getAuditStats() {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_logs,
                COUNT(DISTINCT table_name) as tables_affected,
                COUNT(DISTINCT user_id) as users_active,
                COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as creates,
                COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
                COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes
            FROM audit_log
        `);

        // النشاط اليومي
        const dailyActivity = await db.all(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count,
                COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as creates,
                COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
                COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes
            FROM audit_log
            WHERE created_at >= DATE('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        // أكثر الجداول نشاطاً
        const tableActivity = await db.all(`
            SELECT 
                table_name,
                COUNT(*) as count,
                COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as creates,
                COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
                COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes
            FROM audit_log
            GROUP BY table_name
            ORDER BY count DESC
            LIMIT 10
        `);

        return {
            ...stats,
            daily_activity: dailyActivity,
            table_activity: tableActivity
        };

    } catch (error) {
        console.error('Error getting audit stats:', error);
        throw error;
    }
}

/**
 * تنظيف سجل التغييرات القديم
 * @param {number} daysToKeep - عدد الأيام للاحتفاظ بالسجلات
 */
async function cleanOldAuditLogs(daysToKeep = 365) {
    try {
        const result = await db.run(
            'DELETE FROM audit_log WHERE created_at < DATE("now", ?)',
            [`-${daysToKeep} days`]
        );

        return result.changes;
    } catch (error) {
        console.error('Error cleaning old audit logs:', error);
        throw error;
    }
}

module.exports = {
    logAudit,
    getAuditLog,
    getAuditStats,
    cleanOldAuditLogs
};