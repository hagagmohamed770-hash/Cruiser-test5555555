# 🌐 دليل النشر على المواقع المجانية

## 🚀 أفضل المواقع المجانية

### 1️⃣ **Render (الأفضل)**
**المميزات:**
- ✅ 750 ساعة مجانية شهرياً
- ✅ دعم Node.js كامل
- ✅ قاعدة بيانات PostgreSQL مجانية
- ✅ SSL مجاني
- ✅ نطاق فرعي مجاني
- ✅ نشر تلقائي من GitHub

**كيفية النشر:**
```bash
# 1. إنشاء حساب على Render
# https://render.com

# 2. ربط GitHub
# 3. اختيار "New Web Service"
# 4. اختيار الريبو
# 5. إعدادات النشر:
#    - Build Command: npm install
#    - Start Command: npm start
#    - Environment Variables:
#      - NODE_ENV=production
#      - PORT=10000
#      - JWT_SECRET=your-secret-key
```

### 2️⃣ **Railway**
**المميزات:**
- ✅ 500 ساعة مجانية شهرياً
- ✅ دعم Node.js
- ✅ قاعدة بيانات مجانية
- ✅ SSL مجاني
- ✅ نطاق فرعي مجاني

**كيفية النشر:**
```bash
# 1. إنشاء حساب على Railway
# https://railway.app

# 2. ربط GitHub
# 3. اختيار "Deploy from GitHub repo"
# 4. إعداد Environment Variables
```

### 3️⃣ **Heroku (محدود)**
**المميزات:**
- ✅ 550 ساعة مجانية شهرياً
- ✅ دعم Node.js
- ✅ SSL مجاني
- ⚠️ لا يدعم قاعدة بيانات مجانية

**كيفية النشر:**
```bash
# 1. إنشاء حساب على Heroku
# https://heroku.com

# 2. تثبيت Heroku CLI
npm install -g heroku

# 3. تسجيل الدخول
heroku login

# 4. إنشاء تطبيق
heroku create your-app-name

# 5. إضافة متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# 6. النشر
git push heroku main
```

### 4️⃣ **Vercel**
**المميزات:**
- ✅ غير محدود للمشاريع الشخصية
- ✅ دعم Node.js
- ✅ SSL مجاني
- ✅ نطاق فرعي مجاني
- ⚠️ لا يدعم قاعدة بيانات

**كيفية النشر:**
```bash
# 1. إنشاء حساب على Vercel
# https://vercel.com

# 2. ربط GitHub
# 3. اختيار الريبو
# 4. إعدادات النشر تلقائية
```

### 5️⃣ **Netlify**
**المميزات:**
- ✅ غير محدود للمشاريع الشخصية
- ✅ SSL مجاني
- ✅ نطاق فرعي مجاني
- ⚠️ لا يدعم Node.js بشكل كامل

## 🎯 التوصية: Render

### **لماذا Render؟**
- ✅ يدعم قاعدة بيانات PostgreSQL مجانية
- ✅ سهل الاستخدام
- ✅ دعم كامل لـ Node.js
- ✅ SSL مجاني
- ✅ نطاق فرعي مجاني

## 📋 خطوات النشر على Render

### 1️⃣ **إعداد المشروع**

#### **إنشاء ملف `render.yaml`:**
```yaml
services:
  - type: web
    name: real-estate-system
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        generateValue: true
      - key: DB_PATH
        value: ./data/real_estate.db
```

#### **تعديل `package.json`:**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

#### **إنشاء ملف `Procfile`:**
```
web: npm start
```

### 2️⃣ **إعداد قاعدة البيانات**

#### **لـ Render (PostgreSQL):**
```javascript
// تعديل database.js ليدعم PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

#### **لـ SQLite (محلي):**
```javascript
// استخدام SQLite للمطورين
const sqlite3 = require('sqlite3');
```

### 3️⃣ **إعداد Environment Variables**

#### **متغيرات مطلوبة:**
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-very-strong-secret-key
DATABASE_URL=your-database-url
COMPANY_NAME=شركة إدارة الاستثمار العقاري
```

### 4️⃣ **خطوات النشر**

#### **الخطوة 1: إنشاء حساب Render**
1. اذهب إلى https://render.com
2. سجل حساب جديد
3. اربط حساب GitHub

#### **الخطوة 2: إنشاء Web Service**
1. انقر على "New Web Service"
2. اختر "Connect a repository"
3. اختر الريبو الخاص بك
4. املأ المعلومات:
   - **Name**: real-estate-system
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### **الخطوة 3: إعداد Environment Variables**
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-secret-key-here
COMPANY_NAME=شركة إدارة الاستثمار العقاري
```

#### **الخطوة 4: النشر**
1. انقر على "Create Web Service"
2. انتظر حتى يكتمل البناء
3. النظام سيكون متاح على: `https://your-app-name.onrender.com`

## 🔧 إعدادات إضافية

### **إعداد قاعدة البيانات PostgreSQL:**

#### **إنشاء قاعدة بيانات على Render:**
1. اذهب إلى "New PostgreSQL"
2. اختر "Create Database"
3. انسخ `DATABASE_URL`
4. أضفه إلى Environment Variables

#### **تعديل الكود ليدعم PostgreSQL:**
```javascript
// database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// استخدام pool بدلاً من sqlite3
```

### **إعداد CORS:**
```javascript
// server.js
app.use(cors({
  origin: ['https://your-app-name.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
```

## 📱 النشر على مواقع أخرى

### **Railway:**
```bash
# 1. إنشاء حساب على Railway
# 2. ربط GitHub
# 3. اختيار الريبو
# 4. إعداد Environment Variables
# 5. النشر تلقائي
```

### **Heroku:**
```bash
# 1. إنشاء حساب على Heroku
# 2. تثبيت Heroku CLI
npm install -g heroku

# 3. تسجيل الدخول
heroku login

# 4. إنشاء تطبيق
heroku create your-app-name

# 5. إضافة متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# 6. النشر
git push heroku main
```

## 🔒 الأمان

### **إعدادات الأمان:**
```javascript
// server.js
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
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

### **Environment Variables مهمة:**
```env
JWT_SECRET=your-very-strong-secret-key
NODE_ENV=production
DATABASE_URL=your-database-url
```

## 📊 مراقبة الأداء

### **مراقبة التطبيق:**
- Render Dashboard
- Logs في الوقت الفعلي
- Metrics للأداء
- Error tracking

### **أدوات مراقبة إضافية:**
```javascript
// إضافة logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🎊 النتيجة النهائية

**🌐 النظام متاح على الإنترنت:**
- **الرابط**: https://your-app-name.onrender.com
- **SSL**: مجاني
- **قاعدة البيانات**: PostgreSQL مجانية
- **النطاق**: فرعي مجاني

**📱 يمكن الوصول من أي جهاز:**
- الهاتف
- الكمبيوتر
- التابلت

**🔑 بيانات الدخول:**
- **المستخدم**: admin
- **كلمة المرور**: admin123

---

## 🚀 ابدأ النشر الآن!

**1. اختر Render (الأفضل)**
**2. اتبع الخطوات أعلاه**
**3. استمتع بنظامك على الإنترنت!**