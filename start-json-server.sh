#!/bin/bash

# 🚀 سكريبت تشغيل JSON Server
# بديل لقاعدة البيانات للمواقع المجانية

echo "🌐 تشغيل JSON Server..."
echo "=========================="

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت"
    echo "📦 جاري تثبيت Node.js..."
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y nodejs npm
    elif command -v yum &> /dev/null; then
        sudo yum install -y nodejs npm
    elif command -v brew &> /dev/null; then
        brew install node
    else
        echo "❌ لا يمكن تثبيت Node.js تلقائياً"
        echo "📦 يرجى تثبيت Node.js يدوياً"
        exit 1
    fi
fi

# تثبيت JSON Server إذا لم يكن مثبتاً
if ! command -v json-server &> /dev/null; then
    echo "📦 تثبيت JSON Server..."
    npm install -g json-server
fi

# التحقق من وجود ملف db.json
if [ ! -f "db.json" ]; then
    echo "❌ ملف db.json غير موجود"
    echo "📄 إنشاء ملف db.json..."
    cat > db.json << 'EOF'
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "password": "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      "name": "مدير النظام",
      "role": "admin",
      "created_at": "2025-01-27T10:00:00.000Z",
      "updated_at": "2025-01-27T10:00:00.000Z"
    }
  ],
  "customers": [],
  "units": [],
  "contracts": [],
  "installments": [],
  "partners": [],
  "brokers": [],
  "vouchers": [],
  "safes": [
    {
      "id": 1,
      "name": "الخزينة الرئيسية",
      "balance": 0,
      "currency": "ريال",
      "status": "active",
      "created_at": "2025-01-27T10:00:00.000Z",
      "updated_at": "2025-01-27T10:00:00.000Z"
    }
  ],
  "transfers": [],
  "audit_log": [],
  "settings": [
    {
      "id": 1,
      "key": "company_name",
      "value": "شركة إدارة الاستثمار العقاري",
      "created_at": "2025-01-27T10:00:00.000Z"
    },
    {
      "id": 2,
      "key": "currency",
      "value": "ريال",
      "created_at": "2025-01-27T10:00:00.000Z"
    },
    {
      "id": 3,
      "key": "language",
      "value": "ar",
      "created_at": "2025-01-27T10:00:00.000Z"
    },
    {
      "id": 4,
      "key": "timezone",
      "value": "Asia/Riyadh",
      "created_at": "2025-01-27T10:00:00.000Z"
    }
  ]
}
EOF
fi

echo "✅ JSON Server جاهز للتشغيل"
echo "=========================="
echo "🌐 يمكنك الوصول لقاعدة البيانات على:"
echo "   - http://localhost:3001"
echo "   - http://localhost:3001/users"
echo "   - http://localhost:3001/customers"
echo "   - http://localhost:3001/units"
echo "=========================="
echo "🔑 بيانات الدخول:"
echo "   - المستخدم: admin"
echo "   - كلمة المرور: admin123"
echo "=========================="

# تشغيل JSON Server
echo "🚀 تشغيل JSON Server..."
json-server --watch db.json --port 3001 --host 0.0.0.0