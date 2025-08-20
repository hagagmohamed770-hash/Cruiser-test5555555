# دليل النشر - نظام إدارة الاستثمار العقاري

هذا الدليل يوضح كيفية نشر نظام إدارة الاستثمار العقاري في بيئات مختلفة.

## 📋 جدول المحتويات

- [المتطلبات الأساسية](#المتطلبات-الأساسية)
- [النشر المحلي](#النشر-المحلي)
- [النشر باستخدام Docker](#النشر-باستخدام-docker)
- [النشر على الخوادم](#النشر-على-الخوادم)
- [النشر على السحابة](#النشر-على-السحابة)
- [إعدادات الإنتاج](#إعدادات-الإنتاج)
- [المراقبة والصيانة](#المراقبة-والصيانة)
- [استكشاف الأخطاء](#استكشاف-الأخطاء)

## 🛠️ المتطلبات الأساسية

### متطلبات النظام

- **Node.js**: الإصدار 16 أو أحدث
- **npm**: الإصدار 8 أو أحدث
- **Git**: لأحدث إصدار من الكود
- **SQLite3**: مدمج مع Node.js

### متطلبات الخادم (للإنتاج)

- **نظام تشغيل**: Linux (Ubuntu 20.04+ مفضل)
- **ذاكرة**: 2GB على الأقل
- **مساحة تخزين**: 10GB على الأقل
- **شبكة**: اتصال إنترنت مستقر

## 🏠 النشر المحلي

### التطوير المحلي

1. **نسخ المشروع**:
   ```bash
   git clone https://github.com/your-repo/real-estate-management-system.git
   cd real-estate-management-system
   ```

2. **تثبيت التبعيات**:
   ```bash
   npm install
   ```

3. **إعداد البيئة**:
   ```bash
   cp .env.example .env
   # تعديل ملف .env حسب احتياجاتك
   ```

4. **تهيئة قاعدة البيانات**:
   ```bash
   npm run init-db
   ```

5. **تشغيل الخادم**:
   ```bash
   npm run dev
   ```

6. **الوصول للتطبيق**:
   افتح المتصفح على `http://localhost:3000`

### النشر المحلي للإنتاج

```bash
# بناء التطبيق
npm run build

# تشغيل في وضع الإنتاج
npm start
```

## 🐳 النشر باستخدام Docker

### باستخدام Docker Compose (مفضل)

1. **تأكد من تثبيت Docker و Docker Compose**

2. **تشغيل التطبيق**:
   ```bash
   docker-compose up -d
   ```

3. **مراقبة السجلات**:
   ```bash
   docker-compose logs -f
   ```

4. **إيقاف التطبيق**:
   ```bash
   docker-compose down
   ```

### باستخدام Docker مباشرة

1. **بناء الصورة**:
   ```bash
   docker build -t real-estate-system .
   ```

2. **تشغيل الحاوية**:
   ```bash
   docker run -d \
     --name real-estate-app \
     -p 3000:3000 \
     -v $(pwd)/data:/app/data \
     -v $(pwd)/backups:/app/backups \
     -e JWT_SECRET=your-secret-key \
     real-estate-system
   ```

### إعدادات Docker المتقدمة

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  real-estate-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    volumes:
      - ./data:/app/data
      - ./backups:/app/backups
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - real-estate-app
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## 🖥️ النشر على الخوادم

### النشر على Ubuntu Server

1. **تحديث النظام**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **تثبيت Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **تثبيت PM2**:
   ```bash
   sudo npm install -g pm2
   ```

4. **نسخ المشروع**:
   ```bash
   git clone https://github.com/your-repo/real-estate-management-system.git
   cd real-estate-management-system
   ```

5. **تثبيت التبعيات**:
   ```bash
   npm install --production
   ```

6. **إعداد البيئة**:
   ```bash
   cp .env.example .env
   nano .env  # تعديل الإعدادات
   ```

7. **تهيئة قاعدة البيانات**:
   ```bash
   npm run init-db
   ```

8. **تشغيل التطبيق**:
   ```bash
   pm2 start server.js --name "real-estate-system"
   pm2 save
   pm2 startup
   ```

### إعداد Nginx كـ Reverse Proxy

```nginx
# /etc/nginx/sites-available/real-estate-system
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/real-estate-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### إعداد SSL مع Let's Encrypt

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com

# تجديد تلقائي
sudo crontab -e
# إضافة السطر التالي:
0 12 * * * /usr/bin/certbot renew --quiet
```

## ☁️ النشر على السحابة

### النشر على AWS

#### باستخدام EC2

1. **إنشاء خادم EC2**:
   - اختيار Ubuntu Server 20.04 LTS
   - نوع الخادم: t3.medium أو أكبر
   - إعداد Security Group للسماح بالمنافذ 22, 80, 443

2. **الاتصال بالخادم**:
   ```bash
   ssh -i your-key.pem ubuntu@your-server-ip
   ```

3. **اتباع خطوات النشر على Ubuntu Server**

#### باستخدام AWS ECS

```yaml
# task-definition.json
{
  "family": "real-estate-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "real-estate-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/real-estate-system:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/real-estate-system",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### النشر على Google Cloud Platform

#### باستخدام Compute Engine

1. **إنشاء VM Instance**:
   ```bash
   gcloud compute instances create real-estate-server \
     --zone=us-central1-a \
     --machine-type=e2-medium \
     --image-family=ubuntu-2004-lts \
     --image-project=ubuntu-os-cloud
   ```

2. **الاتصال بالخادم**:
   ```bash
   gcloud compute ssh real-estate-server --zone=us-central1-a
   ```

3. **اتباع خطوات النشر على Ubuntu Server**

#### باستخدام Cloud Run

```bash
# بناء الصورة
docker build -t gcr.io/your-project/real-estate-system .

# رفع الصورة
docker push gcr.io/your-project/real-estate-system

# نشر الخدمة
gcloud run deploy real-estate-system \
  --image gcr.io/your-project/real-estate-system \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### النشر على Azure

#### باستخدام Azure App Service

1. **إنشاء App Service**:
   ```bash
   az group create --name real-estate-rg --location eastus
   az appservice plan create --name real-estate-plan --resource-group real-estate-rg --sku B1
   az webapp create --name real-estate-app --resource-group real-estate-rg --plan real-estate-plan --runtime "NODE|18-lts"
   ```

2. **نشر التطبيق**:
   ```bash
   az webapp deployment source config-local-git --name real-estate-app --resource-group real-estate-rg
   git remote add azure <git-url>
   git push azure main
   ```

## ⚙️ إعدادات الإنتاج

### متغيرات البيئة المهمة

```bash
# .env.production
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
DB_PATH=./data/production.db
BACKUP_DIR=./backups
BACKUP_AUTO=true
BACKUP_INTERVAL=24h
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://your-domain.com
```

### تحسينات الأداء

#### تحسين Node.js

```bash
# إعدادات PM2
pm2 start server.js \
  --name "real-estate-system" \
  --instances max \
  --max-memory-restart 1G \
  --node-args="--max-old-space-size=1024"
```

#### تحسين قاعدة البيانات

```sql
-- إنشاء فهارس للأداء
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_units_type ON units(type);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX idx_installments_due_date ON installments(due_date);
```

### إعدادات الأمان

#### جدار الحماية

```bash
# إعداد UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### تحديثات النظام

```bash
# إعداد التحديثات التلقائية
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 المراقبة والصيانة

### مراقبة الأداء

#### باستخدام PM2

```bash
# مراقبة العمليات
pm2 monit

# عرض السجلات
pm2 logs real-estate-system

# إعادة تشغيل التطبيق
pm2 restart real-estate-system
```

#### باستخدام أدوات خارجية

- **New Relic**: مراقبة الأداء
- **Datadog**: مراقبة البنية التحتية
- **Sentry**: تتبع الأخطاء
- **LogRocket**: مراقبة تجربة المستخدم

### النسخ الاحتياطية

#### إعداد النسخ الاحتياطية التلقائية

```bash
# سكريبت النسخ الاحتياطية
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sqlite"
cp ./data/production.db ./backups/$BACKUP_FILE
gzip ./backups/$BACKUP_FILE

# حذف النسخ الاحتياطية القديمة (أكثر من 30 يوم)
find ./backups -name "backup_*.sqlite.gz" -mtime +30 -delete
```

#### إعداد Cron Job

```bash
# إضافة إلى crontab
0 2 * * * /path/to/backup-script.sh
```

### الصيانة الدورية

#### جدول الصيانة

- **يومياً**: مراجعة السجلات، فحص النسخ الاحتياطية
- **أسبوعياً**: تحديث التبعيات، مراجعة الأداء
- **شهرياً**: تدقيق الأمان، تحديث النظام
- **ربع سنوياً**: مراجعة شاملة، تحسين الأداء

## 🔧 استكشاف الأخطاء

### مشاكل شائعة

#### التطبيق لا يبدأ

```bash
# فحص السجلات
pm2 logs real-estate-system

# فحص المنافذ
netstat -tulpn | grep :3000

# فحص قاعدة البيانات
ls -la ./data/
```

#### مشاكل قاعدة البيانات

```bash
# فحص سلامة قاعدة البيانات
sqlite3 ./data/production.db "PRAGMA integrity_check;"

# إصلاح قاعدة البيانات
sqlite3 ./data/production.db "VACUUM;"
```

#### مشاكل الذاكرة

```bash
# فحص استخدام الذاكرة
free -h
ps aux | grep node

# تنظيف الذاكرة
pm2 restart real-estate-system
```

### أدوات التشخيص

```bash
# فحص حالة النظام
htop
iotop
nethogs

# فحص السجلات
tail -f /var/log/nginx/error.log
journalctl -u nginx -f
```

### خطة الاسترداد

1. **تحديد المشكلة**: تحليل السجلات والأخطاء
2. **عزل المشكلة**: تحديد المكون المتأثر
3. **إصلاح المشكلة**: تطبيق الحل المناسب
4. **اختبار الحل**: التأكد من عمل النظام
5. **توثيق الحل**: تسجيل المشكلة والحل

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0.0  
**المسؤول**: فريق العمليات