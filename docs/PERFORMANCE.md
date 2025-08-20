# دليل تحسين الأداء - نظام إدارة الاستثمار العقاري

هذا الدليل يوضح كيفية تحسين أداء النظام وتحقيق أفضل النتائج.

## 📋 جدول المحتويات

- [تحسين قاعدة البيانات](#تحسين-قاعدة-البيانات)
- [تحسين الخادم](#تحسين-الخادم)
- [تحسين الواجهة الأمامية](#تحسين-الواجهة-الأمامية)
- [تحسين الشبكة](#تحسين-الشبكة)
- [مراقبة الأداء](#مراقبة-الأداء)
- [أدوات التحسين](#أدوات-التحسين)
- [أفضل الممارسات](#أفضل-الممارسات)

## 🗄️ تحسين قاعدة البيانات

### تحسين الاستعلامات

#### استخدام الفهارس

```sql
-- فهارس أساسية للأداء
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

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
```

#### تحسين الاستعلامات المعقدة

```sql
-- استعلام محسن للعملاء مع العقود
SELECT 
  c.id,
  c.name,
  c.phone,
  c.email,
  COUNT(ct.id) as contracts_count,
  SUM(ct.total_amount) as total_contracts_amount
FROM customers c
LEFT JOIN contracts ct ON c.id = ct.customer_id
WHERE c.status = 'active'
GROUP BY c.id
ORDER BY total_contracts_amount DESC;

-- استعلام محسن للأقساط المتأخرة
SELECT 
  i.id,
  i.amount,
  i.due_date,
  c.name as customer_name,
  u.name as unit_name
FROM installments i
JOIN contracts ct ON i.contract_id = ct.id
JOIN customers c ON ct.customer_id = c.id
JOIN units u ON ct.unit_id = u.id
WHERE i.status = 'pending' 
  AND i.due_date < date('now')
ORDER BY i.due_date ASC;
```

#### تحسين بنية الجداول

```sql
-- تحسين أنواع البيانات
ALTER TABLE customers MODIFY COLUMN phone VARCHAR(20);
ALTER TABLE customers MODIFY COLUMN email VARCHAR(100);
ALTER TABLE units MODIFY COLUMN price DECIMAL(12,2);

-- إضافة قيود للبيانات
ALTER TABLE customers ADD CONSTRAINT chk_phone CHECK (phone REGEXP '^[0-9+]+$');
ALTER TABLE customers ADD CONSTRAINT chk_email CHECK (email LIKE '%@%');
ALTER TABLE units ADD CONSTRAINT chk_price CHECK (price > 0);
```

### صيانة قاعدة البيانات

#### تنظيف دوري

```sql
-- تنظيف قاعدة البيانات
VACUUM;

-- تحليل الإحصائيات
ANALYZE;

-- إعادة بناء الفهارس
REINDEX;

-- تنظيف البيانات القديمة
DELETE FROM audit_log WHERE created_at < date('now', '-1 year');
DELETE FROM backups WHERE created_at < date('now', '-6 months');
```

#### مراقبة الأداء

```sql
-- فحص الاستعلامات البطيئة
EXPLAIN QUERY PLAN SELECT * FROM customers WHERE name LIKE '%test%';

-- فحص حجم الجداول
SELECT 
  name,
  sql,
  length(sql) as size
FROM sqlite_master 
WHERE type='table';

-- فحص الفهارس
SELECT 
  name,
  sql
FROM sqlite_master 
WHERE type='index';
```

## 🖥️ تحسين الخادم

### تحسين Express.js

#### إعدادات الخادم

```javascript
// تحسين إعدادات Express
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ضغط البيانات
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// التخزين المؤقت
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 دقائق
  next();
});
```

#### تحسين معالجة الطلبات

```javascript
// تجميع الطلبات المتعددة
app.get('/api/dashboard', async (req, res) => {
  try {
    const [customers, units, contracts, installments] = await Promise.all([
      db.all('SELECT COUNT(*) as count FROM customers WHERE status = "active"'),
      db.all('SELECT COUNT(*) as count FROM units WHERE status = "available"'),
      db.all('SELECT COUNT(*) as count FROM contracts WHERE status = "active"'),
      db.all('SELECT COUNT(*) as count FROM installments WHERE status = "pending"')
    ]);

    res.json({
      success: true,
      data: {
        customers: customers[0].count,
        units: units[0].count,
        contracts: contracts[0].count,
        installments: installments[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

#### تحسين الذاكرة

```javascript
// إدارة الذاكرة
const v8 = require('v8');

// مراقبة استخدام الذاكرة
setInterval(() => {
  const stats = v8.getHeapStatistics();
  console.log('Memory usage:', {
    used: Math.round(stats.used_heap_size / 1024 / 1024) + 'MB',
    total: Math.round(stats.total_heap_size / 1024 / 1024) + 'MB',
    external: Math.round(stats.external_memory / 1024 / 1024) + 'MB'
  });
}, 60000);

// تنظيف الذاكرة
setInterval(() => {
  if (global.gc) {
    global.gc();
  }
}, 300000); // كل 5 دقائق
```

### تحسين قاعدة البيانات

#### اتصال محسن

```javascript
// إعدادات محسنة لقاعدة البيانات
const db = new sqlite3.Database('./data/production.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database connected successfully');
    
    // تحسين الأداء
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA synchronous = NORMAL');
    db.run('PRAGMA cache_size = 10000');
    db.run('PRAGMA temp_store = MEMORY');
    db.run('PRAGMA mmap_size = 268435456'); // 256MB
  }
});
```

#### تجميع الاستعلامات

```javascript
// تجميع الاستعلامات المتعددة
async function getCustomerWithDetails(customerId) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const customer = {};
      
      db.get('SELECT * FROM customers WHERE id = ?', [customerId], (err, row) => {
        if (err) return reject(err);
        Object.assign(customer, row);
      });
      
      db.all('SELECT * FROM contracts WHERE customer_id = ?', [customerId], (err, rows) => {
        if (err) return reject(err);
        customer.contracts = rows;
      });
      
      db.all('SELECT * FROM installments WHERE contract_id IN (SELECT id FROM contracts WHERE customer_id = ?)', [customerId], (err, rows) => {
        if (err) return reject(err);
        customer.installments = rows;
        resolve(customer);
      });
    });
  });
}
```

## 🎨 تحسين الواجهة الأمامية

### تحسين HTML

#### تحسين هيكل الصفحة

```html
<!-- تحسين تحميل الصفحة -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نظام إدارة الاستثمار العقاري</title>
  
  <!-- تحميل CSS بشكل محسن -->
  <link rel="preload" href="/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/style.css"></noscript>
  
  <!-- تحميل الخطوط بشكل محسن -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
</head>
<body>
  <!-- محتوى الصفحة -->
  
  <!-- تحميل JavaScript في النهاية -->
  <script src="/app.js" defer></script>
</body>
</html>
```

### تحسين CSS

#### تحسين الأداء

```css
/* استخدام متغيرات CSS للأداء الأفضل */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #059669;
  --danger-color: #dc2626;
  --warning-color: #d97706;
  --info-color: #0891b2;
  
  --font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --border-radius: 0.5rem;
  --transition: all 0.3s ease;
}

/* تحسين التحميل */
* {
  box-sizing: border-box;
}

/* تحسين الأداء للعناصر الكثيرة */
.customers-table {
  contain: layout style paint;
  will-change: transform;
}

/* تحسين الرسوم المتحركة */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

### تحسين JavaScript

#### تحسين التحميل

```javascript
// تحسين تحميل البيانات
class DataLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }

  async load(endpoint, options = {}) {
    const cacheKey = `${endpoint}?${new URLSearchParams(options).toString()}`;
    
    // التحقق من التخزين المؤقت
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // منع الطلبات المكررة
    if (this.loading.has(cacheKey)) {
      return this.loading.get(cacheKey);
    }
    
    // تحميل البيانات
    const promise = this.fetchData(endpoint, options);
    this.loading.set(cacheKey, promise);
    
    try {
      const data = await promise;
      this.cache.set(cacheKey, data);
      this.loading.delete(cacheKey);
      return data;
    } catch (error) {
      this.loading.delete(cacheKey);
      throw error;
    }
  }

  async fetchData(endpoint, options) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  clearCache() {
    this.cache.clear();
  }
}

// استخدام محسن
const dataLoader = new DataLoader();
```

#### تحسين التفاعل

```javascript
// تحسين البحث
class SearchOptimizer {
  constructor(input, callback, delay = 300) {
    this.input = input;
    this.callback = callback;
    this.delay = delay;
    this.timeout = null;
    
    this.input.addEventListener('input', this.handleInput.bind(this));
  }

  handleInput() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.callback(this.input.value);
    }, this.delay);
  }
}

// تحسين التمرير
class ScrollOptimizer {
  constructor(container, callback, threshold = 100) {
    this.container = container;
    this.callback = callback;
    this.threshold = threshold;
    this.isLoading = false;
    
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll() {
    if (this.isLoading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    if (scrollTop + clientHeight >= scrollHeight - this.threshold) {
      this.isLoading = true;
      this.callback().finally(() => {
        this.isLoading = false;
      });
    }
  }
}
```

## 🌐 تحسين الشبكة

### تحسين HTTP

#### إعدادات الخادم

```javascript
// تحسين الاستجابة
app.use((req, res, next) => {
  // ضغط البيانات
  res.set('Content-Encoding', 'gzip');
  
  // التخزين المؤقت
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache');
  } else {
    res.set('Cache-Control', 'public, max-age=3600'); // ساعة واحدة
  }
  
  // CORS محسن
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  next();
});
```

#### تحسين الطلبات

```javascript
// تجميع الطلبات
class RequestBatcher {
  constructor() {
    this.batch = [];
    this.timeout = null;
    this.batchSize = 10;
    this.batchDelay = 100;
  }

  add(request) {
    this.batch.push(request);
    
    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.batchDelay);
    }
  }

  async flush() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    if (this.batch.length === 0) return;
    
    const batch = this.batch.splice(0);
    const promises = batch.map(req => this.executeRequest(req));
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Batch request failed:', error);
    }
  }

  async executeRequest(request) {
    // تنفيذ الطلب
    return fetch(request.url, request.options);
  }
}
```

### تحسين التحميل

#### تحميل تدريجي

```javascript
// تحميل تدريجي للبيانات
class ProgressiveLoader {
  constructor(container, endpoint, options = {}) {
    this.container = container;
    this.endpoint = endpoint;
    this.options = options;
    this.page = 1;
    this.loading = false;
    this.hasMore = true;
    
    this.init();
  }

  init() {
    this.loadInitial();
    this.setupInfiniteScroll();
  }

  async loadInitial() {
    const data = await this.loadData(1);
    this.renderData(data);
  }

  async loadMore() {
    if (this.loading || !this.hasMore) return;
    
    this.loading = true;
    this.page++;
    
    try {
      const data = await this.loadData(this.page);
      this.renderData(data, true);
      this.hasMore = data.length > 0;
    } catch (error) {
      console.error('Error loading more data:', error);
      this.page--;
    } finally {
      this.loading = false;
    }
  }

  async loadData(page) {
    const response = await fetch(`${this.endpoint}?page=${page}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.json();
  }

  renderData(data, append = false) {
    // عرض البيانات
    const html = data.map(item => this.renderItem(item)).join('');
    
    if (append) {
      this.container.insertAdjacentHTML('beforeend', html);
    } else {
      this.container.innerHTML = html;
    }
  }

  setupInfiniteScroll() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadMore();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // مراقبة عنصر التحميل
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    this.container.appendChild(loadingElement);
    observer.observe(loadingElement);
  }
}
```

## 📊 مراقبة الأداء

### مراقبة الخادم

#### أدوات المراقبة

```javascript
// مراقبة الأداء
const performance = {
  startTime: Date.now(),
  requests: 0,
  errors: 0,
  responseTimes: []
};

// middleware للمراقبة
app.use((req, res, next) => {
  const start = Date.now();
  performance.requests++;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    performance.responseTimes.push(duration);
    
    if (res.statusCode >= 400) {
      performance.errors++;
    }
    
    // حفظ الإحصائيات كل 1000 طلب
    if (performance.requests % 1000 === 0) {
      this.saveStats();
    }
  });
  
  next();
});

// حفظ الإحصائيات
function saveStats() {
  const avgResponseTime = performance.responseTimes.reduce((a, b) => a + b, 0) / performance.responseTimes.length;
  
  console.log('Performance Stats:', {
    uptime: Date.now() - performance.startTime,
    requests: performance.requests,
    errors: performance.errors,
    errorRate: (performance.errors / performance.requests * 100).toFixed(2) + '%',
    avgResponseTime: avgResponseTime.toFixed(2) + 'ms'
  });
  
  // إعادة تعيين الإحصائيات
  performance.responseTimes = [];
}
```

#### مراقبة قاعدة البيانات

```javascript
// مراقبة قاعدة البيانات
class DatabaseMonitor {
  constructor(db) {
    this.db = db;
    this.queries = [];
    this.slowQueries = [];
  }

  monitor() {
    const originalRun = this.db.run.bind(this.db);
    const originalGet = this.db.get.bind(this.db);
    const originalAll = this.db.all.bind(this.db);

    this.db.run = (...args) => {
      const start = Date.now();
      return originalRun(...args).finally(() => {
        this.recordQuery('run', args[0], Date.now() - start);
      });
    };

    this.db.get = (...args) => {
      const start = Date.now();
      return originalGet(...args).finally(() => {
        this.recordQuery('get', args[0], Date.now() - start);
      });
    };

    this.db.all = (...args) => {
      const start = Date.now();
      return originalAll(...args).finally(() => {
        this.recordQuery('all', args[0], Date.now() - start);
      });
    };
  }

  recordQuery(type, sql, duration) {
    this.queries.push({ type, sql, duration, timestamp: Date.now() });
    
    if (duration > 100) { // استعلامات بطيئة
      this.slowQueries.push({ type, sql, duration, timestamp: Date.now() });
    }
    
    // تنظيف البيانات القديمة
    if (this.queries.length > 1000) {
      this.queries = this.queries.slice(-500);
    }
  }

  getStats() {
    const avgDuration = this.queries.reduce((sum, q) => sum + q.duration, 0) / this.queries.length;
    
    return {
      totalQueries: this.queries.length,
      slowQueries: this.slowQueries.length,
      avgDuration: avgDuration.toFixed(2) + 'ms',
      maxDuration: Math.max(...this.queries.map(q => q.duration)) + 'ms'
    };
  }
}
```

### مراقبة الواجهة الأمامية

#### أدوات المراقبة

```javascript
// مراقبة أداء المتصفح
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // مراقبة تحميل الصفحة
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      this.metrics.pageLoad = {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart
      };
      
      this.reportMetrics();
    });

    // مراقبة الذاكرة
    if (performance.memory) {
      setInterval(() => {
        this.metrics.memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }, 30000);
    }
  }

  reportMetrics() {
    console.log('Performance Metrics:', this.metrics);
    
    // إرسال البيانات للخادم
    fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.metrics)
    }).catch(console.error);
  }
}

// استخدام المراقب
const perfMonitor = new PerformanceMonitor();
```

## 🛠️ أدوات التحسين

### أدوات التحليل

#### تحليل قاعدة البيانات

```bash
# تحليل أداء SQLite
sqlite3 data/production.db ".schema"
sqlite3 data/production.db "EXPLAIN QUERY PLAN SELECT * FROM customers WHERE name LIKE '%test%';"
sqlite3 data/production.db "PRAGMA table_info(customers);"
sqlite3 data/production.db "PRAGMA index_list(customers);"
```

#### تحليل الشبكة

```bash
# تحليل الطلبات
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/customers"

# محتوى curl-format.txt:
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                      ----------\n
#           time_total:  %{time_total}\n
```

### أدوات الاختبار

#### اختبار الأداء

```javascript
// اختبار الأداء
class PerformanceTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async testEndpoint(endpoint, iterations = 100) {
    console.log(`Testing ${endpoint}...`);
    
    const promises = [];
    for (let i = 0; i < iterations; i++) {
      promises.push(this.makeRequest(endpoint));
    }
    
    const results = await Promise.all(promises);
    this.analyzeResults(endpoint, results);
  }

  async makeRequest(endpoint) {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const duration = Date.now() - start;
      
      return {
        success: response.ok,
        duration,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - start,
        error: error.message
      };
    }
  }

  analyzeResults(endpoint, results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const durations = successful.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    console.log(`Results for ${endpoint}:`);
    console.log(`  Success Rate: ${(successful.length / results.length * 100).toFixed(2)}%`);
    console.log(`  Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Min Duration: ${minDuration}ms`);
    console.log(`  Max Duration: ${maxDuration}ms`);
    console.log(`  Failed Requests: ${failed.length}`);
  }
}

// استخدام أداة الاختبار
const tester = new PerformanceTester('http://localhost:3000');
tester.testEndpoint('/api/customers', 50);
```

## 📈 أفضل الممارسات

### ممارسات عامة

1. **استخدم الفهارس** للاستعلامات المتكررة
2. **اجمع الطلبات** المتعددة في طلب واحد
3. **استخدم التخزين المؤقت** للبيانات الثابتة
4. **ضغط البيانات** لتقليل حجم النقل
5. **راقب الأداء** باستمرار
6. **حسن الاستعلامات** البطيئة
7. **استخدم التحميل التدريجي** للقوائم الكبيرة
8. **حسن الذاكرة** وتجنب التسريبات

### ممارسات قاعدة البيانات

1. **استخدم Prepared Statements** لتجنب SQL Injection
2. **أضف فهارس** للأعمدة المستخدمة في البحث
3. **حسن أنواع البيانات** لتوفير المساحة
4. **نظف البيانات** القديمة بانتظام
5. **استخدم Transactions** للعمليات المتعددة
6. **راقب الاستعلامات** البطيئة
7. **حسن بنية الجداول** لتقليل التكرار

### ممارسات الخادم

1. **استخدم Compression** لضغط البيانات
2. **فعل التخزين المؤقت** للملفات الثابتة
3. **حسن معالجة الأخطاء** لتجنب التوقف
4. **راقب استخدام الذاكرة** والموارد
5. **استخدم Load Balancing** للتحميل العالي
6. **حسن إعدادات CORS** للأمان
7. **استخدم Rate Limiting** لمنع الإساءة

### ممارسات الواجهة الأمامية

1. **حسن تحميل الصفحة** باستخدام preload
2. **استخدم التحميل التدريجي** للقوائم الكبيرة
3. **حسن البحث** باستخدام debouncing
4. **استخدم التخزين المؤقت** للبيانات
5. **حسن الرسوم المتحركة** للأداء
6. **راقب استخدام الذاكرة** في المتصفح
7. **حسن التحميل** للملفات الكبيرة

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0.0