# 📱 تشغيل نظام إدارة الاستثمار العقاري على Termux

## 🚀 دليل التثبيت والتشغيل

### 1️⃣ **تحديث Termux وتثبيت المتطلبات**

```bash
# تحديث Termux
pkg update && pkg upgrade -y

# تثبيت المتطلبات الأساسية
pkg install -y nodejs npm git wget unzip

# تثبيت Python (اختياري للخادم المحلي)
pkg install -y python

# تثبيت أدوات إضافية
pkg install -y nano vim curl
```

### 2️⃣ **تحميل النظام**

#### **الطريقة الأولى - تحميل مباشر:**
```bash
# إنشاء مجلد للمشروع
mkdir ~/real-estate-system
cd ~/real-estate-system

# تحميل الملف من GitHub
wget https://github.com/hagagmohamed770-hash/Cruiser-test5555555/raw/release/v5.0.0-complete/real-estate-system-complete.zip

# فك الضغط
unzip real-estate-system-complete.zip
```

#### **الطريقة الثانية - نسخ من Git:**
```bash
# نسخ المشروع
git clone -b release/v5.0.0-complete https://github.com/hagagmohamed770-hash/Cruiser-test5555555.git
cd Cruiser-test5555555
```

### 3️⃣ **تثبيت التبعيات**

```bash
# تثبيت التبعيات
npm install

# أو إذا كان هناك مشاكل في التثبيت
npm install --force
```

### 4️⃣ **إعداد قاعدة البيانات**

```bash
# إنشاء مجلد البيانات
mkdir -p data

# إنشاء ملف .env
cp .env.example .env

# تعديل ملف .env
nano .env
```

#### **محتوى ملف .env:**
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
DB_PATH=./data/real_estate.db
BACKUP_DIR=./backups
COMPANY_NAME=شركة إدارة الاستثمار العقاري
```

### 5️⃣ **تشغيل النظام**

#### **الطريقة الأولى - سكريبت التشغيل:**
```bash
# إعطاء صلاحيات التنفيذ
chmod +x start.sh

# تشغيل النظام
./start.sh
```

#### **الطريقة الثانية - تشغيل يدوي:**
```bash
# تشغيل الخادم
npm start

# أو تشغيل مباشر
node server.js
```

### 6️⃣ **الوصول للنظام**

#### **من نفس الجهاز:**
- افتح المتصفح
- اذهب إلى: `http://localhost:3000`

#### **من أجهزة أخرى على نفس الشبكة:**
```bash
# معرفة IP الجهاز
ip addr show

# أو
ifconfig

# الوصول من أجهزة أخرى
http://[IP-ADDRESS]:3000
```

### 7️⃣ **تشغيل في الخلفية**

#### **استخدام nohup:**
```bash
# تشغيل في الخلفية
nohup npm start > output.log 2>&1 &

# معرفة PID
ps aux | grep node

# إيقاف الخادم
kill [PID]
```

#### **استخدام screen:**
```bash
# تثبيت screen
pkg install -y screen

# إنشاء جلسة جديدة
screen -S real-estate

# تشغيل النظام
npm start

# الخروج من الجلسة (Ctrl+A ثم D)
# العودة للجلسة
screen -r real-estate
```

#### **استخدام tmux:**
```bash
# تثبيت tmux
pkg install -y tmux

# إنشاء جلسة جديدة
tmux new-session -d -s real-estate

# تشغيل النظام
tmux send-keys -t real-estate "npm start" Enter

# الخروج من الجلسة
tmux detach

# العودة للجلسة
tmux attach -t real-estate
```

## 🔧 حل المشاكل الشائعة

### **مشكلة في تثبيت التبعيات:**
```bash
# تنظيف cache
npm cache clean --force

# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

### **مشكلة في المنفذ:**
```bash
# تغيير المنفذ في ملف .env
PORT=8080

# أو تشغيل على منفذ مختلف
PORT=8080 npm start
```

### **مشكلة في قاعدة البيانات:**
```bash
# حذف قاعدة البيانات وإعادة إنشاؤها
rm -f data/*.db
npm start
```

### **مشكلة في الذاكرة:**
```bash
# تشغيل مع زيادة الذاكرة
node --max-old-space-size=512 server.js
```

## 📱 استخدام النظام على الهاتف

### **من متصفح الهاتف:**
1. افتح المتصفح
2. اذهب إلى: `http://localhost:3000`
3. سجل الدخول:
   - المستخدم: admin
   - كلمة المرور: admin123

### **من أجهزة أخرى:**
1. تأكد من أن الهاتف والجهاز الآخر على نفس الشبكة
2. اذهب إلى: `http://[IP-HONE]:3000`

## 🔒 الأمان

### **تغيير كلمة المرور الافتراضية:**
1. سجل الدخول بالنظام
2. اذهب إلى إعدادات المستخدم
3. غيّر كلمة المرور

### **تغيير JWT_SECRET:**
```bash
# تعديل ملف .env
nano .env

# غيّر JWT_SECRET إلى قيمة عشوائية قوية
JWT_SECRET=your-very-strong-secret-key-here
```

## 📊 مراقبة النظام

### **مراقبة الاستخدام:**
```bash
# مراقبة الذاكرة
top

# مراقبة الشبكة
netstat -tulpn

# مراقبة الملفات
ls -la data/
```

### **سجلات النظام:**
```bash
# عرض السجلات
tail -f output.log

# أو
cat output.log
```

## 🚀 نصائح للأداء

### **تحسين الأداء:**
```bash
# تشغيل مع تحسينات
NODE_ENV=production npm start

# أو
node --optimize-for-size server.js
```

### **توفير البطارية:**
```bash
# تشغيل مع تقليل استهلاك الطاقة
node --max-old-space-size=256 server.js
```

---

## 🎊 تهانينا!

**النظام يعمل الآن على Termux!**

**📱 يمكنك الوصول للنظام من:**
- **نفس الجهاز**: http://localhost:3000
- **أجهزة أخرى**: http://[IP-HONE]:3000

**🔑 بيانات الدخول:**
- **المستخدم**: admin
- **كلمة المرور**: admin123

**🚀 استمتع باستخدام النظام على هاتفك!**