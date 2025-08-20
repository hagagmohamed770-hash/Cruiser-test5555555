# استكشاف الأخطاء - نظام إدارة الاستثمار العقاري

هذا الدليل يساعدك في حل المشاكل الشائعة التي قد تواجهها عند استخدام النظام.

## 📋 جدول المحتويات

- [مشاكل التثبيت](#مشاكل-التثبيت)
- [مشاكل التشغيل](#مشاكل-التشغيل)
- [مشاكل قاعدة البيانات](#مشاكل-قاعدة-البيانات)
- [مشاكل الشبكة](#مشاكل-الشبكة)
- [مشاكل الأمان](#مشاكل-الأمان)
- [مشاكل الأداء](#مشاكل-الأداء)
- [مشاكل الواجهة الأمامية](#مشاكل-الواجهة-الأمامية)
- [مشاكل Docker](#مشاكل-docker)
- [مشاكل النشر](#مشاكل-النشر)

## 🔧 مشاكل التثبيت

### مشكلة: "Node.js is not installed"

**الأعراض**: خطأ عند تشغيل `npm install` أو `node --version`

**الحلول**:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# macOS
brew install node

# Windows
# قم بتحميل Node.js من https://nodejs.org
```

### مشكلة: "npm install failed"

**الأعراض**: فشل في تثبيت التبعيات

**الحلول**:
```bash
# تنظيف الـ cache
npm cache clean --force

# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install

# استخدام yarn بدلاً من npm
npm install -g yarn
yarn install
```

### مشكلة: "Permission denied"

**الأعراض**: خطأ في الصلاحيات عند التثبيت

**الحلول**:
```bash
# تغيير مالك المجلد
sudo chown -R $USER:$USER .

# أو استخدام sudo (غير مستحسن)
sudo npm install

# أو تغيير مسار npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## 🚀 مشاكل التشغيل

### مشكلة: "Port 3000 is already in use"

**الأعراض**: لا يمكن تشغيل الخادم على المنفذ 3000

**الحلول**:
```bash
# إيجاد العملية التي تستخدم المنفذ
lsof -i :3000

# إيقاف العملية
kill -9 <PID>

# أو تغيير المنفذ في ملف .env
PORT=3001
```

### مشكلة: "Cannot find module"

**الأعراض**: خطأ في العثور على وحدة معينة

**الحلول**:
```bash
# إعادة تثبيت التبعيات
npm install

# فحص package.json
cat package.json

# تثبيت الوحدة المفقودة
npm install <module-name>
```

### مشكلة: "EADDRINUSE"

**الأعراض**: المنفذ مشغول من عملية أخرى

**الحلول**:
```bash
# إيجاد جميع العمليات على المنفذ
netstat -tulpn | grep :3000

# إيقاف جميع عمليات Node.js
pkill -f node

# أو إيقاف عملية محددة
kill -9 <PID>
```

## 🗄️ مشاكل قاعدة البيانات

### مشكلة: "Database locked"

**الأعراض**: لا يمكن الوصول لقاعدة البيانات

**الحلول**:
```bash
# إيقاف جميع العمليات
pkill -f node

# فحص العمليات المتبقية
ps aux | grep sqlite

# إعادة تشغيل النظام
npm start

# أو إعادة تهيئة قاعدة البيانات
npm run init-db
```

### مشكلة: "Database file not found"

**الأعراض**: ملف قاعدة البيانات غير موجود

**الحلول**:
```bash
# إنشاء مجلد البيانات
mkdir -p data

# إعادة تهيئة قاعدة البيانات
npm run init-db

# فحص الملفات
ls -la data/
```

### مشكلة: "SQLite version mismatch"

**الأعراض**: مشاكل في إصدار SQLite

**الحلول**:
```bash
# فحص إصدار SQLite
sqlite3 --version

# تحديث SQLite
# Ubuntu/Debian
sudo apt update && sudo apt install sqlite3

# أو استخدام إصدار محدد من Node.js
nvm install 18.17.0
nvm use 18.17.0
```

### مشكلة: "Database corruption"

**الأعراض**: بيانات تالفة في قاعدة البيانات

**الحلول**:
```bash
# فحص سلامة قاعدة البيانات
sqlite3 data/production.db "PRAGMA integrity_check;"

# إصلاح قاعدة البيانات
sqlite3 data/production.db "VACUUM;"

# استعادة من نسخة احتياطية
cp backups/latest_backup.sqlite data/production.db
```

## 🌐 مشاكل الشبكة

### مشكلة: "Cannot connect to server"

**الأعراض**: لا يمكن الاتصال بالخادم

**الحلول**:
```bash
# فحص حالة الخادم
curl http://localhost:3000/health

# فحص المنافذ المفتوحة
netstat -tulpn | grep :3000

# فحص جدار الحماية
sudo ufw status
sudo ufw allow 3000
```

### مشكلة: "CORS error"

**الأعراض**: خطأ في CORS عند الوصول من متصفح

**الحلول**:
```bash
# فحص إعدادات CORS في server.js
# تأكد من إضافة:
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
```

### مشكلة: "Network timeout"

**الأعراض**: انتهاء مهلة الاتصال

**الحلول**:
```bash
# زيادة مهلة الاتصال
# في ملف .env
REQUEST_TIMEOUT=30000

# أو في الكود
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

## 🔒 مشاكل الأمان

### مشكلة: "JWT token invalid"

**الأعراض**: خطأ في التوكن

**الحلول**:
```bash
# فحص JWT_SECRET في ملف .env
echo $JWT_SECRET

# إعادة إنشاء JWT_SECRET
openssl rand -base64 32

# تحديث ملف .env
JWT_SECRET=your_new_secret_here
```

### مشكلة: "Authentication failed"

**الأعراض**: فشل في تسجيل الدخول

**الحلول**:
```bash
# إعادة تعيين كلمة مرور المستخدم
sqlite3 data/production.db
UPDATE users SET password = '$2a$10$new_hashed_password' WHERE username = 'admin';

# أو إنشاء مستخدم جديد
INSERT INTO users (username, password, role) VALUES ('admin', '$2a$10$hashed_password', 'admin');
```

### مشكلة: "Rate limit exceeded"

**الأعراض**: تجاوز حد الطلبات

**الحلول**:
```bash
# تعديل إعدادات Rate Limiting في ملف .env
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# أو إيقاف Rate Limiting مؤقتاً
# في server.js، علق السطر:
// app.use(rateLimit({...}));
```

## ⚡ مشاكل الأداء

### مشكلة: "Server is slow"

**الأعراض**: بطء في الاستجابة

**الحلول**:
```bash
# فحص استخدام الموارد
htop
free -h
df -h

# تحسين قاعدة البيانات
sqlite3 data/production.db "VACUUM;"
sqlite3 data/production.db "ANALYZE;"

# إضافة فهارس
sqlite3 data/production.db "CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);"
```

### مشكلة: "High memory usage"

**الأعراض**: استهلاك عالي للذاكرة

**الحلول**:
```bash
# فحص استخدام الذاكرة
ps aux | grep node

# إعادة تشغيل الخادم
pm2 restart real-estate-system

# أو إضافة حد للذاكرة
pm2 start server.js --max-memory-restart 1G
```

### مشكلة: "Database queries are slow"

**الأعراض**: بطء في استعلامات قاعدة البيانات

**الحلول**:
```bash
# فحص الاستعلامات البطيئة
sqlite3 data/production.db "EXPLAIN QUERY PLAN SELECT * FROM customers WHERE name LIKE '%test%';"

# إضافة فهارس
sqlite3 data/production.db "
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_units_type ON units(type);
CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON contracts(customer_id);
"
```

## 🎨 مشاكل الواجهة الأمامية

### مشكلة: "Page not loading"

**الأعراض**: الصفحة لا تتحمل

**الحلول**:
```bash
# فحص ملفات الواجهة الأمامية
ls -la public/

# فحص السجلات
tail -f logs/server.log

# إعادة تشغيل الخادم
npm restart
```

### مشكلة: "JavaScript errors"

**الأعراض**: أخطاء في JavaScript

**الحلول**:
```bash
# فحص وحدة التحكم في المتصفح
# اضغط F12 وانتقل إلى Console

# فحص ملف app.js
cat public/app.js

# إعادة تحميل الصفحة
# اضغط Ctrl+F5
```

### مشكلة: "CSS not loading"

**الأعراض**: التصميم لا يظهر

**الحلول**:
```bash
# فحص ملف CSS
ls -la public/style.css

# فحص مسار الملفات في HTML
grep -r "style.css" public/

# مسح ذاكرة التخزين المؤقت للمتصفح
# اضغط Ctrl+Shift+R
```

## 🐳 مشاكل Docker

### مشكلة: "Docker not installed"

**الأعراض**: خطأ عند تشغيل docker-compose

**الحلول**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# macOS
brew install docker docker-compose

# Windows
# قم بتحميل Docker Desktop من https://docker.com
```

### مشكلة: "Docker build failed"

**الأعراض**: فشل في بناء صورة Docker

**الحلول**:
```bash
# تنظيف الصور القديمة
docker system prune -a

# إعادة بناء الصورة
docker build --no-cache -t real-estate-system .

# فحص Dockerfile
cat Dockerfile
```

### مشكلة: "Container not starting"

**الأعراض**: الحاوية لا تبدأ

**الحلول**:
```bash
# فحص السجلات
docker-compose logs

# فحص حالة الحاويات
docker ps -a

# إعادة تشغيل الحاويات
docker-compose down
docker-compose up -d
```

### مشكلة: "Volume mounting failed"

**الأعراض**: مشاكل في ربط المجلدات

**الحلول**:
```bash
# فحص الصلاحيات
ls -la data/ backups/

# تغيير الصلاحيات
chmod 755 data/ backups/

# أو استخدام sudo
sudo chown -R 1000:1000 data/ backups/
```

## 🚀 مشاكل النشر

### مشكلة: "PM2 not installed"

**الأعراض**: خطأ عند تشغيل pm2

**الحلول**:
```bash
# تثبيت PM2
npm install -g pm2

# أو استخدام npx
npx pm2 start server.js
```

### مشكلة: "Nginx configuration error"

**الأعراض**: خطأ في إعداد Nginx

**الحلول**:
```bash
# فحص إعدادات Nginx
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx

# فحص السجلات
sudo tail -f /var/log/nginx/error.log
```

### مشكلة: "SSL certificate issues"

**الأعراض**: مشاكل في شهادة SSL

**الحلول**:
```bash
# تجديد شهادة Let's Encrypt
sudo certbot renew

# فحص الشهادة
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

## 📊 أدوات التشخيص

### فحص حالة النظام

```bash
# فحص إصدارات البرامج
node --version
npm --version
sqlite3 --version

# فحص استخدام الموارد
htop
free -h
df -h

# فحص الشبكة
netstat -tulpn
ss -tulpn
```

### فحص السجلات

```bash
# سجلات الخادم
tail -f logs/server.log

# سجلات قاعدة البيانات
tail -f logs/database.log

# سجلات النظام
journalctl -u real-estate-system -f

# سجلات Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### فحص قاعدة البيانات

```bash
# فحص سلامة قاعدة البيانات
sqlite3 data/production.db "PRAGMA integrity_check;"

# فحص حجم قاعدة البيانات
ls -lh data/production.db

# فحص الجداول
sqlite3 data/production.db ".tables"

# فحص الفهارس
sqlite3 data/production.db ".indexes"
```

## 🆘 الحصول على المساعدة

### قبل طلب المساعدة

1. **جرب الحلول المذكورة أعلاه**
2. **جمع المعلومات التالية**:
   - إصدار النظام
   - رسالة الخطأ الكاملة
   - سجلات النظام
   - خطوات إعادة الإنتاج

### قنوات المساعدة

- **GitHub Issues**: للإبلاغ عن الأخطاء
- **GitHub Discussions**: للأسئلة العامة
- **البريد الإلكتروني**: `support@your-domain.com`
- **التوثيق**: راجع الملفات الأخرى في مجلد docs/

### معلومات مفيدة للمساعدة

```bash
# معلومات النظام
uname -a
cat /etc/os-release

# معلومات Node.js
node --version
npm --version

# معلومات قاعدة البيانات
sqlite3 --version

# معلومات Docker
docker --version
docker-compose --version
```

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0.0