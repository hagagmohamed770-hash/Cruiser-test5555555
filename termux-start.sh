#!/data/data/com.termux/files/usr/bin/bash

# 🚀 سكريبت تشغيل نظام إدارة الاستثمار العقاري على Termux
# الإصدار: 5.0.0
# التاريخ: 2025-08-20

echo "🏢 نظام إدارة الاستثمار العقاري - Termux"
echo "=========================================="

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت"
    echo "📦 جاري تثبيت Node.js..."
    pkg install -y nodejs npm
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت"
    echo "📦 جاري تثبيت npm..."
    pkg install -y npm
fi

# التحقق من وجود git
if ! command -v git &> /dev/null; then
    echo "❌ git غير مثبت"
    echo "📦 جاري تثبيت git..."
    pkg install -y git
fi

# التحقق من وجود wget
if ! command -v wget &> /dev/null; then
    echo "❌ wget غير مثبت"
    echo "📦 جاري تثبيت wget..."
    pkg install -y wget
fi

# التحقق من وجود unzip
if ! command -v unzip &> /dev/null; then
    echo "❌ unzip غير مثبت"
    echo "📦 جاري تثبيت unzip..."
    pkg install -y unzip
fi

echo "✅ جميع المتطلبات متوفرة"

# إنشاء مجلد المشروع إذا لم يكن موجوداً
if [ ! -d "~/real-estate-system" ]; then
    echo "📁 إنشاء مجلد المشروع..."
    mkdir -p ~/real-estate-system
fi

cd ~/real-estate-system

# التحقق من وجود الملف المضغوط
if [ ! -f "real-estate-system-complete.zip" ]; then
    echo "📥 تحميل النظام من GitHub..."
    wget https://github.com/hagagmohamed770-hash/Cruiser-test5555555/raw/release/v5.0.0-complete/real-estate-system-complete.zip
    
    if [ $? -ne 0 ]; then
        echo "❌ فشل في تحميل الملف"
        exit 1
    fi
fi

# فك الضغط إذا لم يكن مفكوكاً
if [ ! -d "real-estate-system-complete" ]; then
    echo "📦 فك ضغط الملفات..."
    unzip -o real-estate-system-complete.zip
    
    if [ $? -ne 0 ]; then
        echo "❌ فشل في فك الضغط"
        exit 1
    fi
fi

cd real-estate-system-complete

# إنشاء مجلد البيانات
mkdir -p data

# إنشاء ملف .env إذا لم يكن موجوداً
if [ ! -f ".env" ]; then
    echo "⚙️ إنشاء ملف الإعدادات..."
    cp .env.example .env
    
    # تعديل الإعدادات لـ Termux
    sed -i 's/PORT=3000/PORT=8080/' .env
    sed -i 's/DB_PATH=.\/data\/real_estate.db/DB_PATH=.\/data\/real_estate.db/' .env
    sed -i 's/JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production/JWT_SECRET=termux-secret-key-2025/' .env
fi

# تثبيت التبعيات إذا لم تكن مثبتة
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت التبعيات..."
    npm install --no-optional
    
    if [ $? -ne 0 ]; then
        echo "⚠️ محاولة تثبيت مع --force..."
        npm install --force
    fi
fi

# إعطاء صلاحيات التنفيذ للسكريبت
chmod +x start.sh

echo "🚀 تشغيل النظام..."
echo "=========================================="
echo "📱 يمكنك الوصول للنظام من:"
echo "   - نفس الجهاز: http://localhost:8080"
echo "   - أجهزة أخرى: http://[IP-HONE]:8080"
echo ""
echo "🔑 بيانات الدخول:"
echo "   - المستخدم: admin"
echo "   - كلمة المرور: admin123"
echo "=========================================="

# تشغيل النظام
npm start