# دليل الاختبارات - نظام إدارة الاستثمار العقاري

هذا الدليل يوضح كيفية إجراء الاختبارات المختلفة للنظام.

## 📋 جدول المحتويات

- [أنواع الاختبارات](#أنواع-الاختبارات)
- [اختبارات الوحدة](#اختبارات-الوحدة)
- [اختبارات التكامل](#اختبارات-التكامل)
- [اختبارات النظام](#اختبارات-النظام)
- [اختبارات الأداء](#اختبارات-الأداء)
- [اختبارات الأمان](#اختبارات-الأمان)
- [اختبارات الواجهة الأمامية](#اختبارات-الواجهة-الأمامية)
- [أدوات الاختبار](#أدوات-الاختبار)
- [أفضل الممارسات](#أفضل-الممارسات)

## 🧪 أنواع الاختبارات

### هرم الاختبارات

```
┌─────────────────────────────────────┐
│           اختبارات النظام           │
│        (System Tests)               │
├─────────────────────────────────────┤
│         اختبارات التكامل            │
│      (Integration Tests)            │
├─────────────────────────────────────┤
│          اختبارات الوحدة            │
│        (Unit Tests)                 │
└─────────────────────────────────────┘
```

### أنواع الاختبارات

1. **اختبارات الوحدة**: اختبار الدوال والوحدات الفردية
2. **اختبارات التكامل**: اختبار تفاعل المكونات
3. **اختبارات النظام**: اختبار النظام بالكامل
4. **اختبارات الأداء**: اختبار الأداء والاستجابة
5. **اختبارات الأمان**: اختبار الثغرات الأمنية
6. **اختبارات الواجهة**: اختبار واجهة المستخدم

## 🔧 اختبارات الوحدة

### إعداد بيئة الاختبار

#### تثبيت أدوات الاختبار
```bash
# تثبيت Jest
npm install --save-dev jest @types/jest

# تثبيت أدوات إضافية
npm install --save-dev supertest
npm install --save-dev sqlite3-memory

# إضافة سكريبت الاختبار
# في package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### إعداد Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'database/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### اختبارات قاعدة البيانات

#### اختبار إدارة قاعدة البيانات
```javascript
// tests/database.test.js
const Database = require('../database/database');
const path = require('path');

describe('Database', () => {
  let db;
  const testDbPath = ':memory:'; // قاعدة بيانات في الذاكرة

  beforeEach(async () => {
    db = new Database(testDbPath);
    await db.init();
  });

  afterEach(async () => {
    await db.close();
  });

  describe('init()', () => {
    it('should create all tables', async () => {
      const tables = await db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      
      expect(tables).toHaveLength(15); // عدد الجداول المتوقعة
      expect(tables.map(t => t.name)).toContain('customers');
      expect(tables.map(t => t.name)).toContain('units');
      expect(tables.map(t => t.name)).toContain('contracts');
    });

    it('should create default admin user', async () => {
      const users = await db.all('SELECT * FROM users WHERE username = ?', ['admin']);
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe('admin');
    });
  });

  describe('CRUD operations', () => {
    it('should insert customer', async () => {
      const customer = {
        name: 'أحمد محمد',
        phone: '0123456789',
        email: 'ahmed@example.com'
      };

      const result = await db.run(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [customer.name, customer.phone, customer.email]
      );

      expect(result.lastID).toBeGreaterThan(0);

      const inserted = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
      expect(inserted.name).toBe(customer.name);
      expect(inserted.phone).toBe(customer.phone);
      expect(inserted.email).toBe(customer.email);
    });

    it('should update customer', async () => {
      // إدخال عميل أولاً
      const insertResult = await db.run(
        'INSERT INTO customers (name, phone) VALUES (?, ?)',
        ['محمد علي', '0987654321']
      );

      // تحديث العميل
      await db.run(
        'UPDATE customers SET name = ? WHERE id = ?',
        ['محمد أحمد', insertResult.lastID]
      );

      const updated = await db.get('SELECT * FROM customers WHERE id = ?', [insertResult.lastID]);
      expect(updated.name).toBe('محمد أحمد');
    });

    it('should delete customer', async () => {
      // إدخال عميل أولاً
      const insertResult = await db.run(
        'INSERT INTO customers (name, phone) VALUES (?, ?)',
        ['سارة أحمد', '0123456789']
      );

      // حذف العميل
      await db.run('DELETE FROM customers WHERE id = ?', [insertResult.lastID]);

      const deleted = await db.get('SELECT * FROM customers WHERE id = ?', [insertResult.lastID]);
      expect(deleted).toBeUndefined();
    });
  });
});
```

### اختبارات المسارات

#### اختبار مسار العملاء
```javascript
// tests/routes/customers.test.js
const request = require('supertest');
const app = require('../../server');
const Database = require('../../database/database');

describe('Customers API', () => {
  let db;
  let authToken;

  beforeAll(async () => {
    // إعداد قاعدة بيانات اختبار
    db = new Database(':memory:');
    await db.init();

    // تسجيل دخول للحصول على توكن
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await db.close();
  });

  describe('GET /api/customers', () => {
    it('should return list of customers', async () => {
      // إدخال بيانات اختبار
      await db.run(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        ['أحمد محمد', '0123456789', 'ahmed@example.com']
      );

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter customers by search term', async () => {
      const response = await request(app)
        .get('/api/customers?search=أحمد')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every(c => c.name.includes('أحمد'))).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/customers?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('POST /api/customers', () => {
    it('should create new customer', async () => {
      const customerData = {
        name: 'محمد علي',
        phone: '0987654321',
        email: 'mohamed@example.com',
        address: 'شارع الرئيسي'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(customerData.name);
      expect(response.body.data.phone).toBe(customerData.phone);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ phone: '0123456789' }); // بدون اسم

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('الاسم مطلوب');
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update customer', async () => {
      // إنشاء عميل أولاً
      const createResponse = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'سارة أحمد',
          phone: '0123456789'
        });

      const customerId = createResponse.body.data.id;

      // تحديث العميل
      const updateData = {
        name: 'سارة محمد',
        phone: '0987654321'
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .put('/api/customers/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'تحديث' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete customer', async () => {
      // إنشاء عميل أولاً
      const createResponse = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'علي محمد',
          phone: '0123456789'
        });

      const customerId = createResponse.body.data.id;

      // حذف العميل
      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // التحقق من الحذف
      const getResponse = await request(app)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
```

### اختبارات المصادقة

#### اختبار مسار المصادقة
```javascript
// tests/routes/auth.test.js
const request = require('supertest');
const app = require('../../server');
const bcrypt = require('bcryptjs');

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('admin');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('بيانات غير صحيحة');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin'
          // بدون كلمة مرور
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verify', () => {
    let authToken;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      authToken = loginResponse.body.token;
    });

    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## 🔗 اختبارات التكامل

### اختبار تفاعل المكونات

#### اختبار سير العمل الكامل
```javascript
// tests/integration/workflow.test.js
const request = require('supertest');
const app = require('../../server');

describe('Complete Workflow', () => {
  let authToken;
  let customerId;
  let unitId;
  let contractId;

  beforeAll(async () => {
    // تسجيل دخول
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    authToken = loginResponse.body.token;
  });

  it('should complete full customer workflow', async () => {
    // 1. إنشاء عميل
    const customerResponse = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'أحمد محمد',
        phone: '0123456789',
        email: 'ahmed@example.com'
      });

    expect(customerResponse.status).toBe(201);
    customerId = customerResponse.body.data.id;

    // 2. إنشاء وحدة
    const unitResponse = await request(app)
      .post('/api/units')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'شقة 101',
        type: 'apartment',
        area: 120,
        price: 500000,
        location: 'الطابق الأول'
      });

    expect(unitResponse.status).toBe(201);
    unitId = unitResponse.body.data.id;

    // 3. إنشاء عقد
    const contractResponse = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customer_id: customerId,
        unit_id: unitId,
        type: 'sale',
        total_amount: 500000,
        down_payment: 100000,
        installment_amount: 20000,
        installment_count: 20,
        start_date: '2025-01-01'
      });

    expect(contractResponse.status).toBe(201);
    contractId = contractResponse.body.data.id;

    // 4. إنشاء أقساط
    const installmentsResponse = await request(app)
      .post('/api/installments/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        contract_id: contractId
      });

    expect(installmentsResponse.status).toBe(200);

    // 5. التحقق من الأقساط
    const getInstallmentsResponse = await request(app)
      .get(`/api/installments?contract_id=${contractId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getInstallmentsResponse.status).toBe(200);
    expect(getInstallmentsResponse.body.data).toHaveLength(20);

    // 6. دفع قسط
    const firstInstallment = getInstallmentsResponse.body.data[0];
    const payResponse = await request(app)
      .put(`/api/installments/${firstInstallment.id}/pay`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        payment_date: '2025-01-15',
        payment_method: 'cash'
      });

    expect(payResponse.status).toBe(200);
    expect(payResponse.body.data.status).toBe('paid');
  });
});
```

### اختبار قاعدة البيانات مع المسارات

#### اختبار تكامل قاعدة البيانات
```javascript
// tests/integration/database.test.js
const request = require('supertest');
const app = require('../../server');
const Database = require('../../database/database');

describe('Database Integration', () => {
  let db;
  let authToken;

  beforeAll(async () => {
    // إعداد قاعدة بيانات اختبار
    db = new Database(':memory:');
    await db.init();

    // تسجيل دخول
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await db.close();
  });

  it('should maintain data consistency', async () => {
    // إنشاء عميل عبر API
    const customerResponse = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'محمد علي',
        phone: '0123456789'
      });

    const customerId = customerResponse.body.data.id;

    // التحقق من قاعدة البيانات مباشرة
    const dbCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);
    expect(dbCustomer).toBeDefined();
    expect(dbCustomer.name).toBe('محمد علي');
    expect(dbCustomer.phone).toBe('0123456789');

    // تحديث عبر API
    await request(app)
      .put(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'محمد أحمد',
        phone: '0987654321'
      });

    // التحقق من التحديث في قاعدة البيانات
    const updatedDbCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);
    expect(updatedDbCustomer.name).toBe('محمد أحمد');
    expect(updatedDbCustomer.phone).toBe('0987654321');
  });

  it('should handle foreign key constraints', async () => {
    // محاولة إنشاء عقد بدون عميل ووحدة موجودة
    const contractResponse = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customer_id: 999999, // غير موجود
        unit_id: 999999,     // غير موجود
        type: 'sale',
        total_amount: 500000
      });

    expect(contractResponse.status).toBe(400);
    expect(contractResponse.body.success).toBe(false);
  });
});
```

## 🖥️ اختبارات النظام

### اختبار النظام بالكامل

#### اختبار النقاط النهائية
```javascript
// tests/system/endpoints.test.js
const request = require('supertest');
const app = require('../../server');

describe('System Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    authToken = loginResponse.body.token;
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Dashboard', () => {
    it('should return dashboard data', async () => {
      const response = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('customers');
      expect(response.body.data).toHaveProperty('units');
      expect(response.body.data).toHaveProperty('contracts');
      expect(response.body.data).toHaveProperty('installments');
    });
  });

  describe('Reports', () => {
    it('should return sales report', async () => {
      const response = await request(app)
        .get('/api/reports/sales?year=2025&month=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return overdue installments', async () => {
      const response = await request(app)
        .get('/api/reports/overdue-installments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Backup', () => {
    it('should create backup', async () => {
      const response = await request(app)
        .post('/api/backup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'اختبار النسخ الاحتياطية'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('backup_id');
    });

    it('should list backups', async () => {
      const response = await request(app)
        .get('/api/backup')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});
```

## ⚡ اختبارات الأداء

### اختبار الأداء

#### اختبار الاستجابة
```javascript
// tests/performance/response.test.js
const request = require('supertest');
const app = require('../../server');

describe('Performance Tests', () => {
  let authToken;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    authToken = loginResponse.body.token;
  });

  it('should respond within 100ms for simple requests', async () => {
    const start = Date.now();
    
    const response = await request(app)
      .get('/health')
      .expect(200);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should handle multiple concurrent requests', async () => {
    const requests = Array(10).fill().map(() =>
      request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
    );

    const start = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    // جميع الطلبات يجب أن تنجح
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // يجب أن تكتمل في أقل من ثانية
    expect(duration).toBeLessThan(1000);
  });

  it('should handle large datasets efficiently', async () => {
    // إنشاء 100 عميل للاختبار
    const customers = Array(100).fill().map((_, i) => ({
      name: `عميل ${i + 1}`,
      phone: `012345678${i.toString().padStart(2, '0')}`,
      email: `customer${i + 1}@example.com`
    }));

    const start = Date.now();
    
    for (const customer of customers) {
      await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customer);
    }

    const duration = Date.now() - start;
    
    // يجب أن تكتمل في أقل من 5 ثوان
    expect(duration).toBeLessThan(5000);
  });
});
```

### اختبار قاعدة البيانات

#### اختبار أداء الاستعلامات
```javascript
// tests/performance/database.test.js
const Database = require('../../database/database');

describe('Database Performance', () => {
  let db;

  beforeAll(async () => {
    db = new Database(':memory:');
    await db.init();
    
    // إدخال بيانات اختبار
    for (let i = 0; i < 1000; i++) {
      await db.run(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [`عميل ${i + 1}`, `012345678${i.toString().padStart(3, '0')}`, `customer${i + 1}@example.com`]
      );
    }
  });

  afterAll(async () => {
    await db.close();
  });

  it('should perform fast searches', async () => {
    const start = Date.now();
    
    const results = await db.all(
      'SELECT * FROM customers WHERE name LIKE ? LIMIT 10',
      ['%عميل%']
    );

    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(50); // أقل من 50 مللي ثانية
    expect(results).toHaveLength(10);
  });

  it('should handle complex joins efficiently', async () => {
    // إنشاء بيانات إضافية للاختبار
    await db.run('INSERT INTO units (name, type, price) VALUES (?, ?, ?)', ['وحدة 1', 'apartment', 500000]);
    await db.run('INSERT INTO contracts (customer_id, unit_id, type, total_amount) VALUES (?, ?, ?, ?)', [1, 1, 'sale', 500000]);

    const start = Date.now();
    
    const results = await db.all(`
      SELECT 
        c.name as customer_name,
        u.name as unit_name,
        ct.total_amount
      FROM customers c
      JOIN contracts ct ON c.id = ct.customer_id
      JOIN units u ON ct.unit_id = u.id
      WHERE ct.status = 'active'
    `);

    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100); // أقل من 100 مللي ثانية
    expect(results).toBeInstanceOf(Array);
  });
});
```

## 🔒 اختبارات الأمان

### اختبار الثغرات الأمنية

#### اختبار المصادقة
```javascript
// tests/security/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Security Tests', () => {
  describe('Authentication', () => {
    it('should prevent brute force attacks', async () => {
      const attempts = Array(10).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            username: 'admin',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(attempts);
      
      // يجب أن يتم رفض الطلبات بعد عدة محاولات
      const failedAttempts = responses.filter(r => r.status === 401);
      expect(failedAttempts.length).toBeGreaterThan(0);
    });

    it('should validate JWT tokens', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(403);
    });

    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/customers');

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE customers; --";
      
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: maliciousInput,
          phone: '0123456789'
        });

      // يجب أن يتم رفض المدخلات الضارة
      expect(response.status).toBe(400);
    });

    it('should prevent XSS attacks', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: xssPayload,
          phone: '0123456789'
        });

      // يجب أن يتم تنظيف المدخلات
      expect(response.status).toBe(201);
      expect(response.body.data.name).not.toContain('<script>');
    });
  });

  describe('Rate Limiting', () => {
    it('should limit request rate', async () => {
      const requests = Array(150).fill().map(() =>
        request(app)
          .get('/api/customers')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      
      // بعض الطلبات يجب أن يتم رفضها
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
```

## 🎨 اختبارات الواجهة الأمامية

### اختبار واجهة المستخدم

#### اختبار التفاعل
```javascript
// tests/frontend/interaction.test.js
const puppeteer = require('puppeteer');

describe('Frontend Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should load login page', async () => {
    await page.goto('http://localhost:3000');
    
    const title = await page.title();
    expect(title).toContain('نظام إدارة الاستثمار العقاري');
    
    const loginForm = await page.$('form[action="/api/auth/login"]');
    expect(loginForm).toBeTruthy();
  });

  it('should handle login process', async () => {
    await page.goto('http://localhost:3000');
    
    // ملء نموذج تسجيل الدخول
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // انتظار التحميل
    await page.waitForSelector('.dashboard');
    
    const dashboard = await page.$('.dashboard');
    expect(dashboard).toBeTruthy();
  });

  it('should add new customer', async () => {
    // تسجيل الدخول أولاً
    await page.goto('http://localhost:3000');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('.dashboard');
    
    // الانتقال لصفحة العملاء
    await page.click('a[href="#customers"]');
    await page.waitForSelector('.customers-page');
    
    // فتح نافذة إضافة عميل
    await page.click('.add-customer-btn');
    await page.waitForSelector('.customer-modal');
    
    // ملء البيانات
    await page.type('input[name="name"]', 'أحمد محمد');
    await page.type('input[name="phone"]', '0123456789');
    await page.type('input[name="email"]', 'ahmed@example.com');
    
    // حفظ
    await page.click('.save-btn');
    
    // انتظار الإضافة
    await page.waitForSelector('.customer-row');
    
    const customerRow = await page.$('.customer-row');
    expect(customerRow).toBeTruthy();
  });

  it('should handle theme switching', async () => {
    await page.goto('http://localhost:3000');
    
    // التحقق من الوضع الافتراضي
    const body = await page.$('body');
    const initialTheme = await body.evaluate(el => el.getAttribute('data-theme'));
    expect(initialTheme).toBe('light');
    
    // تبديل الوضع
    await page.click('.theme-toggle');
    
    const newTheme = await body.evaluate(el => el.getAttribute('data-theme'));
    expect(newTheme).toBe('dark');
  });
});
```

### اختبار الاستجابة

#### اختبار التصميم المتجاوب
```javascript
// tests/frontend/responsive.test.js
const puppeteer = require('puppeteer');

describe('Responsive Design Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should work on mobile devices', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // التحقق من وجود قائمة الهاتف
    const mobileMenu = await page.$('.mobile-menu');
    expect(mobileMenu).toBeTruthy();
    
    // التحقق من إخفاء الشريط الجانبي
    const sidebar = await page.$('.sidebar');
    const sidebarDisplay = await sidebar.evaluate(el => window.getComputedStyle(el).display);
    expect(sidebarDisplay).toBe('none');
  });

  it('should work on tablet devices', async () => {
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000');
    
    // التحقق من عرض الشريط الجانبي
    const sidebar = await page.$('.sidebar');
    const sidebarDisplay = await sidebar.evaluate(el => window.getComputedStyle(el).display);
    expect(sidebarDisplay).not.toBe('none');
  });

  it('should work on desktop devices', async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000');
    
    // التحقق من عرض جميع العناصر
    const sidebar = await page.$('.sidebar');
    const mainContent = await page.$('.main-content');
    
    expect(sidebar).toBeTruthy();
    expect(mainContent).toBeTruthy();
  });
});
```

## 🛠️ أدوات الاختبار

### إعداد بيئة الاختبار

#### ملف الإعداد
```javascript
// tests/setup.js
const Database = require('../database/database');

// إعداد قاعدة بيانات اختبار
global.testDb = new Database(':memory:');

beforeAll(async () => {
  await global.testDb.init();
});

afterAll(async () => {
  await global.testDb.close();
});

// تنظيف البيانات بين الاختبارات
afterEach(async () => {
  const tables = ['customers', 'units', 'contracts', 'installments'];
  for (const table of tables) {
    await global.testDb.run(`DELETE FROM ${table}`);
  }
});
```

#### سكريبتات الاختبار
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:system": "jest --testPathPattern=system",
    "test:performance": "jest --testPathPattern=performance",
    "test:security": "jest --testPathPattern=security",
    "test:frontend": "jest --testPathPattern=frontend"
  }
}
```

### أدوات إضافية

#### اختبار الأداء
```bash
# تثبيت Apache Bench
sudo apt install apache2-utils

# اختبار الأداء
ab -n 1000 -c 10 http://localhost:3000/health

# تثبيت Artillery
npm install -g artillery

# اختبار التحميل
artillery quick --count 100 --num 10 http://localhost:3000/api/customers
```

#### اختبار الأمان
```bash
# تثبيت OWASP ZAP
# تحميل من https://owasp.org/www-project-zap/

# تثبيت npm audit
npm audit

# تثبيت snyk
npm install -g snyk
snyk test
```

## 📈 أفضل الممارسات

### ممارسات عامة

1. **اكتب اختبارات لكل ميزة جديدة**
2. **حافظ على تغطية اختبارات عالية (>80%)**
3. **اجعل الاختبارات سريعة ومستقلة**
4. **استخدم بيانات اختبار واقعية**
5. **اختبر الحالات الحدية والأخطاء**
6. **اختبر الأداء بانتظام**
7. **اختبر الأمان بشكل دوري**

### ممارسات اختبارات الوحدة

1. **اختبر دالة واحدة في كل مرة**
2. **استخدم أسماء وصفية للاختبارات**
3. **اختبر الحالات الإيجابية والسلبية**
4. **استخدم Mock للتبعيات الخارجية**
5. **اختبر الأخطاء والاستثناءات**

### ممارسات اختبارات التكامل

1. **اختبر تفاعل المكونات**
2. **اختبر سير العمل الكامل**
3. **اختبر قاعدة البيانات**
4. **اختبر API endpoints**
5. **اختبر المصادقة والتفويض**

### ممارسات اختبارات النظام

1. **اختبر النظام بالكامل**
2. **اختبر النقاط النهائية**
3. **اختبر الأداء تحت التحميل**
4. **اختبر الاستقرار**
5. **اختبر الاسترداد من الأخطاء**

### ممارسات اختبارات الأمان

1. **اختبر المصادقة والتفويض**
2. **اختبر حماية المدخلات**
3. **اختبر Rate Limiting**
4. **اختبر CORS**
5. **اختبر تشفير البيانات**

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0.0