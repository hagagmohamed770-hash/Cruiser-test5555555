# API Documentation - نظام إدارة الاستثمار العقاري

## نظرة عامة

هذا التوثيق يغطي جميع نقاط النهاية (endpoints) في API النظام.

**Base URL**: `http://localhost:3000/api`

## المصادقة

جميع الطلبات (ما عدا تسجيل الدخول) تتطلب header المصادقة:
```
Authorization: Bearer <token>
```

## نقاط النهاية

### 1. المصادقة (Authentication)

#### تسجيل الدخول
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "full_name": "مدير النظام",
      "role": "admin"
    }
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

#### التحقق من التوكن
```http
GET /auth/verify
Authorization: Bearer <token>
```

#### تغيير كلمة المرور
```http
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newpassword123"
}
```

### 2. العملاء (Customers)

#### الحصول على جميع العملاء
```http
GET /customers?search=اسم&status=active&page=1&limit=50
Authorization: Bearer <token>
```

#### الحصول على عميل واحد
```http
GET /customers/:id
Authorization: Bearer <token>
```

#### إنشاء عميل جديد
```http
POST /customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "أحمد محمد",
  "phone": "0501234567",
  "email": "ahmed@example.com",
  "national_id": "1234567890",
  "address": "الرياض، المملكة العربية السعودية",
  "notes": "ملاحظات",
  "status": "active"
}
```

#### تحديث عميل
```http
PUT /customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "أحمد محمد علي",
  "phone": "0501234568"
}
```

#### حذف عميل
```http
DELETE /customers/:id
Authorization: Bearer <token>
```

#### إحصائيات العملاء
```http
GET /customers/stats/summary
Authorization: Bearer <token>
```

### 3. الوحدات (Units)

#### الحصول على جميع الوحدات
```http
GET /units?search=اسم&type=apartment&status=available&page=1&limit=50
Authorization: Bearer <token>
```

#### الحصول على وحدة واحدة
```http
GET /units/:id
Authorization: Bearer <token>
```

#### إنشاء وحدة جديدة
```http
POST /units
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "شقة 101",
  "type": "apartment",
  "area": 120.5,
  "price": 500000,
  "location": "حي النرجس، الرياض",
  "status": "available",
  "notes": "شقة مميزة",
  "partners": [
    {
      "partner_id": 1,
      "share_percentage": 60
    },
    {
      "partner_id": 2,
      "share_percentage": 40
    }
  ]
}
```

#### تحديث وحدة
```http
PUT /units/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "شقة 101 مميزة",
  "price": 550000
}
```

#### حذف وحدة
```http
DELETE /units/:id
Authorization: Bearer <token>
```

#### إحصائيات الوحدات
```http
GET /units/stats/summary
Authorization: Bearer <token>
```

### 4. العقود (Contracts)

#### الحصول على جميع العقود
```http
GET /contracts?search=رقم&type=sale&status=active&page=1&limit=50
Authorization: Bearer <token>
```

#### إنشاء عقد جديد
```http
POST /contracts
Authorization: Bearer <token>
Content-Type: application/json

{
  "contract_number": "CON-2025-001",
  "unit_id": 1,
  "customer_id": 1,
  "contract_type": "sale",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "total_amount": 500000,
  "down_payment": 100000,
  "monthly_payment": 5000,
  "payment_method": "monthly",
  "notes": "عقد بيع"
}
```

#### تحديث عقد
```http
PUT /contracts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "تم إكمال العقد"
}
```

#### حذف عقد
```http
DELETE /contracts/:id
Authorization: Bearer <token>
```

### 5. الأقساط (Installments)

#### الحصول على جميع الأقساط
```http
GET /installments?contract_id=1&status=pending&page=1&limit=50
Authorization: Bearer <token>
```

#### إنشاء أقساط لعقد
```http
POST /installments/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "contract_id": 1,
  "number_of_installments": 12,
  "start_date": "2025-01-01",
  "amount_per_installment": 33333.33
}
```

#### دفع قسط
```http
PUT /installments/:id/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "paid_amount": 33333.33,
  "paid_date": "2025-01-01",
  "notes": "تم الدفع"
}
```

### 6. الشركاء (Partners)

#### الحصول على جميع الشركاء
```http
GET /partners?search=اسم&status=active&page=1&limit=50
Authorization: Bearer <token>
```

#### إنشاء شريك جديد
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "محمد أحمد",
  "phone": "0501234567",
  "email": "mohamed@example.com",
  "national_id": "1234567890",
  "address": "الرياض",
  "share_percentage": 50,
  "notes": "شريك أساسي",
  "status": "active"
}
```

### 7. السماسرة (Brokers)

#### الحصول على جميع السماسرة
```http
GET /brokers?search=اسم&status=active&page=1&limit=50
Authorization: Bearer <token>
```

#### إنشاء سمسار جديد
```http
POST /brokers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "علي محمد",
  "phone": "0501234567",
  "email": "ali@example.com",
  "national_id": "1234567890",
  "commission_rate": 5,
  "notes": "سمسار مميز",
  "status": "active"
}
```

### 8. السندات (Vouchers)

#### الحصول على جميع السندات
```http
GET /vouchers?type=income&status=active&page=1&limit=50
Authorization: Bearer <token>
```

#### إنشاء سند جديد
```http
POST /vouchers
Authorization: Bearer <token>
Content-Type: application/json

{
  "voucher_number": "VOU-2025-001",
  "voucher_type": "income",
  "amount": 50000,
  "description": "دفعة عقد بيع",
  "date": "2025-01-01",
  "related_id": 1,
  "related_type": "contract"
}
```

### 9. الخزينة (Treasury)

#### الحصول على الخزائن
```http
GET /treasury/safes
Authorization: Bearer <token>
```

#### إنشاء خزينة جديدة
```http
POST /treasury/safes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "الخزينة الرئيسية",
  "balance": 100000,
  "currency": "SAR",
  "notes": "الخزينة الأساسية"
}
```

#### تحديث رصيد الخزينة
```http
PUT /treasury/safes/:id/balance
Authorization: Bearer <token>
Content-Type: application/json

{
  "balance": 150000
}
```

#### الحصول على التحويلات
```http
GET /treasury/transfers?from_safe_id=1&to_safe_id=2&page=1&limit=50
Authorization: Bearer <token>
```

#### إنشاء تحويل
```http
POST /treasury/transfers
Authorization: Bearer <token>
Content-Type: application/json

{
  "from_safe_id": 1,
  "to_safe_id": 2,
  "amount": 50000,
  "description": "تحويل بين الخزائن",
  "date": "2025-01-01"
}
```

#### إحصائيات الخزينة
```http
GET /treasury/stats
Authorization: Bearer <token>
```

### 10. التقارير (Reports)

#### تقرير لوحة التحكم
```http
GET /reports/dashboard
Authorization: Bearer <token>
```

#### تقرير المبيعات
```http
GET /reports/sales?start_date=2025-01-01&end_date=2025-12-31
Authorization: Bearer <token>
```

#### تقرير الإيجارات
```http
GET /reports/rentals?start_date=2025-01-01&end_date=2025-12-31
Authorization: Bearer <token>
```

#### تقرير الأقساط
```http
GET /reports/installments?status=pending&customer_id=1
Authorization: Bearer <token>
```

#### تقرير الشركاء
```http
GET /reports/partners
Authorization: Bearer <token>
```

### 11. سجل التغييرات (Audit Log)

#### الحصول على سجل التغييرات
```http
GET /audit?table_name=customers&action=CREATE&page=1&limit=50
Authorization: Bearer <token>
```

#### إحصائيات سجل التغييرات
```http
GET /audit/stats
Authorization: Bearer <token>
```

#### تنظيف السجلات القديمة
```http
DELETE /audit/clean?days=365
Authorization: Bearer <token>
```

### 12. النسخ الاحتياطية (Backups)

#### إنشاء نسخة احتياطية
```http
POST /backup/create
Authorization: Bearer <token>
```

#### قائمة النسخ الاحتياطية
```http
GET /backup/list
Authorization: Bearer <token>
```

#### استعادة نسخة احتياطية
```http
POST /backup/restore
Authorization: Bearer <token>
Content-Type: application/json

{
  "backup_path": "/app/backups/backup-2025-01-01.db"
}
```

#### حذف نسخة احتياطية
```http
DELETE /backup/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "backup_path": "/app/backups/backup-2025-01-01.db"
}
```

### 13. فحص صحة النظام

#### فحص صحة النظام
```http
GET /health
```

**الاستجابة:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "5.0.0",
  "database": "Connected"
}
```

## رموز الحالة (Status Codes)

- `200` - نجح الطلب
- `201` - تم إنشاء المورد بنجاح
- `400` - خطأ في البيانات المرسلة
- `401` - غير مصرح (مشاكل في المصادقة)
- `403` - محظور (مشاكل في الصلاحيات)
- `404` - المورد غير موجود
- `500` - خطأ في الخادم

## تنسيق الاستجابة

جميع الاستجابات تتبع التنسيق التالي:

```json
{
  "success": true,
  "data": {
    // البيانات المطلوبة
  },
  "message": "رسالة توضيحية",
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

## معالجة الأخطاء

في حالة حدوث خطأ:

```json
{
  "success": false,
  "error": "رسالة الخطأ",
  "details": {
    // تفاصيل إضافية للخطأ (في بيئة التطوير)
  }
}
```

## حدود الاستخدام

- **Rate Limiting**: 100 طلب لكل IP كل 15 دقيقة
- **حجم الطلب**: 10MB كحد أقصى
- **الاستعلامات**: 50 عنصر كحد أقصى في الصفحة الواحدة

## أمثلة الاستخدام

### مثال: إنشاء عميل جديد
```javascript
const response = await fetch('/api/customers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'أحمد محمد',
    phone: '0501234567',
    email: 'ahmed@example.com',
    status: 'active'
  })
});

const data = await response.json();
console.log(data);
```

### مثال: الحصول على العملاء مع البحث
```javascript
const params = new URLSearchParams({
  search: 'أحمد',
  status: 'active',
  page: 1,
  limit: 20
});

const response = await fetch(`/api/customers?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data); // قائمة العملاء
console.log(data.pagination); // معلومات الصفحات
```