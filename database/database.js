const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

class Database {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(__dirname, '..', 'data', 'real_estate.db');
    this.db = null;
    this.ensureDataDirectory();
  }

  // التأكد من وجود مجلد البيانات
  ensureDataDirectory() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // تهيئة قاعدة البيانات
  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('خطأ في الاتصال بقاعدة البيانات:', err);
          reject(err);
        } else {
          console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
          this.createTables()
            .then(() => this.insertDefaultData())
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  // إنشاء الجداول
  async createTables() {
    const tables = [
      // جدول المستخدمين
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // جدول العملاء
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
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
        price REAL NOT NULL,
        location TEXT,
        description TEXT,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // جدول العقود
      `CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        unit_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        total_amount REAL NOT NULL,
        down_payment REAL DEFAULT 0,
        monthly_payment REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (unit_id) REFERENCES units (id)
      )`,

      // جدول الأقساط
      `CREATE TABLE IF NOT EXISTS installments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        due_date DATE NOT NULL,
        paid_date DATE,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
      )`,

      // جدول الشركاء
      `CREATE TABLE IF NOT EXISTS partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        share_percentage REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // جدول السماسرة
      `CREATE TABLE IF NOT EXISTS brokers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        commission_rate REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // جدول الإيصالات
      `CREATE TABLE IF NOT EXISTS vouchers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        safe_id INTEGER,
        contract_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (safe_id) REFERENCES safes (id),
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
      )`,

      // جدول الخزائن
      `CREATE TABLE IF NOT EXISTS safes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // جدول التحويلات
      `CREATE TABLE IF NOT EXISTS transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_safe_id INTEGER NOT NULL,
        to_safe_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_safe_id) REFERENCES safes (id),
        FOREIGN KEY (to_safe_id) REFERENCES safes (id)
      )`,

      // جدول ديون الشركاء
      `CREATE TABLE IF NOT EXISTS partner_debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partner_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (partner_id) REFERENCES partners (id)
      )`,

      // جدول مستحقات السماسرة
      `CREATE TABLE IF NOT EXISTS broker_dues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        broker_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        contract_id INTEGER,
        date DATE NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (broker_id) REFERENCES brokers (id),
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
      )`,

      // جدول سجل التغييرات
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id INTEGER,
        old_data TEXT,
        new_data TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // جدول الإعدادات
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // إنشاء الفهارس للأداء
    await this.createIndexes();
  }

  // إنشاء الفهارس
  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)',
      'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
      'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)',
      'CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status)',
      
      'CREATE INDEX IF NOT EXISTS idx_units_type ON units(type)',
      'CREATE INDEX IF NOT EXISTS idx_units_status ON units(status)',
      'CREATE INDEX IF NOT EXISTS idx_units_price ON units(price)',
      
      'CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON contracts(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_unit_id ON contracts(unit_id)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON contracts(start_date)',
      
      'CREATE INDEX IF NOT EXISTS idx_installments_contract_id ON installments(contract_id)',
      'CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status)',
      'CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date)',
      
      'CREATE INDEX IF NOT EXISTS idx_vouchers_type ON vouchers(type)',
      'CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date)',
      'CREATE INDEX IF NOT EXISTS idx_vouchers_safe_id ON vouchers(safe_id)',
      
      'CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action)',
      'CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name)',
      'CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at)'
    ];

    for (const index of indexes) {
      await this.run(index);
    }
  }

  // إدخال البيانات الافتراضية
  async insertDefaultData() {
    // التحقق من وجود المستخدم الافتراضي
    const adminUser = await this.get('SELECT * FROM users WHERE username = ?', ['admin']);
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.run(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'مدير النظام', 'admin']
      );
      console.log('✅ تم إنشاء المستخدم الافتراضي');
    }

    // التحقق من وجود الخزينة الرئيسية
    const mainSafe = await this.get('SELECT * FROM safes WHERE name = ?', ['الخزينة الرئيسية']);
    if (!mainSafe) {
      await this.run(
        'INSERT INTO safes (name, balance, description) VALUES (?, ?, ?)',
        ['الخزينة الرئيسية', 0, 'الخزينة الرئيسية للنظام']
      );
      console.log('✅ تم إنشاء الخزينة الرئيسية');
    }

    // إدخال الإعدادات الافتراضية
    const defaultSettings = [
      ['company_name', 'شركة إدارة الاستثمار العقاري', 'اسم الشركة'],
      ['company_phone', '', 'هاتف الشركة'],
      ['company_email', '', 'بريد الشركة الإلكتروني'],
      ['company_address', '', 'عنوان الشركة'],
      ['currency', 'ريال', 'العملة المستخدمة'],
      ['backup_auto', 'true', 'النسخ الاحتياطية التلقائية'],
      ['backup_interval', 'daily', 'فترة النسخ الاحتياطية'],
      ['theme', 'light', 'المظهر الافتراضي']
    ];

    for (const [key, value, description] of defaultSettings) {
      const setting = await this.get('SELECT * FROM settings WHERE key = ?', [key]);
      if (!setting) {
        await this.run(
          'INSERT INTO settings (key, value, description) VALUES (?, ?, ?)',
          [key, value, description]
        );
      }
    }
    console.log('✅ تم إدخال الإعدادات الافتراضية');
  }

  // تنفيذ استعلام بدون إرجاع نتائج
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('خطأ في تنفيذ الاستعلام:', err);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // جلب صف واحد
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('خطأ في جلب البيانات:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // جلب جميع الصفوف
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('خطأ في جلب البيانات:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // إنشاء نسخة احتياطية
  async backup(backupPath) {
    return new Promise((resolve, reject) => {
      const backup = new sqlite3.Database(backupPath);
      this.db.backup(backup)
        .then(() => {
          backup.close();
          resolve();
        })
        .catch(reject);
    });
  }

  // استعادة من نسخة احتياطية
  async restore(backupPath) {
    return new Promise((resolve, reject) => {
      const backup = new sqlite3.Database(backupPath);
      backup.backup(this.db)
        .then(() => {
          backup.close();
          resolve();
        })
        .catch(reject);
    });
  }

  // إغلاق الاتصال
  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('خطأ في إغلاق قاعدة البيانات:', err);
          } else {
            console.log('✅ تم إغلاق قاعدة البيانات');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // التحقق من حالة الاتصال
  isConnected() {
    return this.db !== null;
  }
}

module.exports = Database;