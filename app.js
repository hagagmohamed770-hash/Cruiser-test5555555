/*
    Real Estate Management App - Simplified Version
    Author: Jules
    Date: 2025-08-19
    Description: A simplified, robust version with proper error handling
*/

/* ===== GLOBAL STATE & CONFIG ===== */
const APPKEY = 'estate_pro_simple_v1';
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
                applySettings();
            });
        }
        
        // Font selector
        const fontSelector = document.getElementById('font-selector');
        if (fontSelector) {
            fontSelector.addEventListener('change', function() {
                applySettings();
            });
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

function renderDash() {
    try {
        console.log('Rendering dashboard...');
        
        const totalCustomers = state.customers ? state.customers.length : 0;
        const totalUnits = state.units ? state.units.length : 0;
        const totalContracts = state.contracts ? state.contracts.length : 0;
        const totalPartners = state.partners ? state.partners.length : 0;
        
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
            
            <div class="quick-actions">
                <h3>إجراءات سريعة</h3>
                <div class="action-buttons">
                    <button class="btn" onclick="nav('customers')">
                        <span class="nav-icon">👥</span>
                        إضافة عميل
                    </button>
                    <button class="btn" onclick="nav('units')">
                        <span class="nav-icon">🏠</span>
                        إضافة وحدة
                    </button>
                    <button class="btn" onclick="nav('contracts')">
                        <span class="nav-icon">📋</span>
                        إضافة عقد
                    </button>
                    <button class="btn" onclick="nav('partners')">
                        <span class="nav-icon">👨‍💼</span>
                        إضافة شريك
                    </button>
                </div>
            </div>
            
            <div class="welcome-message">
                <h2>مرحباً بك في نظام إدارة الاستثمار العقاري</h2>
                <p>استخدم القائمة الجانبية للتنقل بين الأقسام المختلفة</p>
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

function renderCustomers() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>العملاء</h3>
                <p>سيتم إضافة صفحة العملاء قريباً</p>
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('العملاء', 'إدارة بيانات العملاء', '👥');
        
    } catch (error) {
        console.error('Error in renderCustomers:', error);
        showNotification('حدث خطأ في عرض العملاء', 'danger');
    }
}

function renderUnits() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>الوحدات</h3>
                <p>سيتم إضافة صفحة الوحدات قريباً</p>
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('الوحدات', 'إدارة الوحدات العقارية', '🏠');
        
    } catch (error) {
        console.error('Error in renderUnits:', error);
        showNotification('حدث خطأ في عرض الوحدات', 'danger');
    }
}

function renderContracts() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>العقود</h3>
                <p>سيتم إضافة صفحة العقود قريباً</p>
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('العقود', 'إدارة العقود', '📋');
        
    } catch (error) {
        console.error('Error in renderContracts:', error);
        showNotification('حدث خطأ في عرض العقود', 'danger');
    }
}

function renderBrokers() {
    try {
        const view = document.getElementById('view');
        if (!view) return;
        
        view.innerHTML = `
            <div class="card">
                <h3>السماسرة</h3>
                <p>سيتم إضافة صفحة السماسرة قريباً</p>
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
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
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
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
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
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
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
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
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
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
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
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
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
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
                <button class="btn secondary" onclick="nav('dash')">العودة للوحة التحكم</button>
            </div>
        `;
        
        updatePageHeader('النسخ الاحتياطية', 'إدارة النسخ الاحتياطية', '💾');
        
    } catch (error) {
        console.error('Error in renderBackup:', error);
        showNotification('حدث خطأ في عرض النسخ الاحتياطية', 'danger');
    }
}

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
    // Placeholder for lock functionality
}

function updateUndoRedoButtons() {
    // Placeholder for undo/redo functionality
}
