const express = require('express');
const router = express.Router();
const Database = require('../database/database');
const path = require('path');
const fs = require('fs');

const db = new Database();

// إنشاء نسخة احتياطية
router.post('/create', async (req, res) => {
    try {
        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.db`);

        await db.backup(backupPath);

        res.json({
            success: true,
            data: {
                path: backupPath,
                timestamp: timestamp,
                size: fs.statSync(backupPath).size
            },
            message: 'تم إنشاء النسخة الاحتياطية بنجاح'
        });

    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في إنشاء النسخة الاحتياطية' });
    }
});

// قائمة النسخ الاحتياطية
router.get('/list', async (req, res) => {
    try {
        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            return res.json({ success: true, data: [] });
        }

        const files = fs.readdirSync(backupDir)
            .filter(file => file.endsWith('.db'))
            .map(file => {
                const filePath = path.join(backupDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => b.modified - a.modified);

        res.json({ success: true, data: files });

    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في جلب قائمة النسخ الاحتياطية' });
    }
});

// استعادة نسخة احتياطية
router.post('/restore', async (req, res) => {
    try {
        const { backup_path } = req.body;

        if (!backup_path || !fs.existsSync(backup_path)) {
            return res.status(400).json({ success: false, error: 'مسار النسخة الاحتياطية غير صحيح' });
        }

        await db.restore(backup_path);

        res.json({
            success: true,
            message: 'تم استعادة النسخة الاحتياطية بنجاح'
        });

    } catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في استعادة النسخة الاحتياطية' });
    }
});

// حذف نسخة احتياطية
router.delete('/delete', async (req, res) => {
    try {
        const { backup_path } = req.body;

        if (!backup_path || !fs.existsSync(backup_path)) {
            return res.status(400).json({ success: false, error: 'مسار النسخة الاحتياطية غير صحيح' });
        }

        fs.unlinkSync(backup_path);

        res.json({
            success: true,
            message: 'تم حذف النسخة الاحتياطية بنجاح'
        });

    } catch (error) {
        console.error('Error deleting backup:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ في حذف النسخة الاحتياطية' });
    }
});

module.exports = router;