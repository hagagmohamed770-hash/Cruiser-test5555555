// ===== المتغيرات العامة =====
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let currentSection = 'dashboard';

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 بدء تشغيل نظام إدارة الاستثمار العقاري...');
    
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// ===== تهيئة التطبيق =====
function initializeApp() {
    // إعداد الوضع الافتراضي
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFont = localStorage.getItem('font') || 'normal';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeSelector').value = savedTheme;
    document.getElementById('fontSelector').value = savedFont;
    
    // تطبيق حجم الخط
    applyFontSize(savedFont);
}

// ===== إعداد مستمعي الأحداث =====
function setupEventListeners() {
    // تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // التنقل
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // تبديل الشريط الجانبي
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // اختيار الوضع
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.addEventListener('change', function() {
            const theme = this.value;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }
    
    // اختيار حجم الخط
    const fontSelector = document.getElementById('fontSelector');
    if (fontSelector) {
        fontSelector.addEventListener('change', function() {
            const font = this.value;
            applyFontSize(font);
            localStorage.setItem('font', font);
        });
    }
    
    // أزرار إضافة
    setupAddButtons();
    
    // النوافذ المنبثقة
    setupModals();
}

// ===== التحقق من حالة المصادقة =====
function checkAuthStatus() {
    if (authToken) {
        // التحقق من صحة التوكن
        verifyToken().then(isValid => {
            if (isValid) {
                showMainApp();
                loadDashboard();
            } else {
                showLoginScreen();
            }
        }).catch(() => {
            showLoginScreen();
        });
    } else {
        showLoginScreen();
    }
}

// ===== التحقق من صحة التوكن =====
async function verifyToken() {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('خطأ في التحقق من التوكن:', error);
        return false;
    }
}

// ===== معالجة تسجيل الدخول =====
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showNotification('تم تسجيل الدخول بنجاح', 'success');
            showMainApp();
            loadDashboard();
        } else {
            showNotification(data.message || 'خطأ في تسجيل الدخول', 'error');
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    } finally {
        hideLoading();
    }
}

// ===== معالجة تسجيل الخروج =====
function handleLogout() {
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    showNotification('تم تسجيل الخروج بنجاح', 'info');
    showLoginScreen();
}

// ===== إظهار شاشة تسجيل الدخول =====
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

// ===== إظهار التطبيق الرئيسي =====
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
}

// ===== التنقل بين الأقسام =====
function navigateToSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إزالة الفئة النشطة من جميع الروابط
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // إظهار القسم المحدد
    const selectedSection = document.getElementById(sectionName);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // إضافة الفئة النشطة للرابط المحدد
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // تحديث عنوان الصفحة
    updatePageTitle(sectionName);
    
    // تحميل بيانات القسم
    loadSectionData(sectionName);
    
    currentSection = sectionName;
}

// ===== تحديث عنوان الصفحة =====
function updatePageTitle(sectionName) {
    const titles = {
        'dashboard': 'لوحة التحكم',
        'customers': 'إدارة العملاء',
        'units': 'إدارة الوحدات',
        'contracts': 'إدارة العقود',
        'installments': 'إدارة الأقساط',
        'partners': 'إدارة الشركاء',
        'brokers': 'إدارة السماسرة',
        'vouchers': 'إدارة الإيصالات',
        'treasury': 'إدارة الخزينة',
        'reports': 'التقارير',
        'audit': 'سجل التغييرات'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionName] || 'النظام';
    }
}

// ===== تحميل بيانات القسم =====
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
        case 'installments':
            await loadInstallments();
            break;
        case 'partners':
            await loadPartners();
            break;
        case 'brokers':
            await loadBrokers();
            break;
        case 'vouchers':
            await loadVouchers();
            break;
        case 'treasury':
            await loadTreasury();
            break;
        case 'reports':
            await loadReports();
            break;
        case 'audit':
            await loadAudit();
            break;
    }
}

// ===== تحميل لوحة التحكم =====
async function loadDashboard() {
    try {
        const response = await fetch('/api/reports/dashboard', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.data);
        }
    } catch (error) {
        console.error('خطأ في تحميل لوحة التحكم:', error);
        showNotification('خطأ في تحميل البيانات', 'error');
    }
}

// ===== تحديث إحصائيات لوحة التحكم =====
function updateDashboardStats(stats) {
    document.getElementById('totalCustomers').textContent = stats.totalCustomers || 0;
    document.getElementById('totalUnits').textContent = stats.totalUnits || 0;
    document.getElementById('totalContracts').textContent = stats.totalContracts || 0;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue || 0);
}

// ===== تحميل العملاء =====
async function loadCustomers() {
    try {
        const response = await fetch('/api/customers', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateCustomersTable(data.data);
        }
    } catch (error) {
        console.error('خطأ في تحميل العملاء:', error);
        showNotification('خطأ في تحميل العملاء', 'error');
    }
}

// ===== تحديث جدول العملاء =====
function updateCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.email || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>
                <span class="status-badge ${customer.status}">
                    ${getStatusText(customer.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editCustomer(${customer.id})">
                    تعديل
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">
                    حذف
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== تحميل الوحدات =====
async function loadUnits() {
    try {
        const response = await fetch('/api/units', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateUnitsTable(data.data);
        }
    } catch (error) {
        console.error('خطأ في تحميل الوحدات:', error);
        showNotification('خطأ في تحميل الوحدات', 'error');
    }
}

// ===== تحديث جدول الوحدات =====
function updateUnitsTable(units) {
    const tbody = document.getElementById('unitsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = units.map(unit => `
        <tr>
            <td>${unit.name}</td>
            <td>${getUnitTypeText(unit.type)}</td>
            <td>${unit.area ? unit.area + ' م²' : '-'}</td>
            <td>${formatCurrency(unit.price)}</td>
            <td>${unit.location || '-'}</td>
            <td>
                <span class="status-badge ${unit.status}">
                    ${getUnitStatusText(unit.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUnit(${unit.id})">
                    تعديل
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUnit(${unit.id})">
                    حذف
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== تحميل العقود =====
async function loadContracts() {
    try {
        const response = await fetch('/api/contracts', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateContractsTable(data.data);
        }
    } catch (error) {
        console.error('خطأ في تحميل العقود:', error);
        showNotification('خطأ في تحميل العقود', 'error');
    }
}

// ===== تحديث جدول العقود =====
function updateContractsTable(contracts) {
    const tbody = document.getElementById('contractsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = contracts.map(contract => `
        <tr>
            <td>${contract.id}</td>
            <td>${contract.customer_name || '-'}</td>
            <td>${contract.unit_name || '-'}</td>
            <td>${getContractTypeText(contract.contract_type)}</td>
            <td>${formatDate(contract.start_date)}</td>
            <td>${formatCurrency(contract.total_amount)}</td>
            <td>
                <span class="status-badge ${contract.status}">
                    ${getContractStatusText(contract.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editContract(${contract.id})">
                    تعديل
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteContract(${contract.id})">
                    حذف
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== تحميل باقي البيانات =====
async function loadInstallments() {
    // سيتم تنفيذها لاحقاً
    console.log('تحميل الأقساط...');
}

async function loadPartners() {
    // سيتم تنفيذها لاحقاً
    console.log('تحميل الشركاء...');
}

async function loadBrokers() {
    // سيتم تنفيذها لاحقاً
    console.log('تحميل السماسرة...');
}

async function loadVouchers() {
    // سيتم تنفيذها لاحقاً
    console.log('تحميل الإيصالات...');
}

async function loadTreasury() {
    // سيتم تنفيذها لاحقاً
    console.log('تحميل الخزينة...');
}

async function loadReports() {
    // سيتم تنفيذها لاحقاً
    console.log('تحميل التقارير...');
}

async function loadAudit() {
    // سيتم تنفيذها لاحقاً
    console.log('تحميل سجل التغييرات...');
}

// ===== إعداد أزرار الإضافة =====
function setupAddButtons() {
    // إضافة عميل
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', () => showCustomerModal());
    }
    
    // إضافة وحدة
    const addUnitBtn = document.getElementById('addUnitBtn');
    if (addUnitBtn) {
        addUnitBtn.addEventListener('click', () => showUnitModal());
    }
}

// ===== إعداد النوافذ المنبثقة =====
function setupModals() {
    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // نماذج الإضافة
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', handleCustomerSubmit);
    }
    
    const unitForm = document.getElementById('unitForm');
    if (unitForm) {
        unitForm.addEventListener('submit', handleUnitSubmit);
    }
}

// ===== إظهار نافذة العميل =====
function showCustomerModal(customer = null) {
    const modal = document.getElementById('customerModal');
    const title = document.getElementById('customerModalTitle');
    const form = document.getElementById('customerForm');
    
    if (customer) {
        title.textContent = 'تعديل العميل';
        fillCustomerForm(customer);
    } else {
        title.textContent = 'إضافة عميل جديد';
        form.reset();
    }
    
    modal.classList.add('active');
}

// ===== إظهار نافذة الوحدة =====
function showUnitModal(unit = null) {
    const modal = document.getElementById('unitModal');
    const title = document.getElementById('unitModalTitle');
    const form = document.getElementById('unitForm');
    
    if (unit) {
        title.textContent = 'تعديل الوحدة';
        fillUnitForm(unit);
    } else {
        title.textContent = 'إضافة وحدة جديدة';
        form.reset();
    }
    
    modal.classList.add('active');
}

// ===== إغلاق جميع النوافذ المنبثقة =====
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ===== معالجة إرسال نموذج العميل =====
async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const customerData = Object.fromEntries(formData.entries());
    
    showLoading();
    
    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('تم إضافة العميل بنجاح', 'success');
            closeAllModals();
            loadCustomers();
        } else {
            showNotification(data.message || 'خطأ في إضافة العميل', 'error');
        }
    } catch (error) {
        console.error('خطأ في إضافة العميل:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    } finally {
        hideLoading();
    }
}

// ===== معالجة إرسال نموذج الوحدة =====
async function handleUnitSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const unitData = Object.fromEntries(formData.entries());
    
    showLoading();
    
    try {
        const response = await fetch('/api/units', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unitData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('تم إضافة الوحدة بنجاح', 'success');
            closeAllModals();
            loadUnits();
        } else {
            showNotification(data.message || 'خطأ في إضافة الوحدة', 'error');
        }
    } catch (error) {
        console.error('خطأ في إضافة الوحدة:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    } finally {
        hideLoading();
    }
}

// ===== تبديل الشريط الجانبي =====
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// ===== تطبيق حجم الخط =====
function applyFontSize(size) {
    const sizes = {
        'normal': '1rem',
        'large': '1.2rem'
    };
    
    document.documentElement.style.fontSize = sizes[size] || '1rem';
}

// ===== إظهار مؤشر التحميل =====
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// ===== إخفاء مؤشر التحميل =====
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// ===== إظهار الإشعارات =====
function showNotification(message, type = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notifications.appendChild(notification);
    
    // إزالة الإشعار بعد 5 ثوانٍ
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== دوال المساعدة =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SA');
}

function getStatusText(status) {
    const statuses = {
        'active': 'نشط',
        'inactive': 'غير نشط'
    };
    return statuses[status] || status;
}

function getUnitTypeText(type) {
    const types = {
        'apartment': 'شقة',
        'villa': 'فيلا',
        'office': 'مكتب',
        'shop': 'محل'
    };
    return types[type] || type;
}

function getUnitStatusText(status) {
    const statuses = {
        'available': 'متاح',
        'sold': 'مباع',
        'rented': 'مؤجر'
    };
    return statuses[status] || status;
}

function getContractTypeText(type) {
    const types = {
        'sale': 'بيع',
        'rent': 'إيجار'
    };
    return types[type] || type;
}

function getContractStatusText(status) {
    const statuses = {
        'active': 'نشط',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
    };
    return statuses[status] || status;
}

// ===== دوال التعديل والحذف =====
function editCustomer(id) {
    // سيتم تنفيذها لاحقاً
    console.log('تعديل العميل:', id);
}

function deleteCustomer(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        // سيتم تنفيذها لاحقاً
        console.log('حذف العميل:', id);
    }
}

function editUnit(id) {
    // سيتم تنفيذها لاحقاً
    console.log('تعديل الوحدة:', id);
}

function deleteUnit(id) {
    if (confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
        // سيتم تنفيذها لاحقاً
        console.log('حذف الوحدة:', id);
    }
}

function editContract(id) {
    // سيتم تنفيذها لاحقاً
    console.log('تعديل العقد:', id);
}

function deleteContract(id) {
    if (confirm('هل أنت متأكد من حذف هذا العقد؟')) {
        // سيتم تنفيذها لاحقاً
        console.log('حذف العقد:', id);
    }
}

// ===== إكمال النماذج =====
function fillCustomerForm(customer) {
    document.getElementById('customerName').value = customer.name || '';
    document.getElementById('customerPhone').value = customer.phone || '';
    document.getElementById('customerEmail').value = customer.email || '';
    document.getElementById('customerAddress').value = customer.address || '';
    document.getElementById('customerNotes').value = customer.notes || '';
    document.getElementById('customerStatus').value = customer.status || 'active';
}

function fillUnitForm(unit) {
    document.getElementById('unitName').value = unit.name || '';
    document.getElementById('unitType').value = unit.type || '';
    document.getElementById('unitArea').value = unit.area || '';
    document.getElementById('unitPrice').value = unit.price || '';
    document.getElementById('unitLocation').value = unit.location || '';
    document.getElementById('unitDescription').value = unit.description || '';
    document.getElementById('unitStatus').value = unit.status || 'available';
}

console.log('✅ تم تحميل نظام إدارة الاستثمار العقاري بنجاح!');