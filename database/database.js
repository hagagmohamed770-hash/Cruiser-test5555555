const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'data', 'estate_management.db');
        this.db = null;
        this.connected = false;
        
        // Ensure data directory exists
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    async initialize() {
        try {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    return;
                }
                console.log('Connected to SQLite database');
                this.connected = true;
            });

            await this.createTables();
            await this.insertDefaultData();
            
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    async createTables() {
        const tables = [
            // جدول الإعدادات
            `CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // جدول العملاء
            `CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                national_id TEXT,
                address TEXT,
                notes TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // جدول الوحدات
            `CREATE TABLE IF NOT EXISTS units (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                area REAL,
                price REAL,
                location TEXT,
                status TEXT DEFAULT 'available',
                customer_id INTEGER,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )`,

            // جدول الشركاء
            `CREATE TABLE IF NOT EXISTS partners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                national_id TEXT,
                address TEXT,
                share_percentage REAL DEFAULT 0,
                notes TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // جدول شركاء الوحدات
            `CREATE TABLE IF NOT EXISTS unit_partners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                unit_id INTEGER NOT NULL,
                partner_id INTEGER NOT NULL,
                share_percentage REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (unit_id) REFERENCES units (id),
                FOREIGN KEY (partner_id) REFERENCES partners (id)
            )`,

            // جدول العقود
            `CREATE TABLE IF NOT EXISTS contracts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contract_number TEXT UNIQUE NOT NULL,
                unit_id INTEGER NOT NULL,
                customer_id INTEGER NOT NULL,
                contract_type TEXT NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE,
                total_amount REAL NOT NULL,
                down_payment REAL DEFAULT 0,
                monthly_payment REAL DEFAULT 0,
                payment_method TEXT,
                status TEXT DEFAULT 'active',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (unit_id) REFERENCES units (id),
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )`,

            // جدول الأقساط
            `CREATE TABLE IF NOT EXISTS installments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contract_id INTEGER NOT NULL,
                installment_number INTEGER NOT NULL,
                amount REAL NOT NULL,
                due_date DATE NOT NULL,
                paid_date DATE,
                paid_amount REAL DEFAULT 0,
                status TEXT DEFAULT 'pending',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contract_id) REFERENCES contracts (id)
            )`,

            // جدول السماسرة
            `CREATE TABLE IF NOT EXISTS brokers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                national_id TEXT,
                commission_rate REAL DEFAULT 0,
                status TEXT DEFAULT 'active',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // جدول السندات
            `CREATE TABLE IF NOT EXISTS vouchers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                voucher_number TEXT UNIQUE NOT NULL,
                voucher_type TEXT NOT NULL,
                amount REAL NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                related_id INTEGER,
                related_type TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // جدول الخزينة
            `CREATE TABLE IF NOT EXISTS safes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                balance REAL DEFAULT 0,
                currency TEXT DEFAULT 'SAR',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // جدول التحويلات
            `CREATE TABLE IF NOT EXISTS transfers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_safe_id INTEGER,
                to_safe_id INTEGER,
                amount REAL NOT NULL,
                description TEXT,
                date DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (from_safe_id) REFERENCES safes (id),
                FOREIGN KEY (to_safe_id) REFERENCES safes (id)
            )`,

            // جدول ديون الشركاء
            `CREATE TABLE IF NOT EXISTS partner_debts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                partner_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                debt_type TEXT NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                paid_amount REAL DEFAULT 0,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (partner_id) REFERENCES partners (id)
            )`,

            // جدول عمولات السماسرة
            `CREATE TABLE IF NOT EXISTS broker_dues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                broker_id INTEGER NOT NULL,
                contract_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                paid_amount REAL DEFAULT 0,
                due_date DATE,
                paid_date DATE,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (broker_id) REFERENCES brokers (id),
                FOREIGN KEY (contract_id) REFERENCES contracts (id)
            )`,

            // جدول سجل التغييرات
            `CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                record_id INTEGER,
                action TEXT NOT NULL,
                old_values TEXT,
                new_values TEXT,
                user_id INTEGER,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // جدول المستخدمين
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                full_name TEXT,
                role TEXT DEFAULT 'user',
                status TEXT DEFAULT 'active',
                last_login DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const table of tables) {
            await this.run(table);
        }

        // إنشاء الفهارس لتحسين الأداء
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)',
            'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
            'CREATE INDEX IF NOT EXISTS idx_units_status ON units(status)',
            'CREATE INDEX IF NOT EXISTS idx_contracts_customer ON contracts(customer_id)',
            'CREATE INDEX IF NOT EXISTS idx_contracts_unit ON contracts(unit_id)',
            'CREATE INDEX IF NOT EXISTS idx_installments_contract ON installments(contract_id)',
            'CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date)',
            'CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name)',
            'CREATE INDEX IF NOT EXISTS idx_brokers_name ON brokers(name)',
            'CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date)',
            'CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name)',
            'CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at)'
        ];

        for (const index of indexes) {
            await this.run(index);
        }
    }

    async insertDefaultData() {
        try {
            // إدراج الإعدادات الافتراضية
            const defaultSettings = [
                ['theme', 'dark'],
                ['language', 'ar'],
                ['currency', 'SAR'],
                ['company_name', 'شركة إدارة العقارات'],
                ['company_phone', ''],
                ['company_email', ''],
                ['company_address', ''],
                ['backup_auto', 'true'],
                ['backup_interval', '7'],
                ['notifications_enabled', 'true']
            ];

            for (const [key, value] of defaultSettings) {
                await this.run(
                    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
                    [key, value]
                );
            }

            // إنشاء مستخدم افتراضي
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await this.run(
                'INSERT OR IGNORE INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
                ['admin', hashedPassword, 'admin@example.com', 'مدير النظام', 'admin']
            );

            // إنشاء خزينة افتراضية
            await this.run(
                'INSERT OR IGNORE INTO safes (name, balance, currency) VALUES (?, ?, ?)',
                ['الخزينة الرئيسية', 0, 'SAR']
            );

        } catch (error) {
            console.error('Error inserting default data:', error);
        }
    }

    // طرق قاعدة البيانات الأساسية
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // طرق مساعدة
    isConnected() {
        return this.connected;
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed');
                    this.connected = false;
                }
            });
        }
    }

    // نسخ احتياطي
    async backup(backupPath) {
        return new Promise((resolve, reject) => {
            const backup = new sqlite3.Database(backupPath);
            this.db.backup(backup, (err) => {
                if (err) {
                    reject(err);
                } else {
                    backup.close();
                    resolve();
                }
            });
        });
    }

    // استعادة من نسخة احتياطية
    async restore(backupPath) {
        return new Promise((resolve, reject) => {
            const backup = new sqlite3.Database(backupPath);
            backup.backup(this.db, (err) => {
                if (err) {
                    reject(err);
                } else {
                    backup.close();
                    resolve();
                }
            });
        });
    }
}

module.exports = Database;