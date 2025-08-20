const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('../database/database');

const router = express.Router();
const db = new Database();

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم وكلمة المرور مطلوبان'
            });
        }

        // البحث عن المستخدم
        const user = await db.get(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // إنشاء JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // إزالة كلمة المرور من الاستجابة
        delete user.password;

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user,
            token
        });

    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل الدخول'
        });
    }
});

// التحقق من التوكن
router.post('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'التوكن مطلوب'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const user = await db.get(
            'SELECT id, username, name, role, email FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'مستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('خطأ في التحقق من التوكن:', error);
        res.status(401).json({
            success: false,
            message: 'توكن غير صالح'
        });
    }
});

module.exports = router;