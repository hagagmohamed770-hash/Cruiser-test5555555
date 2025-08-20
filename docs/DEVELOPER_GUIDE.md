# دليل المطور - نظام إدارة الاستثمار العقاري

## 📋 جدول المحتويات

- [نظرة عامة على النظام](#نظرة-عامة-على-النظام)
- [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
- [بنية المشروع](#بنية-المشروع)
- [قاعدة البيانات](#قاعدة-البيانات)
- [API Reference](#api-reference)
- [إضافة ميزات جديدة](#إضافة-ميزات-جديدة)
- [الاختبارات](#الاختبارات)
- [النشر والإنتاج](#النشر-والإنتاج)
- [أفضل الممارسات](#أفضل-الممارسات)

## 🎯 نظرة عامة على النظام

### التقنيات المستخدمة

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: JWT, bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Documentation**: JSDoc, Markdown

### البنية المعمارية

```
┌─────────────────────────────────────┐
│           Frontend (HTML/CSS/JS)    │
├─────────────────────────────────────┤
│           Express.js Server         │
├─────────────────────────────────────┤
│           SQLite Database           │
└─────────────────────────────────────┘
```

### الميزات الرئيسية

- **إدارة العملاء**: CRUD operations للعملاء
- **إدارة الوحدات**: إدارة الوحدات العقارية
- **إدارة العقود**: عقود البيع والإيجار
- **إدارة الأقساط**: نظام الأقساط والمدفوعات
- **إدارة الشركاء**: إدارة الشركاء وأرباحهم
- **إدارة الوسطاء**: إدارة الوسطاء وعمولاتهم
- **إدارة الخزينة**: إدارة الخزائن والتحويلات
- **التقارير**: تقارير مالية وإدارية
- **النسخ الاحتياطية**: نظام نسخ احتياطية متقدم
- **سجل التغييرات**: تتبع جميع العمليات

## 🔧 إعداد بيئة التطوير

### المتطلبات الأساسية

```bash
# Node.js 16.0.0 أو أحدث
node --version

# npm 8.0.0 أو أحدث
npm --version

# Git
git --version
```

### تثبيت المشروع

```bash
# استنساخ المشروع
git clone https://github.com/your-repo/real-estate-management-system.git
cd real-estate-management-system

# تثبيت التبعيات
npm install

# إعداد قاعدة البيانات
npm run init-db

# تشغيل في وضع التطوير
npm run dev
```

### متغيرات البيئة

أنشئ ملف `.env` في المجلد الجذر:

```env
# إعدادات الخادم
NODE_ENV=development
PORT=3000

# إعدادات قاعدة البيانات
DB_PATH=./data/real_estate.db

# إعدادات الأمان
JWT_SECRET=your-super-secret-jwt-key-here

# إعدادات النسخ الاحتياطية
BACKUP_DIR=./backups
BACKUP_AUTO=true
BACKUP_INTERVAL=24h

# إعدادات الشركة
COMPANY_NAME=شركة الاستثمار العقاري
COMPANY_EMAIL=info@company.com
COMPANY_PHONE=0123456789
```

### أدوات التطوير

```bash
# تثبيت أدوات التطوير
npm install --save-dev nodemon eslint prettier

# تشغيل مع إعادة التحميل التلقائي
npm run dev

# فحص الكود
npm run lint

# تنسيق الكود
npm run format
```

## 📁 بنية المشروع

```
real-estate-management-system/
├── server.js                 # نقطة البداية للخادم
├── package.json              # تبعيات المشروع
├── .env.example              # مثال لمتغيرات البيئة
├── .gitignore               # ملفات Git المهملة
├── start.sh                 # سكريبت التشغيل السريع
├── Dockerfile               # تكوين Docker
├── docker-compose.yml       # تكوين Docker Compose
├── database/
│   └── database.js          # إدارة قاعدة البيانات
├── routes/
│   ├── auth.js              # مسارات المصادقة
│   ├── customers.js         # مسارات العملاء
│   ├── units.js             # مسارات الوحدات
│   ├── contracts.js         # مسارات العقود
│   ├── installments.js      # مسارات الأقساط
│   ├── partners.js          # مسارات الشركاء
│   ├── brokers.js           # مسارات الوسطاء
│   ├── vouchers.js          # مسارات القيود المالية
│   ├── treasury.js          # مسارات الخزينة
│   ├── reports.js           # مسارات التقارير
│   ├── backup.js            # مسارات النسخ الاحتياطية
│   └── audit.js             # مسارات سجل التغييرات
├── utils/
│   └── audit.js             # وظائف سجل التغييرات
├── public/
│   ├── index.html           # الصفحة الرئيسية
│   ├── style.css            # ملفات CSS
│   └── app.js               # ملفات JavaScript
├── data/                    # قاعدة البيانات
├── backups/                 # النسخ الاحتياطية
└── docs/                    # التوثيق
```

## 🗄️ قاعدة البيانات

### مخطط قاعدة البيانات

```sql
-- جدول العملاء
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول الوحدات
CREATE TABLE units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('apartment', 'villa', 'office', 'shop')),
  area REAL NOT NULL,
  price REAL NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول العقود
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  unit_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'rent')),
  total_amount REAL NOT NULL,
  down_payment REAL DEFAULT 0,
  installment_amount REAL,
  installment_count INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers (id),
  FOREIGN KEY (unit_id) REFERENCES units (id)
);

-- جدول الأقساط
CREATE TABLE installments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

-- جدول الشركاء
CREATE TABLE partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  share_percentage REAL NOT NULL,
  capital REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول الوسطاء
CREATE TABLE brokers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  commission_rate REAL DEFAULT 0,
  license_number TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول القيود المالية
CREATE TABLE vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  safe_id INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (safe_id) REFERENCES safes (id)
);

-- جدول الخزائن
CREATE TABLE safes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  balance REAL DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول التحويلات
CREATE TABLE transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_safe_id INTEGER NOT NULL,
  to_safe_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_safe_id) REFERENCES safes (id),
  FOREIGN KEY (to_safe_id) REFERENCES safes (id)
);

-- جدول سجل التغييرات
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id INTEGER,
  data TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- جدول المستخدمين
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول الإعدادات
CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### الفهارس

```sql
-- فهارس أساسية للأداء
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

CREATE INDEX IF NOT EXISTS idx_units_type ON units(type);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_units_price ON units(price);

CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_unit_id ON contracts(unit_id);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON contracts(start_date);

CREATE INDEX IF NOT EXISTS idx_installments_contract_id ON installments(contract_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);

CREATE INDEX IF NOT EXISTS idx_vouchers_type ON vouchers(type);
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date);
CREATE INDEX IF NOT EXISTS idx_vouchers_safe_id ON vouchers(safe_id);

-- فهارس مركبة
CREATE INDEX IF NOT EXISTS idx_contracts_customer_type ON contracts(customer_id, type);
CREATE INDEX IF NOT EXISTS idx_contracts_unit_status ON contracts(unit_id, status);
```

## 🔌 API Reference

### المصادقة

#### تسجيل الدخول
```http
POST /api/auth/login
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### التحقق من التوكن
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### العملاء

#### جلب جميع العملاء
```http
GET /api/customers?page=1&limit=20&search=أحمد
Authorization: Bearer <token>
```

#### إنشاء عميل جديد
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "أحمد محمد",
  "phone": "0123456789",
  "email": "ahmed@example.com",
  "address": "شارع الرئيسي"
}
```

#### تحديث عميل
```http
PUT /api/customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "أحمد محمد علي",
  "phone": "0987654321"
}
```

#### حذف عميل
```http
DELETE /api/customers/:id
Authorization: Bearer <token>
```

### الوحدات

#### جلب جميع الوحدات
```http
GET /api/units?type=apartment&status=available
Authorization: Bearer <token>
```

#### إنشاء وحدة جديدة
```http
POST /api/units
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "شقة 101",
  "type": "apartment",
  "area": 120,
  "price": 500000,
  "location": "الطابق الأول"
}
```

### العقود

#### جلب جميع العقود
```http
GET /api/contracts?type=sale&status=active
Authorization: Bearer <token>
```

#### إنشاء عقد جديد
```http
POST /api/contracts
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "unit_id": 1,
  "type": "sale",
  "total_amount": 500000,
  "down_payment": 100000,
  "installment_amount": 20000,
  "installment_count": 20,
  "start_date": "2025-01-01"
}
```

### الأقساط

#### جلب جميع الأقساط
```http
GET /api/installments?contract_id=1&status=pending
Authorization: Bearer <token>
```

#### إنشاء أقساط للعقد
```http
POST /api/installments/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "contract_id": 1
}
```

#### دفع قسط
```http
PUT /api/installments/:id/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_date": "2025-01-15",
  "payment_method": "cash"
}
```

### التقارير

#### تقرير لوحة التحكم
```http
GET /api/reports/dashboard
Authorization: Bearer <token>
```

#### تقرير المبيعات
```http
GET /api/reports/sales?year=2025&month=1
Authorization: Bearer <token>
```

#### تقرير الأقساط المتأخرة
```http
GET /api/reports/overdue-installments
Authorization: Bearer <token>
```

### النسخ الاحتياطية

#### إنشاء نسخة احتياطية
```http
POST /api/backup
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "نسخة احتياطية يومية"
}
```

#### جلب النسخ الاحتياطية
```http
GET /api/backup
Authorization: Bearer <token>
```

#### استعادة نسخة احتياطية
```http
POST /api/backup/:id/restore
Authorization: Bearer <token>
```

## 🚀 إضافة ميزات جديدة

### إضافة مسار جديد

1. أنشئ ملف جديد في مجلد `routes/`
2. اتبع النمط الموجود:

```javascript
const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { authenticateToken } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

// جلب جميع العناصر
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM your_table';
    let params = [];
    
    if (search) {
      query += ' WHERE name LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const items = await db.all(query, params);
    const countResult = await db.get('SELECT COUNT(*) as total FROM your_table');
    
    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('خطأ في جلب البيانات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// إنشاء عنصر جديد
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'الاسم مطلوب'
      });
    }
    
    const result = await db.run(
      'INSERT INTO your_table (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    const newItem = await db.get('SELECT * FROM your_table WHERE id = ?', [result.lastID]);
    
    // تسجيل العملية
    await logAudit('create', 'your_table', result.lastID, req.body);
    
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'تم إنشاء العنصر بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء العنصر:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;
```

3. أضف المسار في `server.js`:

```javascript
const yourRoutes = require('./routes/your-routes');
app.use('/api/your-endpoint', yourRoutes);
```

### إضافة جدول جديد

1. أضف الجدول في `database/database.js`:

```javascript
// إنشاء جدول جديد
await db.run(`
  CREATE TABLE IF NOT EXISTS your_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// إنشاء فهارس
await db.run('CREATE INDEX IF NOT EXISTS idx_your_table_name ON your_table(name)');
await db.run('CREATE INDEX IF NOT EXISTS idx_your_table_status ON your_table(status)');
```

### إضافة واجهة مستخدم

1. أضف الرابط في `public/index.html`:

```html
<a href="#your-page" class="nav-link" data-page="your-page">
  <span class="icon">📄</span>
  <span class="text">صفحتك الجديدة</span>
</a>
```

2. أضف المحتوى:

```html
<div id="your-page" class="page">
  <div class="page-header">
    <h1>عنوان الصفحة</h1>
    <button class="btn btn-primary add-btn">إضافة جديد</button>
  </div>
  
  <div class="page-content">
    <div class="filters">
      <input type="text" class="search-input" placeholder="بحث...">
      <select class="status-filter">
        <option value="">جميع الحالات</option>
        <option value="active">نشط</option>
        <option value="inactive">غير نشط</option>
      </select>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الوصف</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody id="your-table-body">
          <!-- البيانات ستُحمل هنا -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

3. أضف الوظائف في `public/app.js`:

```javascript
// تحميل البيانات
const loadYourData = async () => {
  try {
    showLoading();
    
    const response = await fetch('/api/your-endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      renderYourTable(data.data.items);
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('خطأ في تحميل البيانات');
  } finally {
    hideLoading();
  }
};

// عرض البيانات في الجدول
const renderYourTable = (items) => {
  const tbody = document.getElementById('your-table-body');
  tbody.innerHTML = '';
  
  items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.description || '-'}</td>
      <td><span class="status-badge ${item.status}">${getStatusName(item.status)}</span></td>
      <td>${formatDate(item.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-id="${item.id}">تعديل</button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">حذف</button>
      </td>
    `;
    tbody.appendChild(row);
  });
};
```

## 🧪 الاختبارات

### إعداد الاختبارات

```bash
# تثبيت أدوات الاختبار
npm install --save-dev jest supertest

# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm run test:coverage
```

### كتابة اختبارات

```javascript
// tests/your-feature.test.js
const request = require('supertest');
const app = require('../server');

describe('Your Feature', () => {
  let authToken;

  beforeAll(async () => {
    // تسجيل دخول للحصول على توكن
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /api/your-endpoint', () => {
    it('should return list of items', async () => {
      const response = await request(app)
        .get('/api/your-endpoint')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/your-endpoint', () => {
    it('should create new item', async () => {
      const itemData = {
        name: 'عنصر تجريبي',
        description: 'وصف تجريبي'
      };

      const response = await request(app)
        .post('/api/your-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(itemData.name);
    });
  });
});
```

## 🚀 النشر والإنتاج

### إعداد الإنتاج

1. أنشئ ملف `.env` للإنتاج:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-production-key
DB_PATH=/app/data/real_estate.db
BACKUP_DIR=/app/backups
```

2. استخدم PM2 لإدارة العملية:

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل التطبيق
pm2 start server.js --name "real-estate-system"

# مراقبة التطبيق
pm2 monit

# إعادة تشغيل التطبيق
pm2 restart real-estate-system
```

### استخدام Docker

```bash
# بناء الصورة
docker build -t real-estate-system .

# تشغيل الحاوية
docker run -d \
  --name real-estate-app \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/backups:/app/backups \
  -e JWT_SECRET=your-secret \
  real-estate-system
```

### استخدام Docker Compose

```bash
# تشغيل النظام
docker-compose up -d

# مراقبة السجلات
docker-compose logs -f

# إيقاف النظام
docker-compose down
```

## 📈 أفضل الممارسات

### أمان الكود

1. **تحقق من المدخلات**:
```javascript
const validateInput = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('الاسم يجب أن يكون على الأقل حرفين');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }
  
  return errors;
};
```

2. **استخدم معاملات SQL**:
```javascript
// ✅ صحيح
await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);

// ❌ خطأ
await db.run(`INSERT INTO users (name, email) VALUES ('${name}', '${email}')`);
```

3. **تشفير كلمات المرور**:
```javascript
const bcrypt = require('bcryptjs');

// تشفير كلمة المرور
const hashedPassword = await bcrypt.hash(password, 10);

// التحقق من كلمة المرور
const isValid = await bcrypt.compare(password, hashedPassword);
```

### أداء الكود

1. **استخدم الفهارس**:
```sql
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
```

2. **تجنب N+1 queries**:
```javascript
// ✅ صحيح - استعلام واحد
const customers = await db.all(`
  SELECT c.*, COUNT(ct.id) as contracts_count
  FROM customers c
  LEFT JOIN contracts ct ON c.id = ct.customer_id
  GROUP BY c.id
`);

// ❌ خطأ - N+1 queries
const customers = await db.all('SELECT * FROM customers');
for (const customer of customers) {
  const contracts = await db.all('SELECT * FROM contracts WHERE customer_id = ?', [customer.id]);
  customer.contracts = contracts;
}
```

3. **استخدم التخزين المؤقت**:
```javascript
const cache = new Map();

const getCustomerById = async (id) => {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
  cache.set(id, customer);
  return customer;
};
```

### قابلية الصيانة

1. **استخدم أسماء وصفية**:
```javascript
// ✅ صحيح
const calculateTotalPrice = (price, discount) => {
  return price * (1 - discount / 100);
};

// ❌ خطأ
const calc = (p, d) => p * (1 - d / 100);
```

2. **اكتب تعليقات واضحة**:
```javascript
/**
 * حساب السعر النهائي مع الخصم
 * @param {number} price - السعر الأساسي
 * @param {number} discount - نسبة الخصم (0-100)
 * @returns {number} السعر النهائي
 */
const calculateFinalPrice = (price, discount = 0) => {
  // التحقق من صحة المدخلات
  if (price < 0) {
    throw new Error('السعر يجب أن يكون موجباً');
  }
  
  // حساب السعر بعد الخصم
  return price * (1 - discount / 100);
};
```

3. **استخدم معالجة الأخطاء**:
```javascript
const createCustomer = async (customerData) => {
  try {
    // التحقق من صحة البيانات
    const errors = validateCustomerData(customerData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    // إدخال البيانات
    const result = await db.run(
      'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
      [customerData.name, customerData.phone, customerData.email]
    );
    
    return {
      success: true,
      data: { id: result.lastID, ...customerData }
    };
  } catch (error) {
    console.error('خطأ في إنشاء العميل:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

### التوثيق

1. **اكتب README واضح**:
```markdown
# اسم المشروع

وصف مختصر للمشروع.

## التثبيت

```bash
npm install
npm run init-db
npm start
```

## الاستخدام

وصف كيفية استخدام المشروع.

## المساهمة

كيفية المساهمة في المشروع.
```

2. **وثق API**:
```javascript
/**
 * @api {post} /api/customers إنشاء عميل جديد
 * @apiName CreateCustomer
 * @apiGroup Customers
 * @apiVersion 1.0.0
 *
 * @apiParam {String} name اسم العميل
 * @apiParam {String} phone رقم الهاتف
 * @apiParam {String} [email] البريد الإلكتروني
 *
 * @apiSuccess {Boolean} success نجاح العملية
 * @apiSuccess {Object} data بيانات العميل المُنشأ
 */
```

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0.0