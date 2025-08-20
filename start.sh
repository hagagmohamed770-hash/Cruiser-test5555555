#!/bin/bash

echo "🚀 بدء تشغيل نظام إدارة الاستثمار العقاري v5.0.0"
echo "================================================"

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً."
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت npm أولاً."
    exit 1
fi

echo "✅ Node.js و npm مثبتان"

# تثبيت التبعيات إذا لم تكن مثبتة
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت التبعيات..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ فشل في تثبيت التبعيات"
        exit 1
    fi
    echo "✅ تم تثبيت التبعيات بنجاح"
else
    echo "✅ التبعيات مثبتة بالفعل"
fi

# إنشاء مجلد البيانات إذا لم يكن موجوداً
if [ ! -d "data" ]; then
    echo "📁 إنشاء مجلد البيانات..."
    mkdir -p data
fi

# إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
if [ ! -d "backups" ]; then
    echo "📁 إنشاء مجلد النسخ الاحتياطية..."
    mkdir -p backups
fi

echo "🔧 تهيئة قاعدة البيانات..."
node -e "
const Database = require('./database/database');
const db = new Database();
db.initialize().then(() => {
    console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
    process.exit(0);
}).catch(err => {
    console.error('❌ فشل في تهيئة قاعدة البيانات:', err);
    process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo "❌ فشل في تهيئة قاعدة البيانات"
    exit 1
fi

echo ""
echo "🌐 بدء تشغيل الخادم..."
echo "📊 يمكنك الوصول للتطبيق على: http://localhost:3000"
echo "🔑 بيانات تسجيل الدخول الافتراضية:"
echo "   اسم المستخدم: admin"
echo "   كلمة المرور: admin123"
echo ""
echo "⏹️  اضغط Ctrl+C لإيقاف الخادم"
echo ""

# تشغيل الخادم
npm start