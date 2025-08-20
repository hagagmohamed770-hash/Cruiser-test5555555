const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('../database/database');

const db = new Database();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'اسم المستخدم وكلمة المرور مطلوبان'
            });
        }

        // البحث عن المستخدم
        const user = await db.get(
            'SELECT * FROM users WHERE username = ? AND status = "active"',
            [username]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // تحديث آخر تسجيل دخول
        await db.run(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // إنشاء توكن
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                }
            },
            message: 'تم تسجيل الدخول بنجاح'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في تسجيل الدخول'
        });
    }
});

// التحقق من التوكن
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'التوكن مطلوب'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.get(
            'SELECT id, username, email, full_name, role, status FROM users WHERE id = ? AND status = "active"',
            [decoded.id]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            error: 'التوكن غير صالح'
        });
    }
});

// تغيير كلمة المرور
router.post('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'التوكن مطلوب'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.get(
            'SELECT * FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'المستخدم غير موجود'
            });
        }

        // التحقق من كلمة المرور الحالية
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                error: 'كلمة المرور الحالية غير صحيحة'
            });
        }

        // تشفير كلمة المرور الجديدة
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // تحديث كلمة المرور
        await db.run(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedNewPassword, user.id]
        );

        res.json({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في تغيير كلمة المرور'
        });
    }
});

module.exports = router;