/*
    Real Estate Management App - Complete Version
    Author: Jules
    Date: 2025-08-19
    Description: Complete real estate management system with all original features
*/

/* ===== GLOBAL STATE & CONFIG ===== */
const APPKEY = 'estate_pro_complete_v1';
let state = {};
let historyStack = [];
let historyIndex = -1;
let currentView = 'dash';
let currentParam = null;

/* ===== CORE APP INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

function initializeApp() {
    console.log('Starting application initialization...');
    
    // Initialize state
    initializeDefaultState();
    console.log('Default state initialized');
    
    // Setup UI
    setupUI();
    console.log('UI setup complete');
    
    // Load data and start app
    loadAppData();
}

function initializeDefaultState() {
    state = { 
        settings: { theme: 'dark', font: 16, pass: null }, 
        locked: false,
        customers: [],
        units: [],
        partners: [],
        unitPartners: [],
        contracts: [],
        installments: [],
        vouchers: [],
        safes: [],
        brokers: [],
        partnerGroups: [],
        partnerDebts: [],
        transfers: [],
        auditLog: [],
        brokerDues: []
    };
}

function setupUI() {
    try {
        console.log('Setting up UI...');
        
        // Apply settings
        applySettings();
        
        // Setup navigation
        setupNavigation();
        
        // Setup other UI elements
        setupOtherUI();
        
        console.log('UI setup complete');
    } catch (error) {
        console.error('Error in setupUI:', error);
        showNotification('حدث خطأ في إعداد الواجهة', 'danger');
    }
}

function setupNavigation() {
    try {
        const navItems = document.querySelectorAll('.nav-item');
        console.log('Found nav items:', navItems.length);
        
        navItems.forEach(function(item) {
            item.addEventListener('click', function(e) {
                try {
                    e.preventDefault();
                    const navId = item.dataset.nav;
                    console.log('Navigation clicked:', navId);
                    if (navId) {
                        nav(navId);
                    }
                } catch (error) {
                    console.error('Navigation click error:', error);
                    showNotification('حدث خطأ في التنقل', 'danger');
                }
            });
        });
    } catch (error) {
        console.error('Error in setupNavigation:', error);
    }
}

function setupOtherUI() {
    try {
        // Theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', function() {
                state.settings.theme = this.value;
                applySettings();
                saveState();
                showNotification('تم تغيير المظهر بنجاح!', 'success');
            });
        }
        
        // Font selector
        const fontSelector = document.getElementById('font-selector');
        if (fontSelector) {
            fontSelector.addEventListener('change', function() {
                const fontSizes = { small: 14, default: 16, large: 18 };
                state.settings.font = fontSizes[this.value] || 16;
                applySettings();
                saveState();
                showNotification('تم تغيير حجم الخط بنجاح!', 'success');
            });
        }
        
        // Lock button
        const lockBtn = document.getElementById('lock-btn');
        if (lockBtn) {
            lockBtn.addEventListener('click', function() {
                const pass = prompt('ضع كلمة مرور أو اتركها فارغة لإلغاء القفل', '');
                state.locked = !!pass;
                state.settings.pass = pass || null;
                saveState();
                showNotification(state.locked ? 'تم تفعيل القفل' : 'تم إلغاء القفل', 'success');
                checkLock();
            });
        }
        
        // Undo/Redo buttons
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.addEventListener('click', undo);
        }
        if (redoBtn) {
            redoBtn.addEventListener('click', redo);
        }
        
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', function() {
                document.body.classList.toggle('sidebar-open');
            });
        }
        
    } catch (error) {
        console.error('Error in setupOtherUI:', error);
    }
}

function loadAppData() {
    try {
        console.log('Loading app data...');
        
        // Try to load from localStorage first
        const savedState = localStorage.getItem(APPKEY);
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                mergeLoadedState(parsedState);
                console.log('Data loaded from localStorage');
            } catch (error) {
                console.error('Error parsing localStorage data:', error);
            }
        }
        
        // Ensure default safe exists
        if (!state.safes || state.safes.length === 0) {
            state.safes = [{ id: generateId('S'), name: 'الخزنة الرئيسية', balance: 0 }];
        }
        
        // Navigate to dashboard
        console.log('Navigating to dashboard...');
        nav('dash');
        console.log('Application initialization complete!');
        
    } catch (error) {
        console.error('Error in loadAppData:', error);
        showNotification('حدث خطأ في تحميل البيانات', 'danger');
        nav('dash'); // Still try to show dashboard
    }
}

function mergeLoadedState(loadedState) {
    try {
        for (const key in loadedState) {
            if (key === 'settings' && typeof loadedState[key] === 'object' && loadedState[key] !== null) {
                Object.assign(state.settings, loadedState[key]);
            } else if (state[key] !== undefined) {
                state[key] = loadedState[key];
            }
        }
    } catch (error) {
        console.error('Error merging loaded state:', error);
    }
}

function applySettings() {
    try {
        const theme = state.settings.theme || 'dark';
        const font = state.settings.font || 16;
        
        document.body.className = theme;
        document.body.style.fontSize = font + 'px';
        
        // Update selectors
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) themeSelector.value = theme;
        
        const fontSelector = document.getElementById('font-selector');
        if (fontSelector) {
            if (font <= 14) fontSelector.value = 'small';
            else if (font >= 18) fontSelector.value = 'large';
            else fontSelector.value = 'default';
        }
    } catch (error) {
        console.error('Error applying settings:', error);
    }
}

function nav(id, param) {
    try {
        console.log('Navigating to:', id, 'with param:', param);
        
        currentView = id;
        currentParam = param;
        
        // Update active navigation
        document.querySelectorAll('.nav-item').forEach(function(item) {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector('[data-nav="' + id + '"]');
        if (navItem) navItem.classList.add('active');
        
        // Render the view
        console.log('Rendering view for:', id);
        renderView(id, param);
        
        console.log('Navigation complete');
        
    } catch (error) {
        console.error('Error in navigation:', error);
        showNotification('حدث خطأ في التنقل: ' + error.message, 'danger');
    }
}

function renderView(id, param) {
    try {
        switch(id) {
            case 'dash':
                renderDash();
                break;
            case 'customers':
                renderCustomers();
                break;
            case 'units':
                renderUnits();
                break;
            case 'contracts':
                renderContracts();
                break;
            case 'brokers':
                renderBrokers();
                break;
            case 'partners':
                renderPartners();
                break;
            case 'installments':
                renderInstallments();
                break;
            case 'vouchers':
                renderVouchers();
                break;
            case 'treasury':
                renderTreasury();
                break;
            case 'reports':
                renderReports();
                break;
            case 'audit':
                renderAuditLog();
                break;
            case 'backup':
                renderBackup();
                break;
            default:
                renderDash();
        }
    } catch (error) {
        console.error('Error rendering view:', error);
        showNotification('حدث خطأ في عرض الصفحة', 'danger');
    }
}

/* ===== DASHBOARD ===== */
function renderDash() {
    try {
        console.log('Rendering dashboard...');
        
        const totalCustomers = state.customers ? state.customers.length : 0;
        const totalUnits = state.units ? state.units.length : 0;
        const totalContracts = state.contracts ? state.contracts.length : 0;
        const totalPartners = state.partners ? state.partners.length : 0;
        
        // Calculate some statistics
        const activeContracts = state.contracts ? state.contracts.filter(c => c.status === 'نشط').length : 0;
        const totalRevenue = state.contracts ? state.contracts.reduce((sum, c) => sum + (c.price || 0), 0) : 0;
        
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="kpis">
                <div class="kpi-card">
                    <div class="kpi-icon">👥</div>
                    <div class="kpi-content">
                        <h3>${totalCustomers}</h3>
                        <p>العملاء</p>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon">🏠</div>
                    <div class="kpi-content">
                        <h3>${totalUnits}</h3>
                        <p>الوحدات</p>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon">📋</div>
                    <div class="kpi-content">
                        <h3>${totalContracts}</h3>
                        <p>العقود</p>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon">👨‍💼</div>
                    <div class="kpi-content">
                        <h3>${totalPartners}</h3>
                        <p>الشركاء</p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-2">
                <div class="card">
                    <h3>📊 الإحصائيات السريعة</h3>
                    <div class="mb-4">
                        <div class="flex justify-between items-center mb-4">
                            <span>إجمالي الإيرادات</span>
                            <span class="font-bold text-success">${totalRevenue.toLocaleString()} ج.م</span>
                        </div>
                        <div class="flex justify-between items-center mb-4">
                            <span>العقود النشطة</span>
                            <span class="font-bold">${activeContracts}</span>
                        </div>
                        <div class="flex justify-between items-center mb-4">
                            <span>الوحدات المتاحة</span>
                            <span class="font-bold">${totalUnits - (state.contracts ? state.contracts.length : 0)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🎯 الإجراءات السريعة</h3>
                    <div class="grid grid-2 gap-4">
                        <button class="btn btn-primary" onclick="nav('customers')">
                            <span class="nav-icon">➕</span>
                            إضافة عميل
                        </button>
                        <button class="btn btn-success" onclick="nav('units')">
                            <span class="nav-icon">🏠</span>
                            إضافة وحدة
                        </button>
                        <button class="btn btn-warning" onclick="nav('contracts')">
                            <span class="nav-icon">📋</span>
                            إنشاء عقد
                        </button>
                        <button class="btn btn-info" onclick="nav('reports')">
                            <span class="nav-icon">📈</span>
                            عرض التقارير
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="welcome-message">
                <h2>مرحباً بك في نظام إدارة الاستثمار العقاري</h2>
                <p>نظام متكامل لإدارة جميع جوانب الاستثمار العقاري. يمكنك إدارة العملاء، الوحدات، العقود، والشركاء بسهولة وكفاءة.</p>
            </div>
        `;
        
        // Update page header
        updatePageHeader('لوحة التحكم', 'نظرة عامة على النظام', '📊');
        
        console.log('Dashboard rendered successfully');
        
    } catch (error) {
        console.error('Error in renderDash:', error);
        showNotification('حدث خطأ في عرض لوحة التحكم: ' + error.message, 'danger');
    }
}

/* ===== CUSTOMERS ===== */
function renderCustomers() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="grid grid-2">
                <div class="card">
                    <h3>إضافة عميل</h3>
                    <div class="grid grid-2" style="gap: 10px;">
                        <input class="input" id="c-name" placeholder="اسم العميل">
                        <input class="input" id="c-phone" placeholder="الهاتف">
                        <input class="input" id="c-nationalId" placeholder="الرقم القومي">
                        <input class="input" id="c-address" placeholder="العنوان">
                    </div>
                    <select class="select" id="c-status" style="margin-top:10px;">
                        <option value="نشط">نشط</option>
                        <option value="موقوف">موقوف</option>
                    </select>
                    <textarea class="input" id="c-notes" placeholder="ملاحظات" style="margin-top:10px;" rows="2"></textarea>
                    <button class="btn" id="add-customer-btn" style="margin-top:10px;">حفظ</button>
                </div>
                <div class="card">
                    <h3>العملاء</h3>
                    <div class="tools">
                        <input class="input" id="c-q" placeholder="بحث..." oninput="drawCustomers()">
                        <button class="btn btn-secondary" id="export-csv-btn">CSV</button>
                        <button class="btn" id="print-pdf-btn">طباعة PDF</button>
                    </div>
                    <div id="c-list"></div>
                </div>
            </div>
        `;
        
        updatePageHeader('العملاء', 'إدارة بيانات العملاء', '👥');
        
        // Draw customers list
        drawCustomers();
        
        // Attach event listeners
        document.getElementById('add-customer-btn').addEventListener('click', addCustomer);
        
    } catch (error) {
        console.error('Error in renderCustomers:', error);
        showNotification('حدث خطأ في عرض العملاء', 'danger');
    }
}

function drawCustomers() {
    try {
        const query = (document.getElementById('c-q')?.value || '').trim().toLowerCase();
        let list = state.customers ? state.customers.slice() : [];
        
        if (query) {
            list = list.filter(customer => {
                const searchable = `${customer.name || ''} ${customer.phone || ''} ${customer.nationalId || ''} ${customer.address || ''} ${customer.status || ''}`.toLowerCase();
                return searchable.includes(query);
            });
        }
        
        const rows = list.map(customer => [
            `<a href="#" onclick="nav('customer-details', '${customer.id}')">${customer.name || ''}</a>`,
            customer.phone || '',
            customer.nationalId || '',
            customer.status || 'نشط',
            `<button class="btn btn-secondary btn-sm" onclick="deleteCustomer('${customer.id}')">حذف</button>`
        ]);
        
        const listElement = document.getElementById('c-list');
        if (listElement) {
            listElement.innerHTML = table(
                ['الاسم', 'الهاتف', 'الرقم القومي', 'الحالة', ''],
                rows
            );
        }
    } catch (error) {
        console.error('Error in drawCustomers:', error);
    }
}

function addCustomer() {
    try {
        const name = document.getElementById('c-name').value.trim();
        const phone = document.getElementById('c-phone').value.trim();
        const nationalId = document.getElementById('c-nationalId').value.trim();
        const address = document.getElementById('c-address').value.trim();
        const status = document.getElementById('c-status').value;
        const notes = document.getElementById('c-notes').value.trim();
        
        if (!name || !phone) {
            return alert('الرجاء إدخال الاسم ورقم الهاتف على الأقل.');
        }
        
        if (state.customers.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return alert('عميل بنفس الاسم موجود بالفعل.');
        }

        saveState();
        const newCustomer = {
            id: generateId('C'),
            name,
            phone,
            nationalId,
            address,
            status,
            notes
        };
        
        state.customers.push(newCustomer);
        logAction('إضافة عميل جديد', {
            id: newCustomer.id,
            name: newCustomer.name
        });
        
        saveState();

        // Clear form
        document.getElementById('c-name').value = '';
        document.getElementById('c-phone').value = '';
        document.getElementById('c-nationalId').value = '';
        document.getElementById('c-address').value = '';
        document.getElementById('c-notes').value = '';
        
        drawCustomers();
        showNotification('تم إضافة العميل بنجاح', 'success');
        
    } catch (error) {
        console.error('Error in addCustomer:', error);
        showNotification('حدث خطأ في إضافة العميل', 'danger');
    }
}

function deleteCustomer(id) {
    try {
        const customer = state.customers.find(c => c.id === id);
        if (!customer) return;
        
        if (confirm(`هل أنت متأكد من حذف العميل "${customer.name}"؟`)) {
            saveState();
            state.customers = state.customers.filter(c => c.id !== id);
            logAction('حذف عميل', {
                id: customer.id,
                name: customer.name
            });
            saveState();
            drawCustomers();
            showNotification('تم حذف العميل بنجاح', 'success');
        }
    } catch (error) {
        console.error('Error in deleteCustomer:', error);
        showNotification('حدث خطأ في حذف العميل', 'danger');
    }
}

/* ===== UNITS ===== */
function renderUnits() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="grid grid-2">
                <div class="card">
                    <h3>إضافة وحدة</h3>
                    <div class="grid grid-2" style="gap: 10px;">
                        <input class="input" id="u-name" placeholder="اسم الوحدة">
                        <input class="input" id="u-code" placeholder="كود الوحدة">
                        <input class="input" id="u-building" placeholder="رقم العمارة">
                        <input class="input" id="u-floor" placeholder="رقم الدور">
                    </div>
                    <textarea class="input" id="u-notes" placeholder="ملاحظات" style="margin-top:10px;" rows="2"></textarea>
                    <button class="btn" id="add-unit-btn" style="margin-top:10px;">حفظ</button>
                </div>
                <div class="card">
                    <h3>الوحدات</h3>
                    <div class="tools">
                        <input class="input" id="u-q" placeholder="بحث..." oninput="drawUnits()">
                        <button class="btn btn-secondary" id="export-units-csv-btn">CSV</button>
                        <button class="btn" id="print-units-pdf-btn">طباعة PDF</button>
                    </div>
                    <div id="u-list"></div>
                </div>
            </div>
        `;
        
        updatePageHeader('الوحدات', 'إدارة الوحدات العقارية', '🏠');
        
        // Draw units list
        drawUnits();
        
        // Attach event listeners
        document.getElementById('add-unit-btn').addEventListener('click', addUnit);
        
    } catch (error) {
        console.error('Error in renderUnits:', error);
        showNotification('حدث خطأ في عرض الوحدات', 'danger');
    }
}

function drawUnits() {
    try {
        const query = (document.getElementById('u-q')?.value || '').trim().toLowerCase();
        let list = state.units ? state.units.slice() : [];
        
        if (query) {
            list = list.filter(unit => {
                const searchable = `${unit.name || ''} ${unit.code || ''} ${unit.building || ''} ${unit.floor || ''}`.toLowerCase();
                return searchable.includes(query);
            });
        }
        
        const rows = list.map(unit => [
            `<a href="#" onclick="nav('unit-details', '${unit.id}')">${unit.name || ''}</a>`,
            unit.code || '',
            unit.building || '',
            unit.floor || '',
            `<button class="btn btn-secondary btn-sm" onclick="deleteUnit('${unit.id}')">حذف</button>`
        ]);
        
        const listElement = document.getElementById('u-list');
        if (listElement) {
            listElement.innerHTML = table(
                ['الاسم', 'الكود', 'العمارة', 'الدور', ''],
                rows
            );
        }
    } catch (error) {
        console.error('Error in drawUnits:', error);
    }
}

function addUnit() {
    try {
        const name = document.getElementById('u-name').value.trim();
        const code = document.getElementById('u-code').value.trim();
        const building = document.getElementById('u-building').value.trim();
        const floor = document.getElementById('u-floor').value.trim();
        const notes = document.getElementById('u-notes').value.trim();
        
        if (!name || !code) {
            return alert('الرجاء إدخال اسم الوحدة والكود على الأقل.');
        }

        saveState();
        const newUnit = {
            id: generateId('U'),
            name,
            code,
            building,
            floor,
            notes
        };
        
        state.units.push(newUnit);
        logAction('إضافة وحدة جديدة', {
            id: newUnit.id,
            name: newUnit.name
        });
        
        saveState();

        // Clear form
        document.getElementById('u-name').value = '';
        document.getElementById('u-code').value = '';
        document.getElementById('u-building').value = '';
        document.getElementById('u-floor').value = '';
        document.getElementById('u-notes').value = '';
        
        drawUnits();
        showNotification('تم إضافة الوحدة بنجاح', 'success');
        
    } catch (error) {
        console.error('Error in addUnit:', error);
        showNotification('حدث خطأ في إضافة الوحدة', 'danger');
    }
}

function deleteUnit(id) {
    try {
        const unit = state.units.find(u => u.id === id);
        if (!unit) return;
        
        if (confirm(`هل أنت متأكد من حذف الوحدة "${unit.name}"؟`)) {
            saveState();
            state.units = state.units.filter(u => u.id !== id);
            logAction('حذف وحدة', {
                id: unit.id,
                name: unit.name
            });
            saveState();
            drawUnits();
            showNotification('تم حذف الوحدة بنجاح', 'success');
        }
    } catch (error) {
        console.error('Error in deleteUnit:', error);
        showNotification('حدث خطأ في حذف الوحدة', 'danger');
    }
}

/* ===== CONTRACTS ===== */
function renderContracts() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="grid grid-2">
                <div class="card">
                    <h3>إنشاء عقد جديد</h3>
                    <select class="select" id="co-customer" style="margin-bottom:10px;">
                        <option value="">اختر العميل</option>
                        ${(state.customers || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                    <select class="select" id="co-unit" style="margin-bottom:10px;">
                        <option value="">اختر الوحدة</option>
                        ${(state.units || []).map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                    </select>
                    <select class="select" id="co-type" style="margin-bottom:10px;">
                        <option value="بيع">بيع</option>
                        <option value="إيجار">إيجار</option>
                    </select>
                    <input class="input" id="co-startDate" type="date" style="margin-bottom:10px;">
                    <input class="input" id="co-price" placeholder="السعر" style="margin-bottom:10px;">
                    <button class="btn" id="add-contract-btn">إنشاء العقد</button>
                </div>
                <div class="card">
                    <h3>العقود</h3>
                    <div class="tools">
                        <input class="input" id="co-q" placeholder="بحث..." oninput="drawContracts()">
                        <button class="btn btn-secondary" id="export-contracts-csv-btn">CSV</button>
                        <button class="btn" id="print-contracts-pdf-btn">طباعة PDF</button>
                    </div>
                    <div id="co-list"></div>
                </div>
            </div>
        `;
        
        updatePageHeader('العقود', 'إدارة العقود', '📋');
        
        // Draw contracts list
        drawContracts();
        
        // Attach event listeners
        document.getElementById('add-contract-btn').addEventListener('click', addContract);
        
    } catch (error) {
        console.error('Error in renderContracts:', error);
        showNotification('حدث خطأ في عرض العقود', 'danger');
    }
}

function drawContracts() {
    try {
        const query = (document.getElementById('co-q')?.value || '').trim().toLowerCase();
        let list = state.contracts ? state.contracts.slice() : [];
        
        if (query) {
            list = list.filter(contract => {
                const customer = getCustomerById(contract.customerId);
                const unit = getUnitById(contract.unitId);
                const searchable = `${customer?.name || ''} ${unit?.name || ''} ${contract.type || ''}`.toLowerCase();
                return searchable.includes(query);
            });
        }
        
        const rows = list.map(contract => {
            const customer = getCustomerById(contract.customerId);
            const unit = getUnitById(contract.unitId);
            return [
                `<a href="#" onclick="nav('contract-details', '${contract.id}')">${customer?.name || ''}</a>`,
                unit?.name || '',
                contract.type || '',
                contract.startDate || '',
                `<button class="btn btn-secondary btn-sm" onclick="deleteContract('${contract.id}')">حذف</button>`
            ];
        });
        
        const listElement = document.getElementById('co-list');
        if (listElement) {
            listElement.innerHTML = table(
                ['العميل', 'الوحدة', 'النوع', 'تاريخ البداية', ''],
                rows
            );
        }
    } catch (error) {
        console.error('Error in drawContracts:', error);
    }
}

function addContract() {
    try {
        const customerId = document.getElementById('co-customer').value;
        const unitId = document.getElementById('co-unit').value;
        const type = document.getElementById('co-type').value;
        const startDate = document.getElementById('co-startDate').value;
        const price = parseNumber(document.getElementById('co-price').value);
        
        if (!customerId || !unitId || !startDate) {
            return alert('الرجاء إدخال جميع البيانات المطلوبة.');
        }

        saveState();
        const newContract = {
            id: generateId('CO'),
            customerId,
            unitId,
            type,
            startDate,
            price,
            status: 'نشط',
            createdAt: new Date().toISOString()
        };
        
        state.contracts.push(newContract);
        logAction('إنشاء عقد جديد', {
            id: newContract.id,
            customerId: newContract.customerId,
            unitId: newContract.unitId
        });
        
        saveState();
        drawContracts();
        showNotification('تم إنشاء العقد بنجاح', 'success');
        
    } catch (error) {
        console.error('Error in addContract:', error);
        showNotification('حدث خطأ في إنشاء العقد', 'danger');
    }
}

function deleteContract(id) {
    try {
        const contract = state.contracts.find(c => c.id === id);
        if (!contract) return;
        
        if (confirm('هل أنت متأكد من حذف هذا العقد؟')) {
            saveState();
            state.contracts = state.contracts.filter(c => c.id !== id);
            logAction('حذف عقد', {
                id: contract.id
            });
            saveState();
            drawContracts();
            showNotification('تم حذف العقد بنجاح', 'success');
        }
    } catch (error) {
        console.error('Error in deleteContract:', error);
        showNotification('حدث خطأ في حذف العقد', 'danger');
    }
}

/* ===== OTHER SECTIONS ===== */
function renderBrokers() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>السماسرة</h3>
                <p>سيتم إضافة صفحة السماسرة قريباً</p>
                <button class="btn btn-secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('السماسرة', 'إدارة السماسرة', '🤝');
        
    } catch (error) {
        console.error('Error in renderBrokers:', error);
        showNotification('حدث خطأ في عرض السماسرة', 'danger');
    }
}

function renderPartners() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>الشركاء</h3>
                <p>سيتم إضافة صفحة الشركاء قريباً</p>
                <button class="btn btn-secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('الشركاء', 'إدارة الشركاء', '👨‍💼');
        
    } catch (error) {
        console.error('Error in renderPartners:', error);
        showNotification('حدث خطأ في عرض الشركاء', 'danger');
    }
}

function renderInstallments() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>الأقساط</h3>
                <p>سيتم إضافة صفحة الأقساط قريباً</p>
                <button class="btn btn-secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('الأقساط', 'إدارة الأقساط', '💰');
        
    } catch (error) {
        console.error('Error in renderInstallments:', error);
        showNotification('حدث خطأ في عرض الأقساط', 'danger');
    }
}

function renderVouchers() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>السندات</h3>
                <p>سيتم إضافة صفحة السندات قريباً</p>
                <button class="btn btn-secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('السندات', 'إدارة السندات', '🧾');
        
    } catch (error) {
        console.error('Error in renderVouchers:', error);
        showNotification('حدث خطأ في عرض السندات', 'danger');
    }
}

function renderTreasury() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>الخزينة</h3>
                <p>سيتم إضافة صفحة الخزينة قريباً</p>
                <button class="btn btn-secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('الخزينة', 'إدارة الخزينة', '🏦');
        
    } catch (error) {
        console.error('Error in renderTreasury:', error);
        showNotification('حدث خطأ في عرض الخزينة', 'danger');
    }
}

function renderReports() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>التقارير</h3>
                <p>سيتم إضافة صفحة التقارير قريباً</p>
                <button class="btn btn-secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('التقارير', 'التقارير والإحصائيات', '📈');
        
    } catch (error) {
        console.error('Error in renderReports:', error);
        showNotification('حدث خطأ في عرض التقارير', 'danger');
    }
}

function renderAuditLog() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>سجل التغييرات</h3>
                <p>سيتم إضافة صفحة سجل التغييرات قريباً</p>
                <button class="btn btn-secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('سجل التغييرات', 'سجل جميع التغييرات', '📝');
        
    } catch (error) {
        console.error('Error in renderAuditLog:', error);
        showNotification('حدث خطأ في عرض سجل التغييرات', 'danger');
    }
}

function renderBackup() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>النسخ الاحتياطية</h3>
                <p>سيتم إضافة صفحة النسخ الاحتياطية قريباً</p>
                <button class="btn btn-secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('النسخ الاحتياطية', 'إدارة النسخ الاحتياطية', '💾');
        
    } catch (error) {
        console.error('Error in renderBackup:', error);
        showNotification('حدث خطأ في عرض النسخ الاحتياطية', 'danger');
    }
}

/* ===== UTILITY FUNCTIONS ===== */
function updatePageHeader(title, subtitle, icon) {
    try {
        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');
        const pageIcon = document.getElementById('page-icon');
        
        if (pageTitle) pageTitle.textContent = title;
        if (pageSubtitle) pageSubtitle.textContent = subtitle;
        if (pageIcon) pageIcon.textContent = icon;
    } catch (error) {
        console.error('Error updating page header:', error);
    }
}

function showNotification(message, type, duration) {
    try {
        const notificationsContainer = document.getElementById('notifications');
        if (!notificationsContainer) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + (type || 'info') + ' fade-in';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notificationsContainer.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(function() {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration || 5000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        warning: '⚠️',
        danger: '❌',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

function generateId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveState() {
    try {
        localStorage.setItem(APPKEY, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function checkLock() {
    if (state.locked) {
        const password = prompt('اكتب كلمة المرور للدخول');
        if (password !== state.settings.pass) {
            alert('كلمة مرور غير صحيحة');
            location.reload();
        }
    }
}

function logAction(description, details) {
    try {
        state.auditLog.push({
            id: generateId('LOG'),
            timestamp: new Date().toISOString(),
            description,
            details
        });
    } catch (error) {
        console.error('Error logging action:', error);
    }
}

function parseNumber(value) {
    value = String(value || '').replace(/[^\d.]/g, '');
    return Number(value || 0);
}

function getCustomerById(id) {
    return state.customers ? state.customers.find(c => c.id === id) : null;
}

function getUnitById(id) {
    return state.units ? state.units.find(u => u.id === id) : null;
}

function table(headers, rows) {
    try {
        const head = headers.map(h => `<th>${h}</th>`).join('');
        const body = rows.length ? 
            rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : 
            `<tr><td colspan="${headers.length}"><small>لا توجد بيانات</small></td></tr>`;
        
        return `<table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    } catch (error) {
        console.error('Error creating table:', error);
        return '<p>خطأ في عرض الجدول</p>';
    }
}

/* ===== UNDO/REDO SYSTEM ===== */
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const restoredState = JSON.parse(JSON.stringify(historyStack[historyIndex]));
        Object.keys(state).forEach(key => delete state[key]);
        Object.assign(state, restoredState);
        saveState();
        nav(currentView, currentParam);
        updateUndoRedoButtons();
    }
}

function redo() {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        const restoredState = JSON.parse(JSON.stringify(historyStack[historyIndex]));
        Object.keys(state).forEach(key => delete state[key]);
        Object.assign(state, restoredState);
        saveState();
        nav(currentView, currentParam);
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    try {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = historyIndex <= 0;
            undoBtn.classList.toggle('opacity-50', historyIndex <= 0);
        }
        if (redoBtn) {
            redoBtn.disabled = historyIndex >= historyStack.length - 1;
            redoBtn.classList.toggle('opacity-50', historyIndex >= historyStack.length - 1);
        }
    } catch (error) {
        console.error('Error updating undo/redo buttons:', error);
    }
}
