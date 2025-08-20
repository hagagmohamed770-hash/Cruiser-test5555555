FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات التبعيات
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production

# نسخ الكود المصدري
COPY . .

# إنشاء المجلدات المطلوبة
RUN mkdir -p data backups

# تعيين المنفذ
EXPOSE 3000

# تعيين متغيرات البيئة
ENV NODE_ENV=production
ENV PORT=3000

# تشغيل التطبيق
CMD ["npm", "start"]