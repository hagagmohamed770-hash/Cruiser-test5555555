const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const Database = require('../database/database');

// إنشاء تطبيق Express
const app = express();

// إعدادات الأمان
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.'
  }
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// تهيئة قاعدة البيانات
const db = new Database();
db.init().then(() => {
  console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
}).catch(err => {
  console.error('❌ خطأ في تهيئة قاعدة البيانات:', err);
});

// استيراد المسارات
const authRoutes = require('../routes/auth');
const customerRoutes = require('../routes/customers');
const unitRoutes = require('../routes/units');
const contractRoutes = require('../routes/contracts');
const installmentRoutes = require('../routes/installments');
const partnerRoutes = require('../routes/partners');
const brokerRoutes = require('../routes/brokers');
const voucherRoutes = require('../routes/vouchers');
const treasuryRoutes = require('../routes/treasury');
const reportRoutes = require('../routes/reports');
const backupRoutes = require('../routes/backup');
const auditRoutes = require('../routes/audit');

// تسجيل المسارات
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/audit', auditRoutes);

// فحص صحة الخادم
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'الخادم يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    version: '5.0.0'
  });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم:', err);
  res.status(500).json({
    success: false,
    message: 'خطأ داخلي في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;