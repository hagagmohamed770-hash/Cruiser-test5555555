// Global variables
let currentUser = null;
let isAuthenticated = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Real Estate Management System...');
    
    setupEventListeners();
    checkAuthStatus();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        isAuthenticated = true;
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        showMainApp();
        loadDashboard();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            currentUser = data.user;
            isAuthenticated = true;
            
            showMainApp();
            loadDashboard();
        } else {
            alert('خطأ في تسجيل الدخول: ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('خطأ في الاتصال بالخادم');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    isAuthenticated = false;
    currentUser = null;
    showLoginScreen();
}

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

// Show main app
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    updateUserInfo();
}

// Update user info
function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    if (userInfo && currentUser) {
        userInfo.textContent = `مرحباً، ${currentUser.name}`;
    }
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Add active class to clicked nav link
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section data
    loadSectionData(sectionName);
}

// Load section data
async function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'customers':
            await loadCustomers();
            break;
        case 'units':
            await loadUnits();
            break;
        case 'contracts':
            await loadContracts();
            break;
        case 'reports':
            await loadReports();
            break;
    }
}

// Load dashboard
async function loadDashboard() {
    try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        
        if (data.success) {
            updateDashboard(data.data);
        }
    } catch (error) {
        console.error('Dashboard loading error:', error);
    }
}

// Update dashboard
function updateDashboard(data) {
    document.getElementById('totalCustomers').textContent = data.totalCustomers || 0;
    document.getElementById('totalUnits').textContent = data.totalUnits || 0;
    document.getElementById('totalContracts').textContent = data.totalContracts || 0;
    document.getElementById('totalRevenue').textContent = (data.totalRevenue || 0).toLocaleString() + ' ريال';
}

// Load customers
async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        
        if (data.success) {
            updateCustomersTable(data.data);
        }
    } catch (error) {
        console.error('Customers loading error:', error);
    }
}

// Update customers table
function updateCustomersTable(customers) {
    const tbody = document.getElementById('customersTable');
    if (tbody) {
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email}</td>
            </tr>
        `).join('');
    }
}

// Load units
async function loadUnits() {
    try {
        const response = await fetch('/api/units');
        const data = await response.json();
        
        if (data.success) {
            updateUnitsTable(data.data);
        }
    } catch (error) {
        console.error('Units loading error:', error);
    }
}

// Update units table
function updateUnitsTable(units) {
    const tbody = document.getElementById('unitsTable');
    if (tbody) {
        tbody.innerHTML = units.map(unit => `
            <tr>
                <td>${unit.name}</td>
                <td>${unit.type}</td>
                <td>${unit.price.toLocaleString()} ريال</td>
                <td>${unit.status}</td>
            </tr>
        `).join('');
    }
}

// Load contracts
async function loadContracts() {
    try {
        const response = await fetch('/api/contracts');
        const data = await response.json();
        
        if (data.success) {
            updateContractsTable(data.data);
        }
    } catch (error) {
        console.error('Contracts loading error:', error);
    }
}

// Update contracts table
function updateContractsTable(contracts) {
    const tbody = document.getElementById('contractsTable');
    if (tbody) {
        tbody.innerHTML = contracts.map(contract => `
            <tr>
                <td>${contract.customer}</td>
                <td>${contract.unit}</td>
                <td>${contract.amount.toLocaleString()} ريال</td>
                <td>${contract.status}</td>
            </tr>
        `).join('');
    }
}

// Load reports
async function loadReports() {
    try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        
        if (data.success) {
            updateReportsSection(data.data);
        }
    } catch (error) {
        console.error('Reports loading error:', error);
    }
}

// Update reports section
function updateReportsSection(data) {
    document.getElementById('reportCustomers').textContent = data.totalCustomers || 0;
    document.getElementById('reportUnits').textContent = data.totalUnits || 0;
    document.getElementById('reportContracts').textContent = data.totalContracts || 0;
    document.getElementById('reportRevenue').textContent = (data.totalRevenue || 0).toLocaleString() + ' ريال';
}

console.log('✅ Real Estate Management System loaded successfully!');