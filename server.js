const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Import database and routes
const Database = require('./database/database');
const authRoutes = require('./routes/auth');
const customersRoutes = require('./routes/customers');
const unitsRoutes = require('./routes/units');
const contractsRoutes = require('./routes/contracts');
const installmentsRoutes = require('./routes/installments');
const partnersRoutes = require('./routes/partners');
const brokersRoutes = require('./routes/brokers');
const vouchersRoutes = require('./routes/vouchers');
const treasuryRoutes = require('./routes/treasury');
const reportsRoutes = require('./routes/reports');
const backupRoutes = require('./routes/backup');
const auditRoutes = require('./routes/audit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'تم تجاوز الحد المسموح للطلبات، يرجى المحاولة لاحقاً'
    }
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Database initialization
const db = new Database();
db.initialize();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/installments', installmentsRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/brokers', brokersRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/audit', auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '5.0.0',
        database: db.isConnected() ? 'Connected' : 'Disconnected'
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'الصفحة غير موجودة',
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'حدث خطأ في الخادم' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    db.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    db.close();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Real Estate Management System v5.0.0`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});

module.exports = app;