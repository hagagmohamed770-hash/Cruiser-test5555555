# بنية النظام - نظام إدارة الاستثمار العقاري

هذا المستند يوضح البنية التقنية لنظام إدارة الاستثمار العقاري.

## 📋 جدول المحتويات

- [نظرة عامة على البنية](#نظرة-عامة-على-البنية)
- [الطبقات](#الطبقات)
- [قاعدة البيانات](#قاعدة-البيانات)
- [API](#api)
- [الواجهة الأمامية](#الواجهة-الأمامية)
- [الأمان](#الأمان)
- [النشر](#النشر)
- [التوسع](#التوسع)

## 🏗️ نظرة عامة على البنية

### النمط المعماري

النظام يتبع نمط **Client-Server Architecture** مع **RESTful API**:

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│                 │ ◄──────────────► │                 │
│   Frontend      │                  │   Backend       │
│   (Browser)     │                  │   (Node.js)     │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │                 │
                                     │   SQLite DB     │
                                     │                 │
                                     └─────────────────┘
```

### المكونات الرئيسية

1. **الواجهة الأمامية**: HTML, CSS, JavaScript
2. **الخادم**: Node.js + Express.js
3. **قاعدة البيانات**: SQLite
4. **المصادقة**: JWT
5. **الأمان**: Helmet, CORS, Rate Limiting

## 🎯 الطبقات

### طبقة العرض (Presentation Layer)

#### الواجهة الأمامية
```javascript
// هيكل الواجهة الأمامية
public/
├── index.html          // الصفحة الرئيسية
├── style.css           // التصميم
├── app.js              // المنطق الرئيسي
└── assets/             // الملفات الثابتة
    ├── images/
    └── fonts/
```

#### الميزات
- **Responsive Design**: متوافق مع جميع الأجهزة
- **Dark/Light Theme**: دعم الوضع الداكن والفاتح
- **RTL Support**: دعم اللغة العربية
- **HTMX Integration**: تفاعل سلس دون إعادة تحميل

### طبقة التطبيق (Application Layer)

#### الخادم
```javascript
// هيكل الخادم
server.js              // نقطة البداية
├── routes/            // مسارات API
│   ├── auth.js        // المصادقة
│   ├── customers.js   // العملاء
│   ├── units.js       // الوحدات
│   ├── contracts.js   // العقود
│   ├── installments.js // الأقساط
│   ├── partners.js    // الشركاء
│   ├── brokers.js     // السماسرة
│   ├── vouchers.js    // الإيصالات
│   ├── treasury.js    // الخزينة
│   ├── reports.js     // التقارير
│   ├── backup.js      // النسخ الاحتياطية
│   └── audit.js       // سجل التغييرات
├── database/          // قاعدة البيانات
│   └── database.js    // إدارة قاعدة البيانات
└── utils/             // الأدوات المساعدة
    └── audit.js       // سجل التغييرات
```

#### الميزات
- **RESTful API**: واجهة برمجة تطبيقات قياسية
- **Middleware**: معالجة الطلبات
- **Error Handling**: معالجة شاملة للأخطاء
- **Validation**: التحقق من صحة البيانات

### طبقة البيانات (Data Layer)

#### قاعدة البيانات
```sql
-- هيكل قاعدة البيانات
customers          -- العملاء
units              -- الوحدات العقارية
contracts          -- العقود
installments       -- الأقساط
partners           -- الشركاء
brokers            -- السماسرة
vouchers           -- الإيصالات
safes              -- الخزائن
transfers          -- التحويلات
partner_debts      -- ديون الشركاء
broker_dues        -- مستحقات السماسرة
audit_log          -- سجل التغييرات
users              -- المستخدمين
settings           -- إعدادات النظام
```

#### الميزات
- **ACID Compliance**: ضمان سلامة البيانات
- **Indexing**: فهارس محسنة للأداء
- **Relationships**: علاقات واضحة بين الجداول
- **Backup System**: نظام نسخ احتياطية

## 🗄️ قاعدة البيانات

### تصميم قاعدة البيانات

#### مخطط العلاقات

```mermaid
erDiagram
    CUSTOMERS ||--o{ CONTRACTS : has
    UNITS ||--o{ CONTRACTS : has
    CONTRACTS ||--o{ INSTALLMENTS : generates
    PARTNERS ||--o{ PARTNER_DEBTS : has
    BROKERS ||--o{ BROKER_DUES : has
    SAFES ||--o{ VOUCHERS : contains
    SAFES ||--o{ TRANSFERS : from/to
    USERS ||--o{ AUDIT_LOG : creates
```

#### الجداول الرئيسية

##### جدول العملاء (customers)
```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    id_number TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

##### جدول الوحدات (units)
```sql
CREATE TABLE units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    area REAL,
    price REAL NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'available',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

##### جدول العقود (contracts)
```sql
CREATE TABLE contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    total_amount REAL NOT NULL,
    down_payment REAL DEFAULT 0,
    installment_amount REAL,
    installment_count INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (unit_id) REFERENCES units (id)
);
```

### تحسين الأداء

#### الفهارس
```sql
-- فهارس أساسية
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_units_type ON units(type);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX idx_contracts_unit_id ON contracts(unit_id);
CREATE INDEX idx_installments_due_date ON installments(due_date);
```

#### الإعدادات
```sql
-- إعدادات محسنة
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

## 🔌 API

### تصميم API

#### RESTful Endpoints

```javascript
// المصادقة
POST   /api/auth/login          // تسجيل الدخول
GET    /api/auth/verify         // التحقق من التوكن
POST   /api/auth/change-password // تغيير كلمة المرور

// العملاء
GET    /api/customers           // قائمة العملاء
GET    /api/customers/:id       // عميل محدد
POST   /api/customers           // إضافة عميل
PUT    /api/customers/:id       // تحديث عميل
DELETE /api/customers/:id       // حذف عميل
GET    /api/customers/stats     // إحصائيات العملاء

// الوحدات
GET    /api/units               // قائمة الوحدات
GET    /api/units/:id           // وحدة محددة
POST   /api/units               // إضافة وحدة
PUT    /api/units/:id           // تحديث وحدة
DELETE /api/units/:id           // حذف وحدة
GET    /api/units/stats         // إحصائيات الوحدات

// العقود
GET    /api/contracts           // قائمة العقود
GET    /api/contracts/:id       // عقد محدد
POST   /api/contracts           // إضافة عقد
PUT    /api/contracts/:id       // تحديث عقد
DELETE /api/contracts/:id       // حذف عقد

// الأقساط
GET    /api/installments        // قائمة الأقساط
POST   /api/installments/generate // إنشاء أقساط
PUT    /api/installments/:id/pay // دفع قسط

// التقارير
GET    /api/reports/dashboard           // لوحة التحكم
GET    /api/reports/sales               // تقرير المبيعات
GET    /api/reports/rentals             // تقرير الإيجارات
GET    /api/reports/overdue-installments // الأقساط المتأخرة
GET    /api/reports/partners            // تقرير الشركاء
```

#### استجابة API

```javascript
// استجابة نجاح
{
  "success": true,
  "data": {
    // البيانات المطلوبة
  },
  "message": "تمت العملية بنجاح"
}

// استجابة خطأ
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "رسالة الخطأ",
  "details": {
    // تفاصيل إضافية
  }
}
```

### معالجة الطلبات

#### Middleware Stack

```javascript
// ترتيب Middleware
app.use(helmet());                    // الأمان
app.use(cors());                      // CORS
app.use(compression());               // ضغط البيانات
app.use(express.json());              // تحليل JSON
app.use(express.urlencoded());        // تحليل البيانات
app.use(rateLimit());                 // تحديد معدل الطلبات
app.use(express.static('public'));    // الملفات الثابتة

// مسارات API
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/units', unitRoutes);
// ... باقي المسارات
```

#### معالجة الأخطاء

```javascript
// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'خطأ داخلي في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// معالجة المسارات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'المسار غير موجود'
  });
});
```

## 🎨 الواجهة الأمامية

### هيكل الواجهة

#### الصفحة الرئيسية
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نظام إدارة الاستثمار العقاري</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <!-- الشريط الجانبي -->
  <aside class="sidebar">
    <!-- قائمة التنقل -->
  </aside>
  
  <!-- المحتوى الرئيسي -->
  <main class="main-content">
    <!-- الشريط العلوي -->
    <header class="top-bar">
      <!-- معلومات المستخدم والإعدادات -->
    </header>
    
    <!-- منطقة المحتوى -->
    <div class="content-area">
      <!-- محتوى الصفحة -->
    </div>
  </main>
  
  <!-- النوافذ المنبثقة -->
  <div class="modals">
    <!-- نوافذ إضافة/تعديل -->
  </div>
  
  <script src="/app.js"></script>
</body>
</html>
```

#### التصميم
```css
/* متغيرات CSS */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #059669;
  --danger-color: #dc2626;
  --warning-color: #d97706;
  --info-color: #0891b2;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  
  --border-radius: 0.5rem;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* الوضع الداكن */
[data-theme="dark"] {
  --bg-primary: #1e293b;
  --bg-secondary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
}
```

### التفاعل

#### إدارة الحالة
```javascript
// إدارة حالة التطبيق
class AppState {
  constructor() {
    this.state = {
      user: null,
      theme: 'light',
      currentPage: 'dashboard',
      loading: false,
      notifications: []
    };
    this.listeners = [];
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

const appState = new AppState();
```

#### إدارة API
```javascript
// إدارة طلبات API
class ApiManager {
  constructor() {
    this.baseUrl = '/api';
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'خطأ في الطلب');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

const api = new ApiManager();
```

## 🔒 الأمان

### طبقات الأمان

#### 1. المصادقة والتفويض
```javascript
// JWT Authentication
const jwt = require('jsonwebtoken');

// إنشاء توكن
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// التحقق من التوكن
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('توكن غير صالح');
  }
}

// Middleware للمصادقة
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'NO_TOKEN',
      message: 'توكن مطلوب'
    });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'توكن غير صالح'
    });
  }
}
```

#### 2. حماية البيانات
```javascript
// تشفير كلمات المرور
const bcrypt = require('bcryptjs');

// تشفير كلمة المرور
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// التحقق من كلمة المرور
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// تنظيف البيانات
function sanitizeInput(input) {
  return input
    .replace(/[<>]/g, '')
    .trim();
}
```

#### 3. حماية من الهجمات
```javascript
// Helmet.js للأمان
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'تم تجاوز حد الطلبات'
  }
});

app.use('/api/', limiter);
```

### سجل التغييرات
```javascript
// سجل التغييرات
async function logAudit(userId, action, details) {
  const query = `
    INSERT INTO audit_log (user_id, action, details, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  await db.run(query, [
    userId,
    action,
    JSON.stringify(details),
    req.ip,
    req.get('User-Agent')
  ]);
}

// استخدام سجل التغييرات
app.post('/api/customers', authenticateToken, async (req, res) => {
  try {
    // إضافة العميل
    const result = await addCustomer(req.body);
    
    // تسجيل العملية
    await logAudit(req.user.id, 'CREATE_CUSTOMER', {
      customerId: result.id,
      customerName: req.body.name
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

## 🚀 النشر

### بيئات النشر

#### التطوير
```bash
# بيئة التطوير
NODE_ENV=development
PORT=3000
JWT_SECRET=dev_secret_key
DB_PATH=./data/development.db
```

#### الإنتاج
```bash
# بيئة الإنتاج
NODE_ENV=production
PORT=3000
JWT_SECRET=production_secret_key
DB_PATH=./data/production.db
BACKUP_AUTO=true
BACKUP_INTERVAL=24h
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p data backups

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  real-estate-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./data:/app/data
      - ./backups:/app/backups
    restart: unless-stopped
```

### PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'real-estate-system',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## 📈 التوسع

### استراتيجيات التوسع

#### التوسع الأفقي (Horizontal Scaling)
```javascript
// Load Balancer
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // إنشاء عمال
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // إعادة إنشاء العامل
  });
} else {
  // كود العامل
  require('./server.js');
  console.log(`Worker ${process.pid} started`);
}
```

#### التوسع العمودي (Vertical Scaling)
```javascript
// تحسين الأداء
const v8 = require('v8');

// زيادة حد الذاكرة
v8.setFlagsFromString('--max-old-space-size=4096');

// مراقبة الأداء
setInterval(() => {
  const stats = v8.getHeapStatistics();
  console.log('Memory usage:', {
    used: Math.round(stats.used_heap_size / 1024 / 1024) + 'MB',
    total: Math.round(stats.total_heap_size / 1024 / 1024) + 'MB'
  });
}, 60000);
```

### قاعدة البيانات الموزعة

#### إعداد قاعدة البيانات الموزعة
```javascript
// إعداد قاعدة بيانات قراءة منفصلة
const readDb = new sqlite3.Database('./data/read.db');
const writeDb = new sqlite3.Database('./data/write.db');

// توجيه الطلبات
function routeQuery(sql, params = []) {
  const isReadQuery = /^SELECT/i.test(sql.trim());
  const db = isReadQuery ? readDb : writeDb;
  
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
```

### التخزين المؤقت

#### Redis Cache
```javascript
const redis = require('redis');
const client = redis.createClient();

// تخزين مؤقت للبيانات
async function getCachedData(key) {
  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

async function setCachedData(key, data, ttl = 3600) {
  await client.setex(key, ttl, JSON.stringify(data));
}

// استخدام التخزين المؤقت
app.get('/api/customers', async (req, res) => {
  const cacheKey = `customers:${req.query.page || 1}`;
  
  // محاولة الحصول من التخزين المؤقت
  let data = await getCachedData(cacheKey);
  
  if (!data) {
    // الحصول من قاعدة البيانات
    data = await getCustomers(req.query);
    // حفظ في التخزين المؤقت
    await setCachedData(cacheKey, data);
  }
  
  res.json({ success: true, data });
});
```

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0.0