# 📥 تعليمات التحميل - نظام إدارة الاستثمار العقاري

## 🎯 الملف الجاهز للتحميل

**اسم الملف**: `real-estate-system-complete.zip`  
**الحجم**: 174 KB  
**الإصدار**: 5.0.0  
**التاريخ**: 2025-08-20

## 📦 محتويات الملف

### 📁 الملفات الأساسية:
- `server.js` - الخادم الرئيسي
- `package.json` - إعدادات المشروع
- `start.sh` - سكريبت التشغيل التلقائي
- `.env.example` - مثال المتغيرات البيئية
- `README.md` - الدليل الرئيسي
- `QUICK_DOWNLOAD_README.md` - دليل سريع

### 📁 المجلدات:
- `database/` - قاعدة البيانات SQLite
- `public/` - الواجهة الأمامية (3 ملفات)
- `routes/` - مسارات API (12 ملف)
- `utils/` - مساعدات النظام
- `docs/` - التوثيق الشامل (21 ملف)

### 📁 ملفات Docker:
- `Dockerfile` - صورة Docker
- `docker-compose.yml` - إعداد Docker Compose

### 📁 ملفات التوثيق:
- `QUICK_START.md` - دليل البدء السريع
- `DEPLOYMENT.md` - دليل النشر
- `SUPPORT.md` - دليل الدعم
- `SECURITY.md` - سياسة الأمان
- `CHANGELOG.md` - سجل التحديثات
- `ROADMAP.md` - خطة التطوير

## ⚡ خطوات التحميل والتشغيل

### 1️⃣ **تحميل الملف**
```bash
# إذا كان الملف متاح على الخادم
wget http://your-server.com/real-estate-system-complete.zip

# أو نسخ الملف مباشرة
cp real-estate-system-complete.zip /path/to/destination/
```

### 2️⃣ **فك الضغط**
```bash
unzip real-estate-system-complete.zip
cd real-estate-system-complete
```

### 3️⃣ **التشغيل السريع**
```bash
# الطريقة الأولى - سكريبت التشغيل التلقائي
chmod +x start.sh
./start.sh
```

### 4️⃣ **التشغيل اليدوي**
```bash
# الطريقة الثانية - يدوياً
npm install
npm start
```

### 5️⃣ **التشغيل بـ Docker**
```bash
# الطريقة الثالثة - Docker
docker-compose up -d
```

## 🔑 بيانات الدخول
- **الرابط**: http://localhost:3000
- **اسم المستخدم**: admin
- **كلمة المرور**: admin123

## 📋 المتطلبات
- **Node.js**: 16.0.0 أو أحدث
- **npm**: 8.0.0 أو أحدث
- **المتصفح**: حديث يدعم ES6+

## 🎯 الميزات المتاحة

### 📊 إدارة البيانات:
- ✅ العملاء والوحدات العقارية
- ✅ العقود والأقساط
- ✅ الشركاء والسماسرة
- ✅ الخزينة والتحويلات

### 🔒 الأمان:
- ✅ نظام JWT آمن
- ✅ تشفير كلمات المرور
- ✅ حماية من الهجمات
- ✅ سجل التغييرات

### 📈 التقارير:
- ✅ لوحة تحكم شاملة
- ✅ تقارير مالية وإدارية
- ✅ إحصائيات مفصلة

### 🎨 الواجهة:
- ✅ تصميم حديث ومتجاوب
- ✅ دعم الوضع الداكن والفاتح
- ✅ دعم كامل للغة العربية (RTL)

## 🚀 أوامر سريعة

### **تشغيل فوري:**
```bash
unzip real-estate-system-complete.zip
cd real-estate-system-complete
chmod +x start.sh && ./start.sh
```

### **تشغيل بـ Docker:**
```bash
unzip real-estate-system-complete.zip
cd real-estate-system-complete
docker-compose up -d
```

### **تشغيل يدوي:**
```bash
unzip real-estate-system-complete.zip
cd real-estate-system-complete
npm install && npm start
```

## 📞 الدعم والمساعدة

### **في حالة المشاكل:**
1. راجع ملف `README.md`
2. راجع ملف `QUICK_START.md`
3. راجع ملف `SUPPORT.md`
4. راجع مجلد `docs/`
5. راجع ملف `TROUBLESHOOTING.md`

### **معلومات الاتصال:**
- **البريد الإلكتروني**: support@realestate.com
- **الهاتف**: +966-50-123-4567

## 🔧 ملاحظات مهمة

### **قبل التشغيل:**
- تأكد من تثبيت Node.js
- تأكد من وجود مساحة كافية
- تأكد من إغلاق المنفذ 3000

### **بعد التشغيل:**
- تأكد من فتح المتصفح
- تأكد من تسجيل الدخول
- تأكد من تغيير كلمة المرور الافتراضية

### **للإنتاج:**
- غيّر JWT_SECRET في ملف .env
- استخدم HTTPS
- قم بإعداد النسخ الاحتياطية

---

## 🎊 تهانينا!

**النظام جاهز للاستخدام الفوري!**

**🚀 اتبع الخطوات أعلاه وابدأ الاستخدام فوراً!**

**📋 راجع ملف `QUICK_DOWNLOAD_README.md` داخل الملف المضغوط للحصول على دليل سريع.**