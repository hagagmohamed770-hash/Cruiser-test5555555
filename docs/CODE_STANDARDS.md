# معايير الكود - نظام إدارة الاستثمار العقاري

هذا الدليل يحدد معايير كتابة الكود والاتفاقيات المستخدمة في المشروع.

## 📋 جدول المحتويات

- [المبادئ العامة](#المبادئ-العامة)
- [معايير JavaScript](#معايير-javascript)
- [معايير SQL](#معايير-sql)
- [معايير HTML/CSS](#معايير-htmlcss)
- [معايير التعليقات](#معايير-التعليقات)
- [معايير الأمان](#معايير-الأمان)
- [معايير الأداء](#معايير-الأداء)
- [أدوات التحقق](#أدوات-التحقق)

## 🎯 المبادئ العامة

### 1. قابلية القراءة
- اكتب كود واضح ومفهوم
- استخدم أسماء وصفية للمتغيرات والدوال
- اتبع مبدأ "الكود يقرأ نفسه"

### 2. قابلية الصيانة
- اكتب كود قابل للتعديل والتوسع
- تجنب التكرار (DRY - Don't Repeat Yourself)
- استخدم التجزئة المنطقية

### 3. قابلية الاختبار
- اكتب كود قابل للاختبار
- استخدم Dependency Injection
- اجعل الدوال نقية قدر الإمكان

### 4. الأداء
- اكتب كود فعال
- تجنب العمليات المكلفة
- استخدم التخزين المؤقت عند الحاجة

## 🔧 معايير JavaScript

### تسمية المتغيرات والدوال

#### ✅ أسماء جيدة
```javascript
// متغيرات
const customerName = 'أحمد محمد';
const totalAmount = 500000;
const isActive = true;
const customerList = [];

// دوال
const calculateTotalPrice = (price, discount) => {
  return price * (1 - discount / 100);
};

const validateCustomerData = (customer) => {
  // التحقق من صحة البيانات
};

const getCustomerById = async (id) => {
  // جلب العميل من قاعدة البيانات
};

// ثوابت
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 20;
const API_BASE_URL = 'http://localhost:3000/api';
```

#### ❌ أسماء سيئة
```javascript
// تجنب
const x = 'أحمد';
const data = [];
const fn = () => {};
const temp = 500000;
const flag = true;
```

### هيكل الدوال

#### ✅ دالة جيدة
```javascript
/**
 * حساب السعر الإجمالي مع الخصم
 * @param {number} price - السعر الأساسي
 * @param {number} discount - نسبة الخصم (0-100)
 * @param {number} tax - نسبة الضريبة (0-100)
 * @returns {number} السعر النهائي
 */
const calculateFinalPrice = (price, discount = 0, tax = 0) => {
  try {
    // التحقق من صحة المدخلات
    if (price < 0) {
      throw new Error('السعر يجب أن يكون موجباً');
    }
    
    if (discount < 0 || discount > 100) {
      throw new Error('نسبة الخصم يجب أن تكون بين 0 و 100');
    }
    
    if (tax < 0 || tax > 100) {
      throw new Error('نسبة الضريبة يجب أن تكون بين 0 و 100');
    }
    
    // حساب السعر بعد الخصم
    const priceAfterDiscount = price * (1 - discount / 100);
    
    // إضافة الضريبة
    const finalPrice = priceAfterDiscount * (1 + tax / 100);
    
    // تقريب إلى رقمين عشريين
    return Math.round(finalPrice * 100) / 100;
  } catch (error) {
    console.error('خطأ في حساب السعر النهائي:', error);
    throw error;
  }
};
```

#### ❌ دالة سيئة
```javascript
// تجنب
function calc(x, y, z) {
  return x * (1 - y / 100) * (1 + z / 100);
}
```

### معالجة الأخطاء

#### ✅ معالجة أخطاء جيدة
```javascript
const createCustomer = async (customerData) => {
  try {
    // التحقق من صحة البيانات
    if (!customerData.name || customerData.name.trim().length === 0) {
      throw new Error('اسم العميل مطلوب');
    }
    
    if (!customerData.phone || !/^\d{10,11}$/.test(customerData.phone)) {
      throw new Error('رقم الهاتف غير صحيح');
    }
    
    // إدخال العميل في قاعدة البيانات
    const result = await db.run(
      'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [customerData.name, customerData.phone, customerData.email, customerData.address]
    );
    
    // جلب العميل المُنشأ
    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
    
    // تسجيل العملية في سجل التغييرات
    await logAudit('create', 'customers', result.lastID, customerData);
    
    return {
      success: true,
      data: newCustomer,
      message: 'تم إنشاء العميل بنجاح'
    };
  } catch (error) {
    console.error('خطأ في إنشاء العميل:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'فشل في إنشاء العميل'
    };
  }
};
```

#### ❌ معالجة أخطاء سيئة
```javascript
// تجنب
const createCustomer = async (data) => {
  const result = await db.run('INSERT INTO customers VALUES (?, ?, ?)', [data.name, data.phone, data.email]);
  return result;
};
```

### استخدام async/await

#### ✅ استخدام صحيح
```javascript
const loadCustomerData = async (customerId) => {
  try {
    // جلب بيانات العميل
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);
    
    if (!customer) {
      throw new Error('العميل غير موجود');
    }
    
    // جلب عقود العميل
    const contracts = await db.all(
      'SELECT * FROM contracts WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    );
    
    // جلب أقساط العميل
    const installments = await db.all(
      'SELECT * FROM installments WHERE contract_id IN (SELECT id FROM contracts WHERE customer_id = ?)',
      [customerId]
    );
    
    return {
      customer,
      contracts,
      installments
    };
  } catch (error) {
    console.error('خطأ في تحميل بيانات العميل:', error);
    throw error;
  }
};
```

#### ❌ استخدام سيء
```javascript
// تجنب
const loadCustomerData = (customerId) => {
  return db.get('SELECT * FROM customers WHERE id = ?', [customerId])
    .then(customer => {
      return db.all('SELECT * FROM contracts WHERE customer_id = ?', [customerId])
        .then(contracts => {
          return { customer, contracts };
        });
    })
    .catch(error => {
      console.error(error);
    });
};
```

### استخدام ES6+ Features

#### ✅ استخدام حديث
```javascript
// Destructuring
const { name, phone, email } = customerData;
const [firstCustomer, secondCustomer, ...otherCustomers] = customers;

// Spread Operator
const updatedCustomer = { ...customer, phone: newPhone };
const allCustomers = [...existingCustomers, newCustomer];

// Arrow Functions
const customers = customerList.filter(customer => customer.isActive);
const totalAmount = installments.reduce((sum, installment) => sum + installment.amount, 0);

// Template Literals
const message = `تم إنشاء العميل ${customer.name} بنجاح. رقم العميل: ${customer.id}`;

// Optional Chaining
const customerPhone = customer?.contact?.phone || 'غير محدد';

// Nullish Coalescing
const discount = customer.discount ?? 0;
```

## 🗄️ معايير SQL

### تسمية الجداول والأعمدة

#### ✅ أسماء جيدة
```sql
-- جداول
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
```

#### ❌ أسماء سيئة
```sql
-- تجنب
CREATE TABLE tbl (
  id INTEGER PRIMARY KEY,
  n TEXT,
  p TEXT,
  e TEXT
);
```

### كتابة الاستعلامات

#### ✅ استعلامات جيدة
```sql
-- استعلام بسيط وواضح
SELECT 
  c.id,
  c.name,
  c.phone,
  c.email,
  COUNT(ct.id) as contracts_count,
  SUM(ct.total_amount) as total_contracts_value
FROM customers c
LEFT JOIN contracts ct ON c.id = ct.customer_id
WHERE c.status = 'active'
  AND c.created_at >= date('now', '-1 year')
GROUP BY c.id, c.name, c.phone, c.email
HAVING contracts_count > 0
ORDER BY total_contracts_value DESC
LIMIT 20;

-- استعلام مع معاملات
SELECT 
  u.name as unit_name,
  u.type,
  u.price,
  c.name as customer_name,
  ct.total_amount,
  ct.start_date
FROM units u
JOIN contracts ct ON u.id = ct.unit_id
JOIN customers c ON ct.customer_id = c.id
WHERE u.status = 'sold'
  AND ct.type = 'sale'
  AND ct.start_date BETWEEN ? AND ?
ORDER BY ct.start_date DESC;
```

#### ❌ استعلامات سيئة
```sql
-- تجنب
SELECT * FROM customers c, contracts ct WHERE c.id = ct.customer_id;
```

### استخدام الفهارس

#### ✅ فهارس جيدة
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

-- فهارس مركبة
CREATE INDEX IF NOT EXISTS idx_contracts_customer_type ON contracts(customer_id, type);
CREATE INDEX IF NOT EXISTS idx_contracts_unit_status ON contracts(unit_id, status);
```

### معالجة الأخطاء في SQL

#### ✅ معالجة أخطاء جيدة
```javascript
const updateCustomer = async (customerId, updateData) => {
  try {
    // التحقق من وجود العميل
    const existingCustomer = await db.get('SELECT id FROM customers WHERE id = ?', [customerId]);
    
    if (!existingCustomer) {
      throw new Error('العميل غير موجود');
    }
    
    // التحقق من صحة البيانات
    if (updateData.phone) {
      const phoneExists = await db.get(
        'SELECT id FROM customers WHERE phone = ? AND id != ?',
        [updateData.phone, customerId]
      );
      
      if (phoneExists) {
        throw new Error('رقم الهاتف مستخدم بالفعل');
      }
    }
    
    // تحديث العميل
    const result = await db.run(
      `UPDATE customers 
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           address = COALESCE(?, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [updateData.name, updateData.phone, updateData.email, updateData.address, customerId]
    );
    
    if (result.changes === 0) {
      throw new Error('لم يتم تحديث أي بيانات');
    }
    
    // جلب العميل المحدث
    const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);
    
    return {
      success: true,
      data: updatedCustomer,
      message: 'تم تحديث العميل بنجاح'
    };
  } catch (error) {
    console.error('خطأ في تحديث العميل:', error);
    throw error;
  }
};
```

## 🎨 معايير HTML/CSS

### هيكل HTML

#### ✅ هيكل جيد
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="نظام إدارة الاستثمار العقاري الشامل">
  <title>نظام إدارة الاستثمار العقاري</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body data-theme="light">
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <h1 class="logo">نظام إدارة الاستثمار العقاري</h1>
      <nav class="nav">
        <button class="theme-toggle" aria-label="تبديل الوضع">
          <span class="icon">🌙</span>
        </button>
        <button class="logout-btn" aria-label="تسجيل الخروج">
          <span class="icon">🚪</span>
        </button>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main">
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <a href="#dashboard" class="nav-link active" data-page="dashboard">
          <span class="icon">📊</span>
          <span class="text">لوحة التحكم</span>
        </a>
        <a href="#customers" class="nav-link" data-page="customers">
          <span class="icon">👥</span>
          <span class="text">العملاء</span>
        </a>
        <!-- المزيد من الروابط -->
      </nav>
    </aside>

    <div class="content">
      <div id="dashboard" class="page active">
        <!-- محتوى لوحة التحكم -->
      </div>
      
      <div id="customers" class="page">
        <!-- محتوى صفحة العملاء -->
      </div>
    </div>
  </main>

  <!-- Modals -->
  <div id="customerModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">إضافة عميل جديد</h2>
        <button class="modal-close" aria-label="إغلاق">×</button>
      </div>
      <form class="modal-form" id="customerForm">
        <div class="form-group">
          <label for="customerName" class="form-label">اسم العميل *</label>
          <input type="text" id="customerName" name="name" class="form-input" required>
        </div>
        <!-- المزيد من الحقول -->
      </form>
    </div>
  </div>

  <script src="/app.js"></script>
</body>
</html>
```

#### ❌ هيكل سيء
```html
<!-- تجنب -->
<html>
<head>
  <title>نظام</title>
</head>
<body>
  <div>
    <div>
      <div>محتوى</div>
    </div>
  </div>
</body>
</html>
```

### معايير CSS

#### ✅ CSS جيد
```css
/* متغيرات CSS */
:root {
  /* الألوان */
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #16a34a;
  --warning-color: #ca8a04;
  --error-color: #dc2626;
  
  /* الخطوط */
  --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-size-small: 0.875rem;
  --font-size-base: 1rem;
  --font-size-large: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* المسافات */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* الحدود */
  --border-radius: 0.5rem;
  --border-width: 1px;
  --border-color: #e2e8f0;
  
  /* الظلال */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* الوضع الداكن */
[data-theme="dark"] {
  --primary-color: #3b82f6;
  --secondary-color: #94a3b8;
  --background-color: #0f172a;
  --surface-color: #1e293b;
  --text-color: #f1f5f9;
  --border-color: #334155;
}

/* الأنماط الأساسية */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
  direction: rtl;
}

/* المكونات */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: var(--border-width) solid transparent;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: color-mix(in srgb, var(--primary-color) 90%, black);
}

/* النماذج */
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-color);
}

.form-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  background-color: var(--surface-color);
  color: var(--text-color);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

/* الجداول */
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.table th,
.table td {
  padding: var(--spacing-md);
  text-align: right;
  border-bottom: var(--border-width) solid var(--border-color);
}

.table th {
  background-color: color-mix(in srgb, var(--surface-color) 80%, black);
  font-weight: 600;
}

/* التصميم المتجاوب */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -100%;
    transition: left 0.3s ease;
  }
  
  .sidebar.active {
    left: 0;
  }
  
  .content {
    margin-right: 0;
  }
}
```

#### ❌ CSS سيء
```css
/* تجنب */
div {
  margin: 10px;
  padding: 5px;
  background: #fff;
  border: 1px solid #000;
}

.btn {
  background: blue;
  color: white;
  padding: 10px;
}
```

## 💬 معايير التعليقات

### تعليقات JavaScript

#### ✅ تعليقات جيدة
```javascript
/**
 * حساب السعر الإجمالي مع الخصم والضريبة
 * @param {number} price - السعر الأساسي
 * @param {number} discount - نسبة الخصم (0-100)
 * @param {number} tax - نسبة الضريبة (0-100)
 * @returns {number} السعر النهائي بعد الخصم والضريبة
 * @throws {Error} إذا كانت القيم غير صحيحة
 */
const calculateFinalPrice = (price, discount = 0, tax = 0) => {
  // التحقق من صحة المدخلات
  if (price < 0) {
    throw new Error('السعر يجب أن يكون موجباً');
  }
  
  // حساب السعر بعد الخصم
  const priceAfterDiscount = price * (1 - discount / 100);
  
  // إضافة الضريبة للحصول على السعر النهائي
  const finalPrice = priceAfterDiscount * (1 + tax / 100);
  
  return Math.round(finalPrice * 100) / 100;
};

// تسجيل العمليات في سجل التغييرات
const logAudit = async (action, table, recordId, data) => {
  try {
    await db.run(
      'INSERT INTO audit_log (action, table_name, record_id, data, user_id, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [action, table, recordId, JSON.stringify(data), currentUser.id]
    );
  } catch (error) {
    console.error('خطأ في تسجيل العملية:', error);
    // لا نريد أن نوقف العملية بسبب فشل التسجيل
  }
};
```

#### ❌ تعليقات سيئة
```javascript
// تجنب
// دالة لحساب السعر
function calc(x, y, z) {
  return x * (1 - y / 100) * (1 + z / 100); // حساب نهائي
}
```

### تعليقات SQL

#### ✅ تعليقات جيدة
```sql
-- إنشاء جدول العملاء مع جميع الحقول المطلوبة
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- معرف فريد للعميل
  name TEXT NOT NULL,                    -- اسم العميل (مطلوب)
  phone TEXT UNIQUE NOT NULL,            -- رقم الهاتف (فريد ومطلوب)
  email TEXT,                            -- البريد الإلكتروني (اختياري)
  address TEXT,                          -- العنوان (اختياري)
  status TEXT DEFAULT 'active',          -- حالة العميل (نشط/غير نشط)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- تاريخ الإنشاء
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- تاريخ آخر تحديث
);

-- فهرس لتحسين أداء البحث بالاسم
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- استعلام لجلب العملاء النشطين مع عدد عقودهم
SELECT 
  c.id,
  c.name,
  c.phone,
  COUNT(ct.id) as contracts_count,       -- عدد العقود
  SUM(ct.total_amount) as total_value    -- إجمالي قيمة العقود
FROM customers c
LEFT JOIN contracts ct ON c.id = ct.customer_id
WHERE c.status = 'active'                -- العملاء النشطين فقط
GROUP BY c.id, c.name, c.phone
HAVING contracts_count > 0               -- العملاء الذين لديهم عقود
ORDER BY total_value DESC;               -- ترتيب حسب القيمة الإجمالية
```

#### ❌ تعليقات سيئة
```sql
-- تجنب
CREATE TABLE customers (id, name, phone); -- جدول العملاء
SELECT * FROM customers; -- جلب العملاء
```

## 🔒 معايير الأمان

### حماية المدخلات

#### ✅ حماية جيدة
```javascript
// تنظيف المدخلات
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // إزالة الأحرف الخطرة
  return input
    .replace(/[<>]/g, '')  // منع XSS
    .trim()
    .substring(0, 1000);   // تحديد الطول
};

// التحقق من صحة البيانات
const validateCustomerData = (data) => {
  const errors = [];
  
  // التحقق من الاسم
  if (!data.name || data.name.trim().length < 2) {
    errors.push('الاسم يجب أن يكون على الأقل حرفين');
  }
  
  // التحقق من رقم الهاتف
  if (!data.phone || !/^\d{10,11}$/.test(data.phone)) {
    errors.push('رقم الهاتف غير صحيح');
  }
  
  // التحقق من البريد الإلكتروني
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }
  
  return errors;
};

// استخدام معاملات SQL
const createCustomer = async (customerData) => {
  const sanitizedData = {
    name: sanitizeInput(customerData.name),
    phone: sanitizeInput(customerData.phone),
    email: sanitizeInput(customerData.email),
    address: sanitizeInput(customerData.address)
  };
  
  const errors = validateCustomerData(sanitizedData);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  // استخدام معاملات SQL لمنع SQL Injection
  const result = await db.run(
    'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
    [sanitizedData.name, sanitizedData.phone, sanitizedData.email, sanitizedData.address]
  );
  
  return result;
};
```

#### ❌ حماية سيئة
```javascript
// تجنب
const createCustomer = async (data) => {
  // لا تنظيف للمدخلات
  const query = `INSERT INTO customers VALUES ('${data.name}', '${data.phone}')`;
  return db.run(query);
};
```

### المصادقة والتفويض

#### ✅ أمان جيد
```javascript
// التحقق من التوكن
const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'توكن المصادقة مطلوب'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'توكن غير صحيح'
    });
  }
};

// التحقق من الصلاحيات
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'المصادقة مطلوبة'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا المورد'
      });
    }
    
    next();
  };
};

// استخدام في المسارات
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  // فقط المدير يمكنه الوصول
});
```

## ⚡ معايير الأداء

### تحسين قاعدة البيانات

#### ✅ تحسين جيد
```javascript
// استخدام الفهارس
const searchCustomers = async (searchTerm, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  // استعلام محسن مع فهارس
  const customers = await db.all(`
    SELECT id, name, phone, email, status, created_at
    FROM customers 
    WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit, offset]);
  
  // جلب العدد الإجمالي
  const countResult = await db.get(`
    SELECT COUNT(*) as total
    FROM customers 
    WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
  `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
  
  return {
    customers,
    pagination: {
      page,
      limit,
      total: countResult.total,
      pages: Math.ceil(countResult.total / limit)
    }
  };
};

// تجنب N+1 queries
const getCustomersWithContracts = async () => {
  // استعلام واحد بدلاً من استعلامات متعددة
  const customers = await db.all(`
    SELECT 
      c.id,
      c.name,
      c.phone,
      COUNT(ct.id) as contracts_count,
      SUM(ct.total_amount) as total_value
    FROM customers c
    LEFT JOIN contracts ct ON c.id = ct.customer_id
    GROUP BY c.id, c.name, c.phone
    ORDER BY c.created_at DESC
  `);
  
  return customers;
};
```

#### ❌ تحسين سيء
```javascript
// تجنب
const getCustomersWithContracts = async () => {
  const customers = await db.all('SELECT * FROM customers');
  
  // N+1 queries - سيء جداً
  for (const customer of customers) {
    const contracts = await db.all('SELECT * FROM contracts WHERE customer_id = ?', [customer.id]);
    customer.contracts = contracts;
  }
  
  return customers;
};
```

### تحسين الواجهة الأمامية

#### ✅ تحسين جيد
```javascript
// تحميل تدريجي للبيانات
const loadCustomers = async (page = 1) => {
  try {
    showLoading();
    
    const response = await fetch(`/api/customers?page=${page}&limit=20`);
    const data = await response.json();
    
    if (data.success) {
      renderCustomers(data.data.customers);
      renderPagination(data.data.pagination);
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('خطأ في تحميل البيانات');
  } finally {
    hideLoading();
  }
};

// تخزين مؤقت للبيانات
const customerCache = new Map();

const getCustomerById = async (id) => {
  // التحقق من التخزين المؤقت
  if (customerCache.has(id)) {
    return customerCache.get(id);
  }
  
  const response = await fetch(`/api/customers/${id}`);
  const data = await response.json();
  
  if (data.success) {
    // حفظ في التخزين المؤقت
    customerCache.set(id, data.data);
    return data.data;
  }
  
  throw new Error(data.message);
};

// تنظيف التخزين المؤقت
const clearCache = () => {
  customerCache.clear();
};
```

## 🛠️ أدوات التحقق

### ESLint Configuration

#### ✅ إعداد جيد
```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "arrow-spacing": "error",
    "object-shorthand": "error",
    "prefer-template": "error"
  },
  "globals": {
    "fetch": "readonly"
  }
}
```

### Prettier Configuration

#### ✅ إعداد جيد
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Git Hooks

#### ✅ إعداد جيد
```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "pre-commit": "npm run lint && npm run format"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run pre-commit"
    }
  }
}
```

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0.0