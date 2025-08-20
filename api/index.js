const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'OK', timestamp: new Date().toISOString() });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      user: { name: 'Admin', role: 'admin' },
      token: 'token123'
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Customers data
app.get('/api/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'أحمد محمد', phone: '0501234567', email: 'ahmed@test.com' },
      { id: 2, name: 'فاطمة علي', phone: '0507654321', email: 'fatima@test.com' }
    ]
  });
});

// Units data
app.get('/api/units', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'شقة 101', type: 'شقة', price: 500000, status: 'متاح' },
      { id: 2, name: 'فيلا 201', type: 'فيلا', price: 1000000, status: 'مباع' }
    ]
  });
});

// Contracts data
app.get('/api/contracts', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, customer: 'أحمد محمد', unit: 'شقة 101', amount: 500000, status: 'نشط' },
      { id: 2, customer: 'فاطمة علي', unit: 'فيلا 201', amount: 1000000, status: 'مكتمل' }
    ]
  });
});

// Reports data
app.get('/api/reports', (req, res) => {
  res.json({
    success: true,
    data: {
      totalCustomers: 2,
      totalUnits: 2,
      totalContracts: 2,
      totalRevenue: 1500000
    }
  });
});

module.exports = app;