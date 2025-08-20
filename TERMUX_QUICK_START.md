# 📱 تشغيل سريع على Termux

## ⚡ الطريقة السريعة

### 1️⃣ **تحديث Termux:**
```bash
pkg update && pkg upgrade -y
```

### 2️⃣ **تثبيت المتطلبات:**
```bash
pkg install -y nodejs npm git wget unzip
```

### 3️⃣ **تحميل وتشغيل النظام:**
```bash
# تحميل السكريبت
wget https://raw.githubusercontent.com/hagagmohamed770-hash/Cruiser-test5555555/release/v5.0.0-complete/termux-start.sh

# إعطاء صلاحيات التنفيذ
chmod +x termux-start.sh

# تشغيل النظام
./termux-start.sh
```

## 🚀 الطريقة اليدوية

### 1️⃣ **تحميل النظام:**
```bash
mkdir ~/real-estate-system
cd ~/real-estate-system
wget https://github.com/hagagmohamed770-hash/Cruiser-test5555555/raw/release/v5.0.0-complete/real-estate-system-complete.zip
unzip real-estate-system-complete.zip
cd real-estate-system-complete
```

### 2️⃣ **تثبيت التبعيات:**
```bash
npm install
```

### 3️⃣ **إعداد النظام:**
```bash
mkdir -p data
cp .env.example .env
nano .env
```

### 4️⃣ **تشغيل النظام:**
```bash
npm start
```

## 🔑 الوصول للنظام

### **من نفس الجهاز:**
- افتح المتصفح
- اذهب إلى: `http://localhost:8080`

### **من أجهزة أخرى:**
```bash
# معرفة IP الهاتف
ip addr show

# الوصول من أجهزة أخرى
http://[IP-HONE]:8080
```

## 🔑 بيانات الدخول
- **المستخدم**: admin
- **كلمة المرور**: admin123

## 🔧 حل المشاكل

### **مشكلة في التثبيت:**
```bash
npm install --force
```

### **مشكلة في المنفذ:**
```bash
PORT=8080 npm start
```

### **مشكلة في الذاكرة:**
```bash
node --max-old-space-size=256 server.js
```

## 📱 نصائح للاستخدام

### **تشغيل في الخلفية:**
```bash
nohup npm start > output.log 2>&1 &
```

### **إيقاف النظام:**
```bash
pkill -f "node server.js"
```

### **مراقبة السجلات:**
```bash
tail -f output.log
```

---

## 🎊 جاهز للاستخدام!

**📱 النظام يعمل الآن على Termux**

**🚀 استمتع باستخدام النظام على هاتفك!**