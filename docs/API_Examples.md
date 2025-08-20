# أمثلة API - نظام إدارة الاستثمار العقاري

هذا الملف يحتوي على أمثلة عملية لاستخدام API النظام.

## 📋 جدول المحتويات

- [المصادقة](#المصادقة)
- [العملاء](#العملاء)
- [الوحدات](#الوحدات)
- [العقود](#العقود)
- [الأقساط](#الأقساط)
- [الشركاء](#الشركاء)
- [السماسرة](#السماسرة)
- [الإيصالات](#الإيصالات)
- [الخزينة](#الخزينة)
- [التقارير](#التقارير)
- [النسخ الاحتياطية](#النسخ-الاحتياطية)

## 🔐 المصادقة

### تسجيل الدخول

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**الاستجابة**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### التحقق من التوكن

```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 👥 العملاء

### إضافة عميل جديد

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "أحمد محمد",
    "phone": "0123456789",
    "email": "ahmed@example.com",
    "address": "شارع الرئيسي، المدينة",
    "id_number": "123456789",
    "status": "active"
  }'
```

### الحصول على قائمة العملاء

```bash
curl -X GET "http://localhost:3000/api/customers?page=1&limit=10&search=أحمد" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تحديث عميل

```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "أحمد محمد علي",
    "phone": "0987654321",
    "email": "ahmed.ali@example.com"
  }'
```

### حذف عميل

```bash
curl -X DELETE http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🏢 الوحدات

### إضافة وحدة جديدة

```bash
curl -X POST http://localhost:3000/api/units \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "شقة 101",
    "type": "apartment",
    "area": 120,
    "price": 500000,
    "location": "الطابق الأول",
    "status": "available",
    "description": "شقة حديثة مع إطلالة جميلة"
  }'
```

### الحصول على قائمة الوحدات

```bash
curl -X GET "http://localhost:3000/api/units?type=apartment&status=available" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تحديث وحدة

```bash
curl -X PUT http://localhost:3000/api/units/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "price": 550000,
    "status": "sold"
  }'
```

## 📄 العقود

### إنشاء عقد جديد

```bash
curl -X POST http://localhost:3000/api/contracts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_id": 1,
    "unit_id": 1,
    "type": "sale",
    "total_amount": 500000,
    "down_payment": 100000,
    "installment_amount": 20000,
    "installment_count": 20,
    "start_date": "2025-01-01",
    "end_date": "2026-08-01",
    "status": "active"
  }'
```

### الحصول على قائمة العقود

```bash
curl -X GET "http://localhost:3000/api/contracts?type=sale&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تحديث عقد

```bash
curl -X PUT http://localhost:3000/api/contracts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "completed",
    "end_date": "2025-12-31"
  }'
```

## 💰 الأقساط

### إنشاء أقساط للعقد

```bash
curl -X POST http://localhost:3000/api/installments/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contract_id": 1
  }'
```

### الحصول على قائمة الأقساط

```bash
curl -X GET "http://localhost:3000/api/installments?contract_id=1&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### دفع قسط

```bash
curl -X PUT http://localhost:3000/api/installments/1/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_date": "2025-01-15",
    "payment_method": "cash",
    "notes": "دفع نقدي"
  }'
```

## 👥 الشركاء

### إضافة شريك جديد

```bash
curl -X POST http://localhost:3000/api/partners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "محمد علي",
    "phone": "0123456789",
    "email": "mohamed@example.com",
    "share_percentage": 30,
    "status": "active"
  }'
```

### الحصول على قائمة الشركاء

```bash
curl -X GET "http://localhost:3000/api/partners?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تحديث شريك

```bash
curl -X PUT http://localhost:3000/api/partners/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "share_percentage": 35,
    "phone": "0987654321"
  }'
```

## 🏠 السماسرة

### إضافة سمسار جديد

```bash
curl -X POST http://localhost:3000/api/brokers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "سارة أحمد",
    "phone": "0123456789",
    "email": "sara@example.com",
    "commission_rate": 5,
    "status": "active"
  }'
```

### الحصول على قائمة السماسرة

```bash
curl -X GET "http://localhost:3000/api/brokers?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تحديث سمسار

```bash
curl -X PUT http://localhost:3000/api/brokers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "commission_rate": 6,
    "phone": "0987654321"
  }'
```

## 📄 الإيصالات

### إنشاء إيصال دخل

```bash
curl -X POST http://localhost:3000/api/vouchers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "income",
    "amount": 20000,
    "description": "دفع قسط شقة 101",
    "date": "2025-01-15",
    "safe_id": 1,
    "status": "approved"
  }'
```

### إنشاء إيصال مصروف

```bash
curl -X POST http://localhost:3000/api/vouchers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "expense",
    "amount": 5000,
    "description": "صيانة المبنى",
    "date": "2025-01-15",
    "safe_id": 1,
    "status": "approved"
  }'
```

### الحصول على قائمة الإيصالات

```bash
curl -X GET "http://localhost:3000/api/vouchers?type=income&date_from=2025-01-01&date_to=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 💼 الخزينة

### إضافة خزينة جديدة

```bash
curl -X POST http://localhost:3000/api/treasury/safes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "الخزينة الرئيسية",
    "balance": 100000,
    "description": "الخزينة الرئيسية للشركة"
  }'
```

### الحصول على قائمة الخزائن

```bash
curl -X GET http://localhost:3000/api/treasury/safes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### إنشاء تحويل بين الخزائن

```bash
curl -X POST http://localhost:3000/api/treasury/transfers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "from_safe_id": 1,
    "to_safe_id": 2,
    "amount": 10000,
    "description": "تحويل للخزينة الفرعية",
    "date": "2025-01-15"
  }'
```

### الحصول على قائمة التحويلات

```bash
curl -X GET "http://localhost:3000/api/treasury/transfers?date_from=2025-01-01&date_to=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 التقارير

### لوحة التحكم

```bash
curl -X GET http://localhost:3000/api/reports/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تقرير المبيعات

```bash
curl -X GET "http://localhost:3000/api/reports/sales?year=2025&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تقرير الإيجارات

```bash
curl -X GET "http://localhost:3000/api/reports/rentals?year=2025&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تقرير الأقساط المتأخرة

```bash
curl -X GET http://localhost:3000/api/reports/overdue-installments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تقرير الشركاء

```bash
curl -X GET "http://localhost:3000/api/reports/partners?year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 💾 النسخ الاحتياطية

### إنشاء نسخة احتياطية

```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "نسخة احتياطية يومية"
  }'
```

### الحصول على قائمة النسخ الاحتياطية

```bash
curl -X GET http://localhost:3000/api/backup \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### استعادة نسخة احتياطية

```bash
curl -X POST http://localhost:3000/api/backup/restore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "backup_id": "backup_20250127_120000.sqlite"
  }'
```

### حذف نسخة احتياطية

```bash
curl -X DELETE http://localhost:3000/api/backup/backup_20250127_120000.sqlite \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 أمثلة JavaScript

### استخدام Fetch API

```javascript
// تسجيل الدخول
async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    return data.user;
  }
  throw new Error(data.message);
}

// الحصول على العملاء
async function getCustomers(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/customers?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// إضافة عميل جديد
async function addCustomer(token, customerData) {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(customerData)
  });
  
  return await response.json();
}
```

### استخدام Axios

```javascript
import axios from 'axios';

// إعداد Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
});

// إضافة التوكن تلقائياً
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// تسجيل الدخول
const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// الحصول على العملاء
const getCustomers = async (params) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

// إضافة عميل
const addCustomer = async (customerData) => {
  const response = await api.post('/customers', customerData);
  return response.data;
};
```

## 🐍 أمثلة Python

### استخدام requests

```python
import requests
import json

# إعداد الجلسة
session = requests.Session()
base_url = 'http://localhost:3000/api'

# تسجيل الدخول
def login(username, password):
    response = session.post(f'{base_url}/auth/login', json={
        'username': username,
        'password': password
    })
    data = response.json()
    if data['success']:
        session.headers.update({'Authorization': f"Bearer {data['token']}"})
        return data['user']
    raise Exception(data['message'])

# الحصول على العملاء
def get_customers(params=None):
    response = session.get(f'{base_url}/customers', params=params)
    return response.json()

# إضافة عميل
def add_customer(customer_data):
    response = session.post(f'{base_url}/customers', json=customer_data)
    return response.json()

# مثال للاستخدام
if __name__ == '__main__':
    try:
        # تسجيل الدخول
        user = login('admin', 'admin123')
        print(f'تم تسجيل الدخول: {user["username"]}')
        
        # الحصول على العملاء
        customers = get_customers({'limit': 10})
        print(f'عدد العملاء: {len(customers["data"])}')
        
        # إضافة عميل جديد
        new_customer = add_customer({
            'name': 'أحمد محمد',
            'phone': '0123456789',
            'email': 'ahmed@example.com',
            'status': 'active'
        })
        print(f'تم إضافة العميل: {new_customer["data"]["name"]}')
        
    except Exception as e:
        print(f'خطأ: {e}')
```

## 📱 أمثلة React

### Hook مخصص للـ API

```javascript
import { useState, useEffect } from 'react';

// Hook للتعامل مع API
function useApi() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'خطأ في الطلب');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.success) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
    }
    
    return data;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return {
    token,
    loading,
    error,
    apiCall,
    login,
    logout
  };
}

// مكون لإدارة العملاء
function CustomersManager() {
  const { apiCall, loading, error } = useApi();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await apiCall('/customers');
      setCustomers(data.data);
    } catch (err) {
      console.error('خطأ في تحميل العملاء:', err);
    }
  };

  const addCustomer = async (customerData) => {
    try {
      await apiCall('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
      loadCustomers(); // إعادة تحميل القائمة
    } catch (err) {
      console.error('خطأ في إضافة العميل:', err);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      <h2>إدارة العملاء</h2>
      <ul>
        {customers.map(customer => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0.0