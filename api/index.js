const express = require('express');
const cors = require('cors');

// إنشاء تطبيق Express
const app = express();

// Middleware أساسي مع معالجة الأخطاء
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم:', err);
  res.status(500).json({
    success: false,
    message: 'خطأ داخلي في الخادم'
  });
});

// فحص صحة الخادم
app.get('/api/health', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'الخادم يعمل بشكل طبيعي',
      timestamp: new Date().toISOString(),
      version: '5.0.0'
    });
  } catch (error) {
    console.error('خطأ في health check:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في فحص صحة الخادم'
    });
  }
});

// تسجيل دخول بسيط
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: 1,
          username: 'admin',
          name: 'مدير النظام',
          role: 'admin'
        },
        token: 'vercel-token-2025'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تسجيل الدخول'
    });
  }
});

// بيانات تجريبية للعملاء
app.get('/api/customers', (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'أحمد محمد',
          phone: '+966-50-123-4567',
          email: 'ahmed@example.com',
          address: 'الرياض، المملكة العربية السعودية',
          created_at: '2025-01-27T10:00:00.000Z'
        }
      ]
    });
  } catch (error) {
    console.error('خطأ في تحميل العملاء:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل العملاء'
    });
  }
});

// بيانات تجريبية للوحدات
app.get('/api/units', (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'وحدة سكنية 1',
          type: 'شقة',
          area: 120,
          price: 500000,
          status: 'متاح',
          created_at: '2025-01-27T10:00:00.000Z'
        }
      ]
    });
  } catch (error) {
    console.error('خطأ في تحميل الوحدات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل الوحدات'
    });
  }
});

// بيانات تجريبية للعقود
app.get('/api/contracts', (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: 1,
          customer_id: 1,
          unit_id: 1,
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          total_amount: 500000,
          status: 'نشط',
          created_at: '2025-01-27T10:00:00.000Z'
        }
      ]
    });
  } catch (error) {
    console.error('خطأ في تحميل العقود:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل العقود'
    });
  }
});

// بيانات تجريبية للخزينة
app.get('/api/treasury', (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'الخزينة الرئيسية',
          balance: 1000000,
          currency: 'ريال',
          status: 'نشط',
          created_at: '2025-01-27T10:00:00.000Z'
        }
      ]
    });
  } catch (error) {
    console.error('خطأ في تحميل الخزينة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل الخزينة'
    });
  }
});

// تقارير تجريبية
app.get('/api/reports', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        total_customers: 1,
        total_units: 1,
        total_contracts: 1,
        total_revenue: 500000,
        monthly_stats: [
          { month: 'يناير', revenue: 500000 }
        ]
      }
    });
  } catch (error) {
    console.error('خطأ في تحميل التقارير:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل التقارير'
    });
  }
});

// معالجة المسارات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود'
  });
});

module.exports = app;