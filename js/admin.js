/**
 * Sharks Group Enterprise Suite - Admin Portal Controller
 * =======================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initAdminApp();
});

const VALID_ADMIN_TABS = ['dashboard', 'overview', 'suppliers', 'projects', 'tasks', 'employees', 'careers'];

function getInitialAdminTab() {
    try {
        const hash = (window.location.hash || '').replace('#', '').trim();
        if (hash && VALID_ADMIN_TABS.includes(hash)) {
            return hash;
        }
        const stored = sessionStorage.getItem('sharks_admin_active_tab');
        if (stored && VALID_ADMIN_TABS.includes(stored)) {
            return stored;
        }
    } catch (e) {}
    return 'dashboard';
}

let currentAdminTab = getInitialAdminTab();
let editingSupplierId = null;
let editingProjectId = null;
let editingTaskId = null;
let editingEmployeeId = null;

// -------------------------------------------------------------------
// Theme Switcher (Day / Night Mode - Default is always Light)
// -------------------------------------------------------------------
function initAdminTheme() {
    const savedTheme = localStorage.getItem('sharks_admin_theme_v2') || localStorage.getItem('sharks_theme_v2') || 'light';
    applyAdminTheme(savedTheme);
}

function applyAdminTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    const toggleBtn = document.getElementById('adminThemeToggle');
    if (toggleBtn) {
        toggleBtn.setAttribute('title', theme === 'light' ? 'التبديل إلى الوضع الليلي' : 'التبديل إلى الوضع النهاري');
    }
}

function toggleAdminTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    applyAdminTheme(newTheme);
    localStorage.setItem('sharks_admin_theme_v2', newTheme);
    localStorage.setItem('sharks_theme_v2', newTheme);
    localStorage.setItem('sharks_admin_theme', newTheme);
    localStorage.setItem('sharks_theme', newTheme);

    // Shockwave pulse animation matching user interface
    const toggleBtn = document.getElementById('adminThemeToggle');
    if (toggleBtn) {
        toggleBtn.classList.remove('pulse-active');
        void toggleBtn.offsetWidth; // force browser repaint
        toggleBtn.classList.add('pulse-active');
        setTimeout(() => toggleBtn.classList.remove('pulse-active'), 750);
    }
}

// Cinematic Splash Screen Controller with Session-Based Cache (User Request 4)
let adminSplashTimeout = null;

function initAdminSplashScreen() {
    const splash = document.getElementById('sharksSplashScreen');
    if (!splash) return;

    // Show splash screen only once per browser session (disappears on next pages, reappears when closing and reopening)
    const sessionShown = sessionStorage.getItem('sharks_admin_splash_shown');
    if (sessionShown === 'true') {
        splash.style.display = 'none';
        return;
    }

    sessionStorage.setItem('sharks_admin_splash_shown', 'true');

    const statusText = document.getElementById('splashStatusText');

    splash.style.cursor = 'pointer';
    splash.addEventListener('click', dismissAdminSplashScreen);
    splash.addEventListener('touchstart', dismissAdminSplashScreen, { passive: true });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
            dismissAdminSplashScreen();
        }
    }, { once: true });

    setTimeout(() => {
        if (statusText) {
            statusText.textContent = 'مرحباً بكم في بوابة الإدارة المركزية ✓';
            statusText.style.color = '#fbbf24';
        }
    }, 1100);

    adminSplashTimeout = setTimeout(() => {
        dismissAdminSplashScreen();
    }, 2000);
}

function dismissAdminSplashScreen() {
    const splash = document.getElementById('sharksSplashScreen');
    if (!splash || splash.classList.contains('splash-fade-out')) return;

    if (adminSplashTimeout) clearTimeout(adminSplashTimeout);
    splash.classList.add('splash-fade-out');

    setTimeout(() => {
        splash.style.display = 'none';
    }, 550);
}
window.dismissAdminSplashScreen = dismissAdminSplashScreen;

let lastActivityUpdate = 0;
function setupInactivityTracking() {
    const updateThrottled = () => {
        const now = Date.now();
        if (now - lastActivityUpdate > 30000) { // update every 30 seconds of activity
            lastActivityUpdate = now;
            if (window.SharksCloud) SharksCloud.updateSessionActivity();
        }
    };
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, updateThrottled, { passive: true });
    });
}

function initAdminApp() {
    initAdminTheme();
    initAdminSplashScreen();

    // Check if session exists (Only logout on explicit logout - Request 2)
    const session = SharksCloud.checkAuth();
    if (session) {
        showDashboardView(session);
    } else {
        showLoginView();
    }

    setupLoginEvents();
    setupAdminTabs();
    setupModals();
}

// -------------------------------------------------------------------
// 1. Auth & View State
// -------------------------------------------------------------------
function showLoginView() {
    document.getElementById('adminLoginWrapper').style.display = 'flex';
    document.getElementById('adminDashboardWrapper').style.display = 'none';

    // Clear password input and reset login form completely (Request 1)
    const loginPass = document.getElementById('loginPassword');
    if (loginPass) {
        loginPass.value = '';
    }
    const errorAlert = document.getElementById('loginErrorAlert');
    if (errorAlert) {
        errorAlert.textContent = '';
        errorAlert.style.display = 'none';
    }
}

function showDashboardView(session) {
    document.getElementById('adminLoginWrapper').style.display = 'none';
    document.getElementById('adminDashboardWrapper').style.display = 'flex';

    if (session && session.user) {
        const userNameEl = document.getElementById('adminUserName');
        if (userNameEl) userNameEl.textContent = session.user.name || 'ENG. Ahmed Khaled';
        const userRoleEl = document.getElementById('adminUserRole');
        if (userRoleEl) userRoleEl.textContent = session.user.title || session.user.role || 'المؤسس والمدير العام';
        renderUserAvatar(session.user);
    }

    // Render current active tab
    switchAdminTab(currentAdminTab);
}

// -------------------------------------------------------------------
// User Profile & Avatar Management (Request 2)
// -------------------------------------------------------------------
function renderUserAvatar(user) {
    const container = document.getElementById('adminAvatarContainer');
    if (!container || !user) return;
    const avatarUrl = SharksCloud.getUserAvatar(user.username);
    if (avatarUrl) {
        container.innerHTML = `<img src="${avatarUrl}" alt="${escapeHtml(user.name)}" class="adm-avatar-img" id="adminAvatarImg">`;
    } else {
        container.innerHTML = `
            <div class="adm-avatar-empty" title="الصورة غير محددة (اضغط للرفع)">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
        `;
    }
}

function triggerAvatarUpload() {
    const fileInput = document.getElementById('adminAvatarFileInput');
    if (fileInput) fileInput.click();
}

function handleAvatarFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        const session = SharksCloud.checkAuth();
        const username = session && session.user ? session.user.username : 'ahmedkhaled';
        SharksCloud.setUserAvatar(username, dataUrl);
        if (session && session.user) {
            session.user.avatar = dataUrl;
            renderUserAvatar(session.user);
        }
        showToast('تم حفظ صورتك الشخصية بنجاح!');
    };
    reader.readAsDataURL(file);
}

// -------------------------------------------------------------------
// Forgot Password & SMS OTP Recovery (Request 1)
// -------------------------------------------------------------------
function openForgotPasswordModal() {
    const s1 = document.getElementById('fpStep1');
    const s2 = document.getElementById('fpStep2');
    const s3 = document.getElementById('fpStep3');
    if (s1) s1.style.display = 'block';
    if (s2) s2.style.display = 'none';
    if (s3) s3.style.display = 'none';

    const pErr = document.getElementById('fpPhoneError');
    if (pErr) pErr.style.display = 'none';
    const oErr = document.getElementById('fpOtpError');
    if (oErr) oErr.style.display = 'none';
    const rErr = document.getElementById('fpResetError');
    if (rErr) rErr.style.display = 'none';

    const phoneInp = document.getElementById('fpPhoneInput');
    if (phoneInp) phoneInp.value = '';
    const otpInp = document.getElementById('fpOtpInput');
    if (otpInp) otpInp.value = '';
    const newPassInp = document.getElementById('fpNewPasswordInput');
    if (newPassInp) newPassInp.value = '';

    openModal('modalForgotPassword');
}

function backToFpStep1() {
    document.getElementById('fpStep1').style.display = 'block';
    document.getElementById('fpStep2').style.display = 'none';
    document.getElementById('fpStep3').style.display = 'none';
}

function handleRequestOtpSubmit() {
    const phoneInput = document.getElementById('fpPhoneInput');
    const phoneErr = document.getElementById('fpPhoneError');
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!phone) {
        if (phoneErr) {
            phoneErr.textContent = 'يرجى إدخال رقم الهاتف المعتمد.';
            phoneErr.style.display = 'block';
        }
        return;
    }

    const res = SharksCloud.requestPasswordResetOTP(phone);
    if (!res.success) {
        if (phoneErr) {
            phoneErr.textContent = res.error;
            phoneErr.style.display = 'block';
        }
        return;
    }

    if (phoneErr) phoneErr.style.display = 'none';
    document.getElementById('fpStep1').style.display = 'none';
    document.getElementById('fpStep2').style.display = 'block';

    const alertBox = document.getElementById('fpOtpSentAlert');
    if (alertBox) {
        alertBox.innerHTML = `
            <div>✓ تم التحقق من رقم هاتف الإدارة: <strong>${res.phone}</strong></div>
            <div style="margin-top:6px; font-weight:700; color:var(--adm-gold);">كود التحقق الأمني (OTP): <span style="font-size:1.25rem; letter-spacing:4px; font-family:'JetBrains Mono',monospace; background:rgba(0,0,0,0.3); padding:2px 8px; border-radius:4px;">${res.code}</span></div>
            <div style="font-size:0.75rem; color:var(--adm-text-dim); margin-top:4px;">(صالح للاستخدام لمرة واحدة لمدة 10 دقائق)</div>
        `;
    }
    const otpInp = document.getElementById('fpOtpInput');
    if (otpInp) {
        otpInp.value = '';
        otpInp.focus();
    }
}

function handleVerifyOtpSubmit() {
    const otpInput = document.getElementById('fpOtpInput');
    const otpErr = document.getElementById('fpOtpError');
    const code = otpInput ? otpInput.value.trim() : '';

    if (!code || code.length < 6) {
        if (otpErr) {
            otpErr.textContent = 'يرجى إدخال كود التحقق المكون من 6 أرقام.';
            otpErr.style.display = 'block';
        }
        return;
    }

    const res = SharksCloud.verifyOTP(code);
    if (!res.success) {
        if (otpErr) {
            otpErr.textContent = res.error;
            otpErr.style.display = 'block';
        }
        return;
    }

    if (otpErr) otpErr.style.display = 'none';
    document.getElementById('fpStep2').style.display = 'none';
    document.getElementById('fpStep3').style.display = 'block';

    const newPassInp = document.getElementById('fpNewPasswordInput');
    if (newPassInp) {
        newPassInp.value = '';
        newPassInp.focus();
    }
}

function handleResetPasswordSubmit() {
    const userSelect = document.getElementById('fpUserSelect');
    const newPassInput = document.getElementById('fpNewPasswordInput');
    const resetErr = document.getElementById('fpResetError');

    const targetUser = userSelect ? userSelect.value : 'ahmedkhaled';
    const newPass = newPassInput ? newPassInput.value : '';

    if (!newPass || newPass.length < 6) {
        if (resetErr) {
            resetErr.textContent = 'يجب ألا تقل كلمة المرور الجديدة عن 6 خانات.';
            resetErr.style.display = 'block';
        }
        return;
    }

    const res = SharksCloud.resetPassword(targetUser, newPass);
    if (!res.success) {
        if (resetErr) {
            resetErr.textContent = res.error;
            resetErr.style.display = 'block';
        }
        return;
    }

    closeModal('modalForgotPassword');
    showToast(res.message || 'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول.');

    // Prefill username on login screen
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) loginEmail.value = targetUser;
    const loginPass = document.getElementById('loginPassword');
    if (loginPass) {
        loginPass.value = '';
        loginPass.focus();
    }
}

function setupLoginEvents() {
    const loginForm = document.getElementById('adminLoginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorAlert = document.getElementById('loginErrorAlert');

        const result = SharksCloud.login(email, password);
        if (result.success) {
            document.documentElement.classList.add('adm-logged-in');
            errorAlert.style.display = 'none';
            showToast('تم تسجيل الدخول بنجاح! مرحباً بك في لوحة الإدارة.');
            currentAdminTab = 'dashboard';
            try {
                sessionStorage.setItem('sharks_admin_active_tab', 'dashboard');
                localStorage.removeItem('sharks_admin_active_tab');
            } catch(e) {}
            showDashboardView(result.session);
        } else {
            errorAlert.textContent = result.error || 'بيانات تسجيل الدخول غير صحيحة';
            errorAlert.style.display = 'block';
        }
    });

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة الإدارة؟')) {
                document.documentElement.classList.remove('adm-logged-in');
                try {
                    sessionStorage.removeItem('sharks_admin_active_tab');
                    localStorage.removeItem('sharks_admin_active_tab');
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                } catch(e) {}
                SharksCloud.logout();
                showToast('تم تسجيل الخروج بأمان.');
                showLoginView();
                const pass = document.getElementById('loginPassword');
                if (pass) {
                    pass.value = '';
                    pass.blur();
                }
            }
        });
    }
}

// -------------------------------------------------------------------
// 2. Navigation Tabs
// -------------------------------------------------------------------
function setupAdminTabs() {
    const tabButtons = document.querySelectorAll('.adm-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab) {
                switchAdminTab(targetTab);
            }
        });
    });
}

function switchAdminTab(tabName) {
    if (!VALID_ADMIN_TABS.includes(tabName)) tabName = 'dashboard';
    currentAdminTab = tabName;
    try {
        sessionStorage.setItem('sharks_admin_active_tab', tabName);
        document.documentElement.setAttribute('data-admin-active-tab', tabName);
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#' + tabName);
        }
    } catch (e) {}

    // Update active tab buttons
    document.querySelectorAll('.adm-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update active panels
    document.querySelectorAll('.adm-view-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`panel-${tabName}`);
    if (activePanel) {
        activePanel.classList.add('active');
    }

    // Clear unread badge for the opened tab
    if (typeof SharksCloud !== 'undefined' && SharksCloud.clearUnreadBadge) {
        SharksCloud.clearUnreadBadge(tabName);
    }
    updateAdminTabBadges();

    // Refresh data for the active panel
    if (tabName === 'overview') renderOverviewKPIs();
    if (tabName === 'dashboard') renderClassicDashboard();
    if (tabName === 'suppliers') {
        localStorage.setItem('sharks_suppliers_badge_hidden', 'true');
        const badgeSup = document.getElementById('badgeTabSuppliers');
        if (badgeSup) badgeSup.style.display = 'none';
        const badgeApps = document.getElementById('badgeSupplierAppsCount');
        if (badgeApps) badgeApps.style.display = 'none';
        renderSupplierApplicationsTable();
        renderSuppliersTable();
    }
    if (tabName === 'projects') renderProjectsTable();
    if (tabName === 'tasks') renderTasksTable();
    if (tabName === 'employees') renderEmployeesTable();
    if (tabName === 'careers') renderCareersTable();
}

// -------------------------------------------------------------------
// Dynamic Red Notification Badges for Admin Tabs (Request 3)
// -------------------------------------------------------------------
function updateAdminTabBadges() {
    if (typeof SharksCloud === 'undefined' || !SharksCloud.getUnreadBadges) return;
    const unread = SharksCloud.getUnreadBadges();

    const badgeDefs = [
        { id: 'badgeTabSuppliers', key: 'suppliers', count: unread.suppliers || 0 },
        { id: 'badgeTabProjects', key: 'projects', count: unread.projects || 0 },
        { id: 'badgeTabTasks', key: 'tasks', count: unread.tasks || 0 },
        { id: 'badgeTabEmployees', key: 'employees', count: unread.employees || 0 },
        { id: 'badgeTabCareers', key: 'careers', count: unread.careers || 0 }
    ];

    badgeDefs.forEach(b => {
        const elem = document.getElementById(b.id);
        if (!elem) return;
        if (currentAdminTab === b.key || b.count <= 0) {
            elem.style.display = 'none';
            elem.textContent = '0';
            elem.classList.remove('active-alert');
        } else {
            elem.textContent = b.count;
            elem.style.display = 'inline-flex';
            elem.classList.add('active-alert');
        }
    });
}
window.updateAdminTabBadges = updateAdminTabBadges;

// -------------------------------------------------------------------
// 3. Operational Overview & Analytics (Request 1)
// -------------------------------------------------------------------
function renderDashboardOverview() {
    renderOverviewKPIs();
    renderClassicDashboard();
}

function renderOverviewKPIs() {
    if (typeof SharksCloud === 'undefined') return;
    const stats = SharksCloud.getStats();

    const supTot = document.getElementById('statSuppliersTotal');
    if (supTot) supTot.textContent = stats.suppliersCount;

    const supPub = document.getElementById('statSuppliersPublic');
    if (supPub) supPub.textContent = stats.publicSuppliersCount;

    const projCnt = document.getElementById('statProjectsCount');
    if (projCnt) projCnt.textContent = stats.projectsCount;

    const taskCnt = document.getElementById('statTasksCount');
    if (taskCnt) taskCnt.textContent = stats.tasksCount;

    const empCnt = document.getElementById('statEmployeesCount');
    if (empCnt) empCnt.textContent = stats.employeesCount;

    // Update Red Tab Badges for additions (shows newly added unread items only)
    updateAdminTabBadges();

    // Render Recent Activities (Request 6: Date & Time in Recent Activities Log)
    const activitiesContainer = document.getElementById('adminRecentActivities');
    if (activitiesContainer) {
        const list = SharksCloud.getActivities();
        if (list.length === 0) {
            activitiesContainer.innerHTML = `<p style="color:var(--adm-text-dim); text-align:center; padding:24px;">لا توجد أنشطة مسجلة حتى الآن.</p>`;
        } else {
            activitiesContainer.innerHTML = list.map(item => `
                <div class="adm-activity-item" style="display:flex; justify-content:space-between; align-items:center; padding:13px 18px; border-bottom:1px solid var(--adm-border-subtle); transition:background 0.2s;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="color:var(--adm-gold); font-size:1.15rem;">⚡</span>
                        <span class="adm-activity-text" style="font-size:0.92rem; font-weight:600;">${escapeHtml(item.text)}</span>
                    </div>
                    <div class="adm-activity-meta">
                        <span class="adm-activity-time">🕒 ${item.time || ''}</span>
                        ${item.date ? `<span class="adm-activity-date">📅 ${item.date}</span>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }
}

// Smart Construction 3D Slider Controller
const adminSlideTitles = [
    { title: 'صب الأساسات الخرسانية الكبرى', status: '92% مكتمل', fill: '92%' },
    { title: 'شبكات ومحطات البنية التحتية والمياه', status: '85% مكتمل', fill: '85%' },
    { title: 'الإشراف الهندسي وإدارة المشروعات', status: '98% جاهزية', fill: '98%' },
    { title: 'أعمال تمهيد ورصف شبكات الطرق', status: '78% مكتمل', fill: '78%' },
    { title: 'أعمال الحفر والردم والتجهيزات الإنشائية', status: '100% مستلم', fill: '100%' }
];
let adminSmartSliderTimer = null;
let currentAdminSmartSlide = 0;

function switchAdminSmartSlide(index) {
    currentAdminSmartSlide = index;
    const slides = document.querySelectorAll('#adminSmartSliderTrack .smart-slide');
    const dots = document.querySelectorAll('#adminSmartSliderDots .smart-slider-dot');

    slides.forEach((s, idx) => {
        if (idx === index) s.classList.add('active');
        else s.classList.remove('active');
    });

    dots.forEach((d, idx) => {
        if (idx === index) d.classList.add('active');
        else d.classList.remove('active');
    });

    const info = adminSlideTitles[index] || adminSlideTitles[0];
    const statusEl = document.getElementById('adminDashConstructionStatus');
    const fillEl = document.getElementById('adminDashConstructionFill');
    const projectEl = document.getElementById('adminDashActiveSiteProject');

    if (statusEl) statusEl.textContent = info.status;
    if (fillEl) fillEl.style.width = info.fill;
    if (projectEl) projectEl.textContent = info.title;
}

function initAdminSmartSlider() {
    if (adminSmartSliderTimer) clearInterval(adminSmartSliderTimer);
    switchAdminSmartSlide(currentAdminSmartSlide);
    adminSmartSliderTimer = setInterval(() => {
        currentAdminSmartSlide = (currentAdminSmartSlide + 1) % 5;
        switchAdminSmartSlide(currentAdminSmartSlide);
    }, 7000);
}

function renderClassicDashboard() {
    initAdminSmartSlider();

    const tasks = SharksCloud.getTasks();
    const projects = SharksCloud.getProjects(false);
    const employees = SharksCloud.getEmployees();
    const activities = SharksCloud.getActivities();

    // 1. Tasks Completion Arc Metric
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done' || t.status === 'مكتمل' || t.status === 'مكتملة').length;
    const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const taskExecPercentEl = document.getElementById('adminDashTaskExecPercent');
    if (taskExecPercentEl) taskExecPercentEl.textContent = taskPercent + '%';

    const compTasksEl = document.getElementById('adminDashCompletedTasksCount');
    if (compTasksEl) compTasksEl.textContent = completedTasks;

    const allTasksEl = document.getElementById('adminDashTasksCount');
    if (allTasksEl) allTasksEl.textContent = totalTasks;

    const gaugeTasks = document.getElementById('adminDashGaugeTasks');
    if (gaugeTasks) {
        const circumference = 251.2;
        const offset = circumference - (taskPercent / 100) * circumference;
        gaugeTasks.style.strokeDashoffset = offset;
    }

    // 2. Projects Arc Metric (Dynamic calculation)
    const inProgressProjects = projects.filter(p => p.status === 'قيد التنفيذ' || p.status === 'active' || p.status === 'inprogress' || !p.status || p.status === 'جاري التنفيذ').length;
    const reviewProjects = projects.filter(p => p.status === 'قيد المراجعة' || p.status === 'review').length;
    const completedProjects = projects.filter(p => p.status === 'مكتمل ومستلم' || p.status === 'مكتمل' || p.status === 'completed' || p.status === 'done').length;
    const totalP = projects.length;

    const projCountEl = document.getElementById('adminDashProjectsCount');
    if (projCountEl) projCountEl.textContent = totalP;

    const projPercent = totalP > 0 ? Math.round((completedProjects / totalP) * 100) : 0;
    const gaugeProj = document.getElementById('adminDashGaugeProjects');
    if (gaugeProj) {
        const circumference = 251.2;
        const offset = circumference - (projPercent / 100) * circumference;
        gaugeProj.style.strokeDashoffset = offset;
    }

    // 3. Spaces Comparison Chart ("توزيع الأعمال والمشاريع" - Request 4: 3 Pillars)
    let inProgressPct = 0;
    let reviewPct = 0;
    let completedPct = 0;
    if (totalP > 0) {
        inProgressPct = Math.round((inProgressProjects / totalP) * 100);
        reviewPct = Math.round((reviewProjects / totalP) * 100);
        completedPct = Math.max(0, 100 - (inProgressPct + reviewPct));
    }

    const inProgValEl = document.getElementById('adminDashInProgressVal');
    if (inProgValEl) inProgValEl.textContent = inProgressPct + '%';
    const inProgTagEl = document.getElementById('adminDashInProgressTag');
    if (inProgTagEl) inProgTagEl.textContent = inProgressPct + '%';
    const inProgPillar = document.getElementById('adminDashInProgressPillar');
    if (inProgPillar) inProgPillar.style.height = `${Math.max(25, inProgressPct * 1.5)}px`;

    const reviewValEl = document.getElementById('adminDashReviewVal');
    if (reviewValEl) reviewValEl.textContent = reviewPct + '%';
    const reviewTagEl = document.getElementById('adminDashReviewTag');
    if (reviewTagEl) reviewTagEl.textContent = reviewPct + '%';
    const reviewPillar = document.getElementById('adminDashReviewPillar');
    if (reviewPillar) reviewPillar.style.height = `${Math.max(25, reviewPct * 1.5)}px`;

    const compValEl = document.getElementById('adminDashCompletedVal');
    if (compValEl) compValEl.textContent = completedPct + '%';
    const compTagEl = document.getElementById('adminDashCompletedTag');
    if (compTagEl) compTagEl.textContent = completedPct + '%';
    const compPillar = document.getElementById('adminDashCompletedPillar');
    if (compPillar) compPillar.style.height = `${Math.max(25, completedPct * 1.5)}px`;

    const empCountEl = document.getElementById('adminDashEmployeesCount');
    if (empCountEl) empCountEl.textContent = `${employees.length} موظفين`;

    // Suppliers Statistics & Space Bars (Pillars) for "توزيع الأعمال والمشاريع"
    const allSupplierApps = SharksCloud.getSupplierApplications ? SharksCloud.getSupplierApplications() : [];
    const registeredSupCount = allSupplierApps.length;
    const approvedSupCount = allSupplierApps.filter(a => a.status === 'معتمد').length;
    const rejectedSupCount = allSupplierApps.filter(a => a.status === 'مرفوض').length;

    // Side stats in card
    const supRegEl = document.getElementById('adminDashSuppliersRegistered');
    if (supRegEl) supRegEl.textContent = `${registeredSupCount} مورد`;
    const supAppEl = document.getElementById('adminDashSuppliersApproved');
    if (supAppEl) supAppEl.textContent = `${approvedSupCount} مورد`;
    const supRejEl = document.getElementById('adminDashSuppliersRejected');
    if (supRejEl) supRejEl.textContent = `${rejectedSupCount} مورد`;

    // Space Bars (Pillars)
    const supRegValEl = document.getElementById('adminDashSupRegisteredVal');
    if (supRegValEl) supRegValEl.textContent = registeredSupCount;
    const supRegTagEl = document.getElementById('adminDashSupRegisteredTag');
    if (supRegTagEl) supRegTagEl.textContent = `${registeredSupCount} طلب`;
    const supRegPillar = document.getElementById('adminDashSupRegisteredPillar');
    if (supRegPillar) {
        const height = registeredSupCount > 0 ? Math.min(130, Math.max(30, 40 + registeredSupCount * 18)) : 25;
        supRegPillar.style.height = `${height}px`;
    }

    const supAppValEl = document.getElementById('adminDashSupApprovedVal');
    if (supAppValEl) supAppValEl.textContent = approvedSupCount;
    const supAppTagEl = document.getElementById('adminDashSupApprovedTag');
    if (supAppTagEl) {
        const appPct = registeredSupCount > 0 ? Math.round((approvedSupCount / registeredSupCount) * 100) : 0;
        supAppTagEl.textContent = `${appPct}%`;
    }
    const supAppPillar = document.getElementById('adminDashSupApprovedPillar');
    if (supAppPillar) {
        const height = registeredSupCount > 0 ? Math.min(130, Math.max(25, 30 + (approvedSupCount / registeredSupCount) * 85)) : 25;
        supAppPillar.style.height = `${height}px`;
    }

    const supRejValEl = document.getElementById('adminDashSupRejectedVal');
    if (supRejValEl) supRejValEl.textContent = rejectedSupCount;
    const supRejTagEl = document.getElementById('adminDashSupRejectedTag');
    if (supRejTagEl) {
        const rejPct = registeredSupCount > 0 ? Math.round((rejectedSupCount / registeredSupCount) * 100) : 0;
        supRejTagEl.textContent = `${rejPct}%`;
    }
    const supRejPillar = document.getElementById('adminDashSupRejectedPillar');
    if (supRejPillar) {
        const height = registeredSupCount > 0 ? Math.min(130, Math.max(25, 25 + (rejectedSupCount / registeredSupCount) * 75)) : 25;
        supRejPillar.style.height = `${height}px`;
    }

    // 4. Workforce Activity Equalizer Strip (Tied to Projects - Request 1)
    const eqStrip = document.getElementById('adminDashEqualizerStrip');
    if (eqStrip) {
        if (projects.length === 0) {
            eqStrip.innerHTML = '<span style="color:var(--adm-text-dim); font-size:0.8rem; padding:4px 0;">لا توجد مشاريع مسجلة حالياً</span>';
        } else {
            eqStrip.innerHTML = projects.map(p => {
                let colorClass = 'pillar-blue';
                let statusLabel = 'قيد التنفيذ';
                const st = (p.status || '').trim();
                if (st === 'قيد المراجعة' || st === 'review') {
                    colorClass = 'pillar-purple';
                    statusLabel = 'قيد المراجعة';
                } else if (st === 'مكتمل ومستلم' || st === 'مكتمل' || st === 'completed' || st === 'done') {
                    colorClass = 'pillar-gold';
                    statusLabel = 'مكتمل ومستلم';
                } else {
                    colorClass = 'pillar-blue';
                    statusLabel = 'قيد التنفيذ';
                }
                return `<div class="eq-bar ${colorClass}" title="${escapeHtml(p.title)}: ${statusLabel} (${p.progress || 0}%)" onclick="switchAdminTab('projects')"></div>`;
            }).join('');
        }
    }

    // 5. Workforce Activity List (with time & date)
    const actListEl = document.getElementById('adminDashActivityList');
    if (actListEl) {
        if (activities.length === 0) {
            actListEl.innerHTML = `<li style="color:var(--adm-text-dim); text-align:center; padding:12px;">لا توجد أنشطة مسجلة حتى الآن</li>`;
        } else {
            actListEl.innerHTML = activities.slice(0, 4).map(act => `
                <li class="activity-item">
                    <div class="act-icon-wrap blue">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    </div>
                    <div class="act-body">
                        <div class="act-title">${escapeHtml(act.text)}</div>
                        <div class="act-time">${act.time} ${act.date ? `<span style="font-size:0.75rem; color:var(--adm-text-dim); margin-right:4px;">&bull; ${act.date}</span>` : ''}</div>
                    </div>
                </li>
            `).join('');
        }
    }

    // 5. Latest Tasks in Velocity Panel (Request 5: Clickable Assignee linking to Tasks tab)
    const tasksContainer = document.getElementById('adminDashLatestTasksContainer');
    if (tasksContainer) {
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `<div style="color:var(--adm-text-dim); font-size:0.86rem; padding:10px 0;">لا توجد مهام حالياً.</div>`;
        } else {
            tasksContainer.innerHTML = tasks.slice(0, 3).map(task => {
                const isTaskDone = (task.status === 'completed' || task.status === 'done' || task.status === 'مكتمل' || task.status === 'مكتملة');
                const assigneeName = escapeHtml(task.assignee || task.assignedTo || 'فريق العمل العام');
                return `
                <div class="dash-task-item" style="display:flex; align-items:center; justify-content:space-between; padding:9px 12px; background:rgba(255,255,255,0.03); border-radius:var(--adm-radius); margin-bottom:8px; border:1px solid var(--adm-border-subtle);">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="checkbox" ${isTaskDone ? 'checked' : ''} onchange="toggleTaskStatusFromDash('${task.id}')" style="accent-color:var(--adm-gold); cursor:pointer;">
                        <span style="font-size:0.88rem; font-weight:600; color:var(--adm-text-main); ${isTaskDone ? 'text-decoration:line-through; opacity:0.6;' : ''}">${escapeHtml(task.title)}</span>
                    </div>
                    <button type="button" onclick="switchAdminTab('tasks')" style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); color:var(--adm-gold-light); font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:9999px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-family:inherit; transition:all 0.2s;" title="المسؤول عن التنفيذ - اضغط للانتقال إلى تابة المهام">
                        <span style="color:var(--adm-text-dim); font-size:0.7rem;">المسؤول:</span>
                        <span>${assigneeName}</span>
                        <span>⬅</span>
                    </button>
                </div>
            `}).join('');
        }
    }

    // 6. Latest Project Box (Request 3: Reflects newly added/updated projects)
    const latestProjContainer = document.getElementById('adminDashLatestProjectContainer');
    if (latestProjContainer) {
        if (projects.length === 0) {
            latestProjContainer.innerHTML = `<div style="color:var(--adm-text-dim); font-size:0.85rem;">لا توجد مشاريع مضافة.</div>`;
        } else {
            const latest = projects[0];
            latestProjContainer.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(245,158,11,0.08); padding:10px 14px; border-radius:var(--adm-radius); border:1px solid rgba(245,158,11,0.2);">
                    <div>
                        <strong style="display:block; font-size:0.92rem; color:var(--adm-text-main);">${escapeHtml(latest.title)}</strong>
                        <span style="font-size:0.78rem; color:var(--adm-gold);">${escapeHtml(latest.location || 'مشروع هندسي')} &bull; ${latest.status || 'قيد التنفيذ'}</span>
                    </div>
                    <button class="btn-dash-quick" onclick="switchAdminTab('projects')" style="padding:4px 10px; font-size:0.75rem;">إدارة ⬅</button>
                </div>
            `;
        }
    }
}

function toggleTaskStatusFromDash(taskId) {
    const tasks = SharksCloud.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const isDone = (task.status === 'completed' || task.status === 'done' || task.status === 'مكتمل' || task.status === 'مكتملة');
        const newStatus = isDone ? 'قيد التنفيذ' : 'مكتملة';
        SharksCloud.updateTask(taskId, { status: newStatus });
        renderDashboardOverview();
        showToast('تم تحديث حالة المهمة بنجاح.');
    }
}

// -------------------------------------------------------------------
// 4. SUPPLIERS MANAGEMENT (الموردين)
// -------------------------------------------------------------------
function renderSuppliersTable(filterQuery = '') {
    const tableBody = document.getElementById('suppliersTableBody');
    if (!tableBody) return;

    let suppliers = SharksCloud.getSuppliers(false);

    if (filterQuery) {
        const q = filterQuery.toLowerCase();
        suppliers = suppliers.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            (s.contactPerson && s.contactPerson.toLowerCase().includes(q))
        );
    }

    if (suppliers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:32px; color:var(--adm-text-dim);">
                    لا يوجد موردين مسجلين حالياً. اضغط على "إضافة مورد جديد" لإضافة أول مورد معتمد.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = suppliers.map(s => {
        const isVisible = s.visible !== false;
        return `
            <tr>
                <td>
                    <div class="adm-supplier-identity">
                        <div class="adm-supplier-logo">
                            <img src="${s.logo || 'assets/logo.jpg'}" alt="${escapeHtml(s.name)}" onerror="this.src='assets/logo.jpg'">
                        </div>
                        <div>
                            <strong style="color:var(--adm-text-main); display:block; font-size:0.95rem;">${escapeHtml(s.name)}</strong>
                            <span style="color:var(--adm-text-dim); font-size:0.8rem;">${escapeHtml(s.description || '').substring(0, 45)}...</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="adm-badge info">${escapeHtml(s.category)}</span>
                </td>
                <td>
                    <div style="font-size:0.86rem;">
                        <div>${escapeHtml(s.contactPerson || 'غير محدد')}</div>
                        <div style="color:var(--adm-gold); direction:ltr; text-align:right;">${escapeHtml(s.phone || '-')}</div>
                    </div>
                </td>
                <td>
                    <span style="font-size:0.84rem; color:var(--adm-text-dim);">${s.createdAt || '-'}</span>
                </td>
                <td>
                    <button class="adm-visibility-toggle ${isVisible ? 'visible' : 'hidden'}" onclick="toggleSupplierVisibility('${s.id}')" title="اضغط لتغيير حالة الظهور">
                        <span>${isVisible ? '👁️ معروض في الموقع للعملاء' : '🔒 مخفي (داخلي فقط)'}</span>
                    </button>
                </td>
                <td>
                    <div class="adm-actions-cell">
                        <button class="adm-btn-action edit" onclick="openEditSupplierModal('${s.id}')" title="تعديل بيانات المورد">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="adm-btn-action delete" onclick="deleteSupplierPrompt('${s.id}', '${escapeHtml(s.name)}')" title="حذف المورد">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function toggleSupplierVisibility(id) {
    const suppliers = SharksCloud.getSuppliers(false);
    const sup = suppliers.find(s => s.id === id);
    if (!sup) return;

    const newVisibility = sup.visible === false ? true : false;
    SharksCloud.updateSupplier(id, { visible: newVisibility });
    showToast(newVisibility ? `تم إظهار "${sup.name}" في واجهة الزوار العامة.` : `تم إخفاء "${sup.name}" من واجهة الزوار العامة.`);
    renderSuppliersTable();
    renderDashboardOverview();
}

function openAddSupplierModal() {
    editingSupplierId = null;
    document.getElementById('modalSupplierTitle').textContent = 'إضافة مورد جديد';
    document.getElementById('formSupplier').reset();
    document.getElementById('supplierVisible').checked = true;
    openModal('modalSupplier');
}

function openEditSupplierModal(id) {
    const suppliers = SharksCloud.getSuppliers(false);
    const sup = suppliers.find(s => s.id === id);
    if (!sup) return;

    editingSupplierId = id;
    document.getElementById('modalSupplierTitle').textContent = 'تعديل بيانات المورد';
    document.getElementById('supplierName').value = sup.name || '';
    document.getElementById('supplierCategory').value = sup.category || 'حديد وتسليح';
    document.getElementById('supplierLogo').value = sup.logo || '';
    document.getElementById('supplierContact').value = sup.contactPerson || '';
    document.getElementById('supplierPhone').value = sup.phone || '';
    document.getElementById('supplierEmail').value = sup.email || '';
    document.getElementById('supplierWebsite').value = sup.website || '';
    document.getElementById('supplierDesc').value = sup.description || '';
    document.getElementById('supplierVisible').checked = sup.visible !== false;

    openModal('modalSupplier');
}

function handleSupplierFormSubmit(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('supplierName').value.trim(),
        category: document.getElementById('supplierCategory').value,
        logo: document.getElementById('supplierLogo').value.trim() || 'assets/logo.jpg',
        contactPerson: document.getElementById('supplierContact').value.trim(),
        phone: document.getElementById('supplierPhone').value.trim(),
        email: document.getElementById('supplierEmail').value.trim(),
        website: document.getElementById('supplierWebsite').value.trim(),
        description: document.getElementById('supplierDesc').value.trim(),
        visible: document.getElementById('supplierVisible').checked
    };

    if (!data.name) {
        alert('يرجى كتابة اسم المورد');
        return;
    }

    if (editingSupplierId) {
        SharksCloud.updateSupplier(editingSupplierId, data);
        showToast(`تم تحديث بيانات المورد "${data.name}" بنجاح!`);
    } else {
        SharksCloud.addSupplier(data);
        showToast(`تمت إضافة المورد الجديد "${data.name}" بنجاح!`);
    }

    closeModal('modalSupplier');
    renderSuppliersTable();
    renderDashboardOverview();
}

function deleteSupplierPrompt(id, name) {
    if (confirm(`هل أنت متأكد من حذف المورد "${name}" نهائياً من النظام؟`)) {
        SharksCloud.deleteSupplier(id);
        showToast(`تم حذف المورد "${name}"`);
        renderSuppliersTable();
        renderDashboardOverview();
    }
}

// -------------------------------------------------------------------
// 4.1 SUPPLIER APPLICATIONS CONTROLLER (طلبات تسجيل الموردين الواردة)
// -------------------------------------------------------------------
function switchSupplierSubTab(subtab) {
    const btnRequests = document.getElementById('subtabBtnSupplierRequests');
    const btnDirectory = document.getElementById('subtabBtnSupplierDirectory');
    const panelRequests = document.getElementById('subpanel-supplier-requests');
    const panelDirectory = document.getElementById('subpanel-supplier-directory');

    if (subtab === 'requests') {
        if (btnRequests) {
            btnRequests.classList.add('active');
            btnRequests.style.background = '';
            btnRequests.style.borderColor = '';
            btnRequests.style.color = '';
        }
        if (btnDirectory) {
            btnDirectory.classList.remove('active');
            btnDirectory.style.background = '';
            btnDirectory.style.borderColor = '';
            btnDirectory.style.color = '';
        }
        if (panelRequests) panelRequests.style.display = 'block';
        if (panelDirectory) panelDirectory.style.display = 'none';
        renderSupplierApplicationsTable();
    } else {
        if (btnDirectory) {
            btnDirectory.classList.add('active');
            btnDirectory.style.background = '';
            btnDirectory.style.borderColor = '';
            btnDirectory.style.color = '';
        }
        if (btnRequests) {
            btnRequests.classList.remove('active');
            btnRequests.style.background = '';
            btnRequests.style.borderColor = '';
            btnRequests.style.color = '';
        }
        if (panelRequests) panelRequests.style.display = 'none';
        if (panelDirectory) panelDirectory.style.display = 'block';
        renderSuppliersTable();
    }
}

function renderSupplierApplicationsTable() {
    const tbody = document.getElementById('supplierApplicationsTableBody');
    if (!tbody) return;

    const allApps = SharksCloud.getSupplierApplications ? SharksCloud.getSupplierApplications() : [];

    // Calculate quick stats
    const totalCount = allApps.length;
    const newCount = allApps.filter(a => a.status === 'جديد').length;
    const reviewCount = allApps.filter(a => a.status === 'قيد المراجعة').length;
    const approvedCount = allApps.filter(a => a.status === 'معتمد').length;

    const statTotal = document.getElementById('statTotalSupplierApps');
    const statNew = document.getElementById('statNewSupplierApps');
    const statReview = document.getElementById('statReviewSupplierApps');
    const statApproved = document.getElementById('statApprovedSupplierApps');
    const badgeAppsCount = document.getElementById('badgeSupplierAppsCount');
    const badgeTabSuppliers = document.getElementById('badgeTabSuppliers');

    if (statTotal) statTotal.textContent = totalCount;
    if (statNew) statNew.textContent = newCount;
    if (statReview) statReview.textContent = reviewCount;
    if (statApproved) statApproved.textContent = approvedCount;

    if (badgeAppsCount) {
        if (localStorage.getItem('sharks_suppliers_badge_hidden') === 'true' || currentAdminTab === 'suppliers') {
            badgeAppsCount.style.display = 'none';
        } else {
            badgeAppsCount.textContent = newCount;
            badgeAppsCount.style.display = newCount > 0 ? 'inline-block' : 'none';
        }
    }
    updateAdminTabBadges();

    // Filters
    const searchInput = document.getElementById('searchSupplierAppsInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const statusSelect = document.getElementById('filterSupplierAppsStatus');
    const statusFilter = statusSelect ? statusSelect.value : 'all';

    let filtered = allApps;
    if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter(a => a.status === statusFilter);
    }
    if (query) {
        filtered = filtered.filter(a =>
            (a.companyName && a.companyName.toLowerCase().includes(query)) ||
            (a.contactPerson && a.contactPerson.toLowerCase().includes(query)) ||
            (a.phone && a.phone.includes(query)) ||
            (a.trackingCode && a.trackingCode.toLowerCase().includes(query)) ||
            (a.category && a.category.toLowerCase().includes(query)) ||
            (a.commercialRegister && a.commercialRegister.includes(query))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:36px; color:var(--adm-text-dim);">
                    لا توجد طلبات تسجيل موردين مطابقة حالياً. ستظهر هنا الطلبات فور إرسالها من بوابة الموردين في الموقع العام.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(app => {
        const docsCount = app.documents ? app.documents.length : 0;
        const cleanPhone = (app.phone || '').replace(/\\D/g, '');
        const cleanWa = (app.whatsapp || app.phone || '').replace(/\\D/g, '');
        const waMsg = encodeURIComponent(`مرحباً أستاذ/ة ${app.contactPerson || ''} - شركة ${app.companyName || ''}، بخصوص طلب اعتماد وتأهيل التوريد المقدم لشركة شاركس جروب (كود: ${app.trackingCode || ''}).`);
        const waLink = `https://wa.me/${cleanWa.startsWith('2') ? cleanWa : '2' + cleanWa}?text=${waMsg}`;

        return `
            <tr>
                <td>
                    <div style="font-family:monospace; color:var(--adm-gold); font-weight:700; font-size:0.88rem;">${escapeHtml(app.trackingCode || '-')}</div>
                    <span style="font-size:0.78rem; color:var(--adm-text-dim);">${escapeHtml(app.createdAt || '-')}</span>
                </td>
                <td>
                    <div style="font-weight:700; color:var(--adm-text-main); font-size:0.95rem;">${escapeHtml(app.companyName || 'بدون اسم')}</div>
                    <div style="display:flex; gap:6px; align-items:center; margin-top:4px; flex-wrap:wrap;">
                        <span class="adm-badge ${app.entityType === 'مقاول' ? 'warning' : 'info'}" style="font-size:0.75rem; font-weight:700;">${escapeHtml(app.entityType || 'مورد')}</span>
                        <span class="adm-badge" style="font-size:0.75rem; background:rgba(255,255,255,0.06); border:1px solid var(--adm-border); color:var(--adm-text-main);">${escapeHtml(app.category || 'عام')}</span>
                        <span style="font-size:0.78rem; color:var(--adm-text-dim);">📍 ${escapeHtml(app.governorate || '-')}</span>
                    </div>
                </td>
                <td>
                    <div style="font-size:0.88rem; font-weight:600; color:var(--adm-text-main);">${escapeHtml(app.contactPerson || '-')}</div>
                    <div style="font-size:0.78rem; color:var(--adm-text-dim); margin-bottom:4px;">${escapeHtml(app.contactTitle || 'مسؤول التوريدات')}</div>
                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                        <a href="tel:${escapeHtml(app.phone)}" style="color:var(--adm-gold); text-decoration:none; font-size:0.82rem; direction:ltr;" title="اتصال مباشر">
                            📞 ${escapeHtml(app.phone || '-')}
                        </a>
                        ${app.whatsapp ? `
                            <a href="${waLink}" target="_blank" style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:6px; background:rgba(37, 211, 102, 0.15); border:1px solid rgba(37, 211, 102, 0.35); color:#25d366; text-decoration:none; font-size:0.76rem; font-weight:700;" title="مراسلة واتساب">
                                💬 واتساب
                            </a>
                        ` : ''}
                    </div>
                </td>
                <td>
                    <div style="font-size:0.82rem; color:var(--adm-text-dim);">
                        <div>س.ت: <strong style="color:var(--adm-text-main);">${escapeHtml(app.commercialRegister || '-')}</strong></div>
                        <div style="margin-top:2px;">ب.ض: <strong style="color:var(--adm-text-main);">${escapeHtml(app.taxCard || '-')}</strong></div>
                    </div>
                </td>
                <td>
                    ${docsCount > 0 ? `
                        <button class="adm-btn-action" onclick="openSupplierDocsModal('${app.id}')" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; background:rgba(235, 199, 96, 0.12); border:1px solid rgba(235, 199, 96, 0.35); color:var(--adm-gold); font-size:0.8rem; font-weight:700;" title="معاينة وفحص المستندات">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            <span>${docsCount} ملفات</span>
                        </button>
                    ` : `
                        <span style="font-size:0.8rem; color:var(--adm-text-dim);">لا توجد ملفات</span>
                    `}
                </td>
                <td>
                    <select class="adm-table-select" onchange="changeSupplierAppStatus('${app.id}', this.value)">
                        <option value="جديد" ${app.status === 'جديد' ? 'selected' : ''}>🟡 جديد</option>
                        <option value="قيد المراجعة" ${app.status === 'قيد المراجعة' ? 'selected' : ''}>🔵 قيد المراجعة</option>
                        <option value="معتمد" ${app.status === 'معتمد' ? 'selected' : ''}>🟢 معتمد</option>
                        <option value="مرفوض" ${app.status === 'مرفوض' ? 'selected' : ''}>🔴 مرفوض</option>
                    </select>
                </td>
                <td>
                    <div class="adm-actions-cell">
                        ${app.status !== 'معتمد' ? `
                            <button class="adm-btn-action" onclick="approveSupplierAppPrompt('${app.id}')" style="color:#22c55e; border-color:rgba(34,197,94,0.4);" title="اعتماد المورد وإضافته لسجل الشركاء">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                        ` : ''}
                        <button class="adm-btn-action edit" onclick="openSupplierDocsModal('${app.id}')" title="فحص بيانات وأوراق الطلب">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="adm-btn-action delete" onclick="deleteSupplierAppPrompt('${app.id}', '${escapeHtml(app.companyName)}')" title="حذف هذا الطلب">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openSupplierDocsModal(id) {
    const apps = SharksCloud.getSupplierApplications ? SharksCloud.getSupplierApplications() : [];
    const app = apps.find(a => a.id === id);
    if (!app) return;

    const companyEl = document.getElementById('docsModalCompanyName');
    const trackingEl = document.getElementById('docsModalTrackingCode');
    const infoBanner = document.getElementById('docsModalInfoBanner');
    const countEl = document.getElementById('docsModalFilesCount');
    const listContainer = document.getElementById('docsModalListContainer');
    const actionBtns = document.getElementById('docsModalActionButtons');

    if (companyEl) companyEl.textContent = `مستندات: ${app.companyName}`;
    if (trackingEl) trackingEl.textContent = app.trackingCode || '-';

    if (infoBanner) {
        infoBanner.innerHTML = `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:8px; margin-bottom:8px;">
                <div>🏢 <strong>المجال:</strong> ${escapeHtml(app.category || '-')} (${escapeHtml(app.governorate || '-')})</div>
                <div>👤 <strong>المفوض:</strong> ${escapeHtml(app.contactPerson || '-')} - ${escapeHtml(app.contactTitle || '')}</div>
                <div>📜 <strong>السجل التجاري:</strong> ${escapeHtml(app.commercialRegister || '-')}</div>
                <div>💳 <strong>البطاقة الضريبية:</strong> ${escapeHtml(app.taxCard || '-')}</div>
            </div>
            ${app.notes ? `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed rgba(255,255,255,0.1); font-size:0.84rem;">📝 <strong>نبذة وسابقة الأعمال:</strong> ${escapeHtml(app.notes)}</div>` : ''}
        `;
    }

    const docs = app.documents || [];
    if (countEl) countEl.textContent = docs.length;

    if (listContainer) {
        if (docs.length === 0) {
            listContainer.innerHTML = `
                <div style="padding:20px; text-align:center; color:var(--adm-text-dim); background:rgba(255,255,255,0.02); border-radius:8px;">
                    لم يقم المورد بإرفاق ملفات رقمية مع هذا الطلب.
                </div>
            `;
        } else {
            listContainer.innerHTML = docs.map((doc, idx) => `
                <div class="adm-doc-item">
                    <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--adm-gold)" stroke-width="2" style="flex-shrink:0;">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div style="overflow:hidden;">
                            <div style="font-size:0.88rem; font-weight:700; color:var(--adm-text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(doc.name)}">${escapeHtml(doc.name)}</div>
                            <div style="font-size:0.75rem; color:var(--adm-text-dim);">${escapeHtml(doc.size || '')}</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px; flex-shrink:0;">
                        ${doc.dataUrl ? `
                            <button type="button" class="adm-btn-action" onclick="previewDocumentWindow('${doc.dataUrl}', '${escapeHtml(doc.name)}')" title="معاينة الملف">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            <a href="${doc.dataUrl}" download="${escapeHtml(doc.name)}" class="adm-btn-action" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;" title="تنزيل الملف">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </a>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    if (actionBtns) {
        const cleanWa = (app.whatsapp || app.phone || '').replace(/\\D/g, '');
        const waMsg = encodeURIComponent(`مرحباً أستاذ/ة ${app.contactPerson || ''} - شركة ${app.companyName || ''}، بخصوص طلب اعتماد وتأهيل التوريد لشركة شاركس جروب.`);
        const waLink = `https://wa.me/${cleanWa.startsWith('2') ? cleanWa : '2' + cleanWa}?text=${waMsg}`;

        actionBtns.innerHTML = `
            <a href="${waLink}" target="_blank" class="adm-btn-secondary" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#25d366; border-color:rgba(37,211,102,0.4);">
                <span>💬 مراسلة واتساب</span>
            </a>
            ${app.status !== 'معتمد' ? `
                <button type="button" class="adm-btn-primary" onclick="approveSupplierAppFromModal('${app.id}')">
                    <span>اعتماد المورد رسمياً</span>
                </button>
            ` : `
                <span class="adm-badge success" style="padding:8px 14px; font-size:0.84rem;">✓ مورد معتمد</span>
            `}
        `;
    }

    openModal('modalViewSupplierDocs');
}

function previewDocumentWindow(dataUrl, title) {
    const win = window.open();
    if (win) {
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title || 'معاينة المستند'}</title>
                <style>
                    body { margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; }
                    img { max-width:95vw; max-height:95vh; object-fit:contain; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5); }
                    iframe { width:100vw; height:100vh; border:none; }
                </style>
            </head>
            <body>
                ${dataUrl.startsWith('data:image/') ? `<img src="${dataUrl}" alt="Document Preview">` : `<iframe src="${dataUrl}"></iframe>`}
            </body>
            </html>
        `);
    } else {
        alert('يرجى السماح بالنوافذ المنبثقة لمعاينة الملف');
    }
}

function formatWhatsAppUrl(rawPhone, messageText) {
    if (!rawPhone) return null;
    let clean = rawPhone.toString().replace(/\D/g, '');
    if (clean.startsWith('01')) {
        clean = '2' + clean; // Egyptian mobile: 010... -> 2010...
    } else if (clean.startsWith('002')) {
        clean = clean.substring(2);
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(messageText)}`;
}

function approveSupplierAppPrompt(id) {
    const apps = SharksCloud.getSupplierApplications ? SharksCloud.getSupplierApplications() : [];
    const app = apps.find(a => a.id === id);
    if (!app) return;

    if (confirm(`هل ترغب في اعتماد المورد "${app.companyName}" رسمياً وإرسال رسالة الاعتماد والتهنئة إليه عبر واتساب؟`)) {
        approveSupplierAppLogic(id, true);
    }
}

function approveSupplierAppFromModal(id) {
    approveSupplierAppLogic(id, true);
    closeModal('modalViewSupplierDocs');
}

function approveSupplierAppLogic(id, sendWhatsApp = true) {
    if (SharksCloud.approveSupplierApplication) {
        const result = SharksCloud.approveSupplierApplication(id);
        if (result && result.application) {
            const app = result.application;
            const phone = app.whatsapp || app.phone;

            if (sendWhatsApp && phone) {
                const approvalMsg = `مرحباً أستاذ/ة ${app.contactPerson || ''} - شركة ${app.companyName || ''}،\nيسر إدارة شركة شاركس جروب (Sharks Group) إبلاغكم بأنه قد تمت الموافقة على طلبكم واعتمادكم رسمياً كمورد مؤهل ومعتمد لدينا في مجال (${app.category || 'التوريدات العامة'}).\nكود التسجيل المعتمد: ${app.trackingCode || ''}.\nنتطلع إلى تعاون مثمر وناجح في مشروعاتنا القادمة بإذن الله.\nمع أطيب التحيات،\nإدارة المشتريات والتوريدات - شاركس جروب`;
                const waUrl = formatWhatsAppUrl(phone, approvalMsg);
                if (waUrl) {
                    window.open(waUrl, '_blank');
                }
            } else if (sendWhatsApp && !phone) {
                alert('تم اعتماد المورد بنجاح، ولكن لم يتم العثور على رقم هاتف مسجل لإرسال رسالة واتساب.');
            }

            showToast(`تم اعتماد المورد "${app.companyName}" بنجاح وإرسال رسالة الواتساب!`);
            renderSupplierApplicationsTable();
            renderSuppliersTable();
            renderDashboardOverview();
        }
    }
}

function changeSupplierAppStatus(id, newStatus) {
    if (SharksCloud.updateSupplierApplication) {
        SharksCloud.updateSupplierApplication(id, { status: newStatus });
        showToast(`تم تحديث حالة الطلب إلى: (${newStatus})`);
        renderSupplierApplicationsTable();
        renderDashboardOverview();
    }
}

function deleteSupplierAppPrompt(id, name) {
    const apps = SharksCloud.getSupplierApplications ? SharksCloud.getSupplierApplications() : [];
    const app = apps.find(a => a.id === id);
    if (!app) return;

    const phone = app.whatsapp || app.phone;

    // If application is already rejected, offer permanent deletion
    if (app.status === 'مرفوض') {
        if (confirm(`طلب المورد "${name}" مسجل بالفعل كـ (مرفوض).\nهل ترغب في حذفه نهائياً من قاعدة البيانات؟`)) {
            if (SharksCloud.deleteSupplierApplication) {
                SharksCloud.deleteSupplierApplication(id);
                showToast(`تم حذف طلب المورد "${name}" نهائياً`);
                renderSupplierApplicationsTable();
                renderDashboardOverview();
            }
        }
        return;
    }

    if (confirm(`هل ترغب في إرسال رسالة اعتذار رسمية لشركة "${name}" عبر واتساب (بأن قدراتهم تفوق متطلباتنا) وتحديث حالة الطلب إلى (مرفوض)؟`)) {
        if (phone) {
            const apologyMsg = `مرحباً أستاذ/ة ${app.contactPerson || ''} - شركة ${app.companyName || name}،\nتتقدم شركة شاركس جروب (Sharks Group) بخالص الشكر والتقدير لاهتمامكم بالتسجيل في سجل الموردين لدينا.\nبعد دراسة ملفكم والمستندات المقدمة، نود أن نتقدم لكم باعتذار رسمي من الشركة، حيث تبين للجنة الفنية أن إمكانياتكم وقدراتكم تفوق متطلبات مشروعاتنا الحالية.\nسنحتفظ بملفكم في قاعدة بياناتنا للتواصل مستقبلاً فور توفر فرص ومشروعات تتناسب مع مستواكم وإمكانياتكم الكبيرة.\nمع أطيب التمنيات لكم بدوام التوفيق والنجاح.\nإدارة التوريدات والمشتريات - شاركس جروب`;
            const waUrl = formatWhatsAppUrl(phone, apologyMsg);
            if (waUrl) {
                window.open(waUrl, '_blank');
            }
        } else {
            alert('تم تحديث حالة الطلب إلى مرفوض، ولكن لم يتم العثور على رقم هاتف مسجل لإرسال رسالة الواتساب.');
        }

        if (SharksCloud.updateSupplierApplication) {
            SharksCloud.updateSupplierApplication(id, { status: 'مرفوض' });
        }
        showToast(`تم إرسال رسالة الاعتذار وتحديث حالة طلب "${name}" إلى (مرفوض)`);
        renderSupplierApplicationsTable();
        renderDashboardOverview();
    }
}

window.switchSupplierSubTab = switchSupplierSubTab;
window.renderSupplierApplicationsTable = renderSupplierApplicationsTable;
window.openSupplierDocsModal = openSupplierDocsModal;
window.previewDocumentWindow = previewDocumentWindow;
window.approveSupplierAppPrompt = approveSupplierAppPrompt;
window.approveSupplierAppFromModal = approveSupplierAppFromModal;
window.changeSupplierAppStatus = changeSupplierAppStatus;
window.deleteSupplierAppPrompt = deleteSupplierAppPrompt;


// -------------------------------------------------------------------
// 5. PROJECTS MANAGEMENT (المشاريع)
// -------------------------------------------------------------------
function renderProjectsTable(filterQuery = '') {
    const tableBody = document.getElementById('projectsTableBody');
    if (!tableBody) return;

    let projects = SharksCloud.getProjects(false);

    if (filterQuery) {
        const q = filterQuery.toLowerCase();
        projects = projects.filter(p =>
            p.title.toLowerCase().includes(q) ||
            (p.location && p.location.toLowerCase().includes(q))
        );
    }

    if (projects.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:32px; color:var(--adm-text-dim);">
                    لا توجد مشاريع مسجلة حالياً. اضغط على "إضافة مشروع جديد" للبدء.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = projects.map(p => {
        const isVisible = p.visible !== false;
        const progress = p.progress !== undefined ? p.progress : 60;
        
        let statusClass = 'inprogress';
        let statusText = '⚡ قيد التنفيذ';
        if (p.status === 'قيد المراجعة' || p.status === 'review') {
            statusClass = 'review';
            statusText = '🔍 قيد المراجعة';
        } else if (p.status === 'مكتمل ومستلم' || p.status === 'مكتمل' || p.status === 'completed') {
            statusClass = 'completed';
            statusText = '✅ مكتمل ومستلم';
        }

        return `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:48px; height:48px; border-radius:10px; overflow:hidden; border:1px solid var(--adm-border); flex-shrink:0;">
                            <img src="${p.image || 'assets/project_nile_foundation.jpg'}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/project_nile_foundation.jpg'">
                        </div>
                        <div>
                            <strong style="color:var(--adm-text-main); font-size:0.95rem; display:block;">${escapeHtml(p.title)}</strong>
                            <span style="color:var(--adm-text-dim); font-size:0.8rem;">${escapeHtml(p.location || 'القاهرة')}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <button class="adm-status-toggle-btn status-${statusClass} ${statusClass}" onclick="toggleProjectStatusDirect('${p.id}')" title="اضغط للتبديل المباشر بين (قيد التنفيذ 🔁 قيد المراجعة 🔁 مكتمل ومستلم)">
                        <span>${statusText}</span>
                    </button>
                </td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div class="adm-prog-bar">
                            <div class="adm-prog-fill" style="width: ${progress}%;"></div>
                        </div>
                        <span style="font-size:0.82rem; font-weight:700; color:var(--adm-gold);">${progress}%</span>
                    </div>
                </td>
                <td>
                    <span style="font-size:0.86rem;">${p.feddan || 50} فدان</span>
                </td>
                <td>
                    <button class="adm-visibility-toggle ${isVisible ? 'visible' : 'hidden'}" onclick="toggleProjectVisibility('${p.id}')">
                        <span>${isVisible ? '👁️ معروض للعملاء' : '🔒 مشروع داخلي'}</span>
                    </button>
                </td>
                <td>
                    <div class="adm-actions-cell">
                        <button class="adm-btn-action edit" onclick="openEditProjectModal('${p.id}')" title="تعديل المشروع">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="adm-btn-action delete" onclick="deleteProjectPrompt('${p.id}', '${escapeHtml(p.title)}')" title="حذف المشروع">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function toggleProjectStatusDirect(id) {
    const projects = SharksCloud.getProjects(false);
    const p = projects.find(x => x.id === id);
    if (!p) return;

    let newStatus = 'قيد المراجعة';
    let newProgress = 85;

    if (p.status === 'قيد المراجعة' || p.status === 'review') {
        newStatus = 'مكتمل ومستلم';
        newProgress = 100;
    } else if (p.status === 'مكتمل ومستلم' || p.status === 'مكتمل' || p.status === 'completed') {
        newStatus = 'قيد التنفيذ';
        newProgress = 65;
    } else {
        newStatus = 'قيد المراجعة';
        newProgress = 85;
    }

    SharksCloud.updateProject(id, {
        status: newStatus,
        progress: newProgress
    });

    showToast(`تم تغيير حالة المشروع "${p.title}" إلى: ${newStatus}`);
    renderProjectsTable();
    renderDashboardOverview();
}

function toggleProjectVisibility(id) {
    const projects = SharksCloud.getProjects(false);
    const p = projects.find(x => x.id === id);
    if (!p) return;

    const newVisibility = p.visible === false ? true : false;
    SharksCloud.updateProject(id, { visible: newVisibility });
    showToast(newVisibility ? `تم إظهار "${p.title}" في معرض الأعمال للجمهور.` : `تم تحويل "${p.title}" إلى مشروع داخلي.`);
    renderProjectsTable();
    renderDashboardOverview();
}

function openAddProjectModal() {
    editingProjectId = null;
    document.getElementById('modalProjectTitle').textContent = 'إضافة مشروع جديد';
    document.getElementById('formProject').reset();
    document.getElementById('projectStatus').value = 'قيد التنفيذ';
    document.getElementById('projectVisible').checked = true;
    openModal('modalProject');
}

function openEditProjectModal(id) {
    const projects = SharksCloud.getProjects(false);
    const p = projects.find(x => x.id === id);
    if (!p) return;

    editingProjectId = id;
    document.getElementById('modalProjectTitle').textContent = 'تعديل بيانات المشروع';
    document.getElementById('projectTitle').value = p.title || '';
    document.getElementById('projectLocation').value = p.location || '';
    
    let st = p.status || 'قيد التنفيذ';
    if (st === 'جاري التنفيذ') st = 'قيد التنفيذ';
    if (st === 'مكتمل') st = 'مكتمل ومستلم';
    document.getElementById('projectStatus').value = st;

    document.getElementById('projectProgress').value = p.progress !== undefined ? p.progress : 65;
    document.getElementById('projectFeddan').value = p.feddan || 50;
    document.getElementById('projectImage').value = p.image || '';
    document.getElementById('projectDesc').value = p.description || '';
    document.getElementById('projectVisible').checked = p.visible !== false;

    openModal('modalProject');
}

function handleProjectFormSubmit(e) {
    e.preventDefault();
    const data = {
        title: document.getElementById('projectTitle').value.trim(),
        location: document.getElementById('projectLocation').value.trim(),
        status: document.getElementById('projectStatus').value,
        progress: parseInt(document.getElementById('projectProgress').value) || 0,
        feddan: parseInt(document.getElementById('projectFeddan').value) || 10,
        image: document.getElementById('projectImage').value.trim() || 'assets/project_nile_foundation.jpg',
        description: document.getElementById('projectDesc').value.trim(),
        visible: document.getElementById('projectVisible').checked
    };

    if (!data.title) {
        alert('يرجى كتابة عنوان المشروع');
        return;
    }

    if (editingProjectId) {
        SharksCloud.updateProject(editingProjectId, data);
        showToast(`تم تحديث المشروع "${data.title}" بنجاح!`);
    } else {
        SharksCloud.addProject(data);
        showToast(`تمت إضافة المشروع الجديد "${data.title}" بنجاح!`);
    }

    closeModal('modalProject');
    renderProjectsTable();
    renderDashboardOverview();
}

function deleteProjectPrompt(id, title) {
    if (confirm(`هل أنت متأكد من حذف المشروع "${title}"؟`)) {
        SharksCloud.deleteProject(id);
        showToast(`تم حذف المشروع "${title}"`);
        renderProjectsTable();
        renderDashboardOverview();
    }
}

// -------------------------------------------------------------------
// 6. TASKS MANAGEMENT (المهام)
// -------------------------------------------------------------------
function renderTasksTable(filterQuery = '') {
    const tableBody = document.getElementById('tasksTableBody');
    if (!tableBody) return;

    let tasks = SharksCloud.getTasks();

    if (filterQuery) {
        const q = filterQuery.toLowerCase();
        tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.assignedTo.toLowerCase().includes(q) ||
            t.project.toLowerCase().includes(q)
        );
    }

    if (tasks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:32px; color:var(--adm-text-dim);">
                    لا توجد مهام مسجلة حالياً.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = tasks.map(t => {
        const isDone = (t.status === 'مكتمل' || t.status === 'مكتملة' || t.status === 'completed' || t.status === 'done');
        const priorityClass = getPriorityBadgeClass(t.priority);
        return `
        <tr>
            <td>
                <strong style="color:var(--adm-text-main); font-size:0.95rem;">${escapeHtml(t.title)}</strong>
            </td>
            <td>
                <span style="color:var(--adm-text-dim);">${escapeHtml(t.project || '-')}</span>
            </td>
            <td>
                <span style="color:var(--adm-gold);">${escapeHtml(t.assignedTo || 'الفريق')}</span>
            </td>
            <td>
                <button class="adm-task-toggle-btn priority-${priorityClass}" onclick="toggleTaskPriorityDirect('${t.id}')" title="اضغط لتبديل الأولوية مباشرة (عاجلة 🔁 متوسطة 🔁 منخفضة)">
                    <span>${escapeHtml(t.priority || 'متوسطة')}</span>
                </button>
            </td>
            <td>
                <button class="adm-task-toggle-btn status-${isDone ? 'completed' : 'inprogress'}" onclick="toggleTaskStatusDirect('${t.id}')" title="اضغط لتبديل الحالة مباشرة (قيد التنفيذ 🔁 مكتملة)">
                    <span>${isDone ? '✅ مكتملة' : '⏳ قيد التنفيذ'}</span>
                </button>
            </td>
            <td>
                <div class="adm-actions-cell">
                    <button class="adm-btn-action edit" onclick="openEditTaskModal('${t.id}')" title="تعديل المهمة">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="adm-btn-action delete" onclick="deleteTaskPrompt('${t.id}', '${escapeHtml(t.title)}')" title="حذف المهمة">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function getPriorityBadgeClass(priority) {
    if (priority === 'عاجلة' || priority === 'عالية') return 'danger';
    if (priority === 'متوسطة') return 'warning';
    return 'info';
}

function toggleTaskPriorityDirect(id) {
    const tasks = SharksCloud.getTasks();
    const t = tasks.find(x => x.id === id);
    if (!t) return;

    let nextPriority = 'متوسطة';
    if (t.priority === 'عاجلة' || t.priority === 'عالية') {
        nextPriority = 'متوسطة';
    } else if (t.priority === 'متوسطة') {
        nextPriority = 'منخفضة';
    } else {
        nextPriority = 'عاجلة';
    }

    SharksCloud.updateTask(id, { priority: nextPriority });
    showToast(`تم تغيير أولوية المهمة إلى: ${nextPriority}`);
    renderTasksTable();
    renderDashboardOverview();
}

function toggleTaskStatusDirect(id) {
    const tasks = SharksCloud.getTasks();
    const t = tasks.find(x => x.id === id);
    if (!t) return;

    const isCurrentlyDone = (t.status === 'مكتمل' || t.status === 'مكتملة' || t.status === 'completed' || t.status === 'done');
    const nextStatus = isCurrentlyDone ? 'قيد التنفيذ' : 'مكتملة';

    SharksCloud.updateTask(id, { status: nextStatus });
    showToast(`تم تغيير حالة المهمة إلى: ${nextStatus}`);
    renderTasksTable();
    renderDashboardOverview();
}

function populateTaskAssigneeSelect(selectedVal = '') {
    const select = document.getElementById('taskAssignedTo');
    if (!select) return;
    const employees = SharksCloud.getEmployees();

    let html = `<option value="فريق العمل العام">فريق العمل العام</option>`;
    let found = (selectedVal === 'فريق العمل العام' || !selectedVal);

    employees.forEach(emp => {
        const isSel = (emp.name === selectedVal);
        if (isSel) found = true;
        html += `<option value="${escapeHtml(emp.name)}" ${isSel ? 'selected' : ''}>${escapeHtml(emp.name)} (${escapeHtml(emp.role || 'موظف')})</option>`;
    });

    if (selectedVal && !found) {
        html += `<option value="${escapeHtml(selectedVal)}" selected>${escapeHtml(selectedVal)}</option>`;
    }

    select.innerHTML = html;
    if (selectedVal) {
        select.value = selectedVal;
    }
}

function openAddTaskModal() {
    editingTaskId = null;
    document.getElementById('modalTaskTitle').textContent = 'إضافة مهمة جديدة';
    document.getElementById('formTask').reset();
    populateTaskAssigneeSelect('فريق العمل العام');
    openModal('modalTask');
}

function openEditTaskModal(id) {
    const tasks = SharksCloud.getTasks();
    const t = tasks.find(x => x.id === id);
    if (!t) return;

    editingTaskId = id;
    document.getElementById('modalTaskTitle').textContent = 'تعديل المهمة';
    document.getElementById('taskTitle').value = t.title || '';
    document.getElementById('taskProject').value = t.project || '';
    populateTaskAssigneeSelect(t.assignedTo || 'فريق العمل العام');
    document.getElementById('taskStatus').value = t.status || 'قيد التنفيذ';
    document.getElementById('taskPriority').value = t.priority || 'عالية';
    document.getElementById('taskDueDate').value = t.dueDate || '';

    openModal('modalTask');
}

function handleTaskFormSubmit(e) {
    e.preventDefault();
    const data = {
        title: document.getElementById('taskTitle').value.trim(),
        project: document.getElementById('taskProject').value.trim(),
        assignedTo: document.getElementById('taskAssignedTo').value.trim(),
        status: document.getElementById('taskStatus').value,
        priority: document.getElementById('taskPriority').value,
        dueDate: document.getElementById('taskDueDate').value.trim() || 'قريباً'
    };

    if (!data.title) {
        alert('يرجى كتابة عنوان المهمة');
        return;
    }

    if (editingTaskId) {
        SharksCloud.updateTask(editingTaskId, data);
        showToast(`تم تحديث المهمة "${data.title}"`);
    } else {
        SharksCloud.addTask(data);
        showToast(`تمت إضافة المهمة "${data.title}"`);
    }

    closeModal('modalTask');
    renderTasksTable();
    renderDashboardOverview();
}

function deleteTaskPrompt(id, title) {
    if (confirm(`هل أنت متأكد من حذف المهمة "${title}"؟`)) {
        SharksCloud.deleteTask(id);
        showToast(`تم حذف المهمة "${title}"`);
        renderTasksTable();
        renderDashboardOverview();
    }
}

// -------------------------------------------------------------------
// 7. EMPLOYEES MANAGEMENT (الموظفين)
// -------------------------------------------------------------------
function renderEmployeesTable(filterQuery = '') {
    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;

    let employees = SharksCloud.getEmployees();

    if (filterQuery) {
        const q = filterQuery.toLowerCase();
        employees = employees.filter(e =>
            e.name.toLowerCase().includes(q) ||
            e.role.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q)
        );
    }

    if (employees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:32px; color:var(--adm-text-dim);">
                    لا يوجد موظفين مسجلين حالياً.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = employees.map(e => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, var(--adm-gold), var(--adm-gold-dark)); color:#000; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem;">
                        ${e.name ? e.name.charAt(0) : 'م'}
                    </div>
                    <div>
                        <strong style="color:var(--adm-text-main);">${escapeHtml(e.name)}</strong>
                        <span style="display:block; font-size:0.78rem; color:var(--adm-text-dim);">${escapeHtml(e.email || '')}</span>
                    </div>
                </div>
            </td>
            <td>
                <span class="adm-badge info">${escapeHtml(e.role || 'مهندس')}</span>
            </td>
            <td>
                <span>${escapeHtml(e.department || 'الهندسة')}</span>
            </td>
            <td>
                <span style="direction:ltr; display:inline-block; font-family:'JetBrains Mono', monospace; color:var(--adm-gold);">${escapeHtml(e.phone || '-')}</span>
            </td>
            <td>
                <span style="color:var(--adm-text-dim); font-size:0.84rem;">${e.createdAt || '-'}</span>
            </td>
            <td>
                <div class="adm-actions-cell">
                    <button class="adm-btn-action edit" onclick="openEditEmployeeModal('${e.id}')" title="تعديل الموظف">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="adm-btn-action delete" onclick="deleteEmployeePrompt('${e.id}', '${escapeHtml(e.name)}')" title="حذف الموظف">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddEmployeeModal() {
    editingEmployeeId = null;
    document.getElementById('modalEmployeeTitle').textContent = 'إضافة موظف جديد';
    document.getElementById('formEmployee').reset();
    openModal('modalEmployee');
}

function openEditEmployeeModal(id) {
    const employees = SharksCloud.getEmployees();
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    editingEmployeeId = id;
    document.getElementById('modalEmployeeTitle').textContent = 'تعديل بيانات الموظف';
    document.getElementById('empName').value = emp.name || '';
    document.getElementById('empRole').value = emp.role || '';
    document.getElementById('empDepartment').value = emp.department || '';
    document.getElementById('empPhone').value = emp.phone || '';
    document.getElementById('empEmail').value = emp.email || '';

    openModal('modalEmployee');
}

function handleEmployeeFormSubmit(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('empName').value.trim(),
        role: document.getElementById('empRole').value.trim(),
        department: document.getElementById('empDepartment').value.trim(),
        phone: document.getElementById('empPhone').value.trim(),
        email: document.getElementById('empEmail').value.trim()
    };

    if (!data.name) {
        alert('يرجى كتابة اسم الموظف');
        return;
    }

    if (editingEmployeeId) {
        SharksCloud.updateEmployee(editingEmployeeId, data);
        showToast(`تم تحديث بيانات الموظف "${data.name}"`);
    } else {
        SharksCloud.addEmployee(data);
        showToast(`تمت إضافة الموظف "${data.name}"`);
    }

    closeModal('modalEmployee');
    renderEmployeesTable();
    renderDashboardOverview();
}

function deleteEmployeePrompt(id, name) {
    if (confirm(`هل أنت متأكد من حذف الموظف "${name}"؟`)) {
        SharksCloud.deleteEmployee(id);
        showToast(`تم حذف الموظف "${name}"`);
        renderEmployeesTable();
        renderDashboardOverview();
    }
}

// -------------------------------------------------------------------
// 7. CAREERS MANAGEMENT (فرص العمل والأقسام الوظيفية - REQUEST 7)
// -------------------------------------------------------------------
let editingCareerId = null;

function renderCareersTable(filterQuery = '') {
    const tableBody = document.getElementById('careersTableBody');
    if (!tableBody) return;

    let careers = SharksCloud.getCareers(false);

    if (filterQuery) {
        const q = filterQuery.toLowerCase();
        careers = careers.filter(c =>
            c.titleAr.toLowerCase().includes(q) ||
            (c.titleEn && c.titleEn.toLowerCase().includes(q)) ||
            (c.keywords && c.keywords.toLowerCase().includes(q)) ||
            (c.categoryLabel && c.categoryLabel.toLowerCase().includes(q))
        );
    }

    if (careers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:32px; color:var(--adm-text-dim);">
                    لا توجد أقسام وظيفية مسجلة حالياً. اضغط على "إضافة قسم وظيفي جديد" للبدء.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = careers.map(c => {
        const isVisible = c.visible !== false;
        const catLabel = c.categoryLabel || (c.category === 'engineering' ? 'القطاع الهندسي' : c.category === 'management' ? 'إدارة وتخطيط المشروعات' : 'الإدارة والمالية');
        return `
            <tr>
                <td>
                    <div>
                        <strong style="color:var(--adm-text-main); font-size:0.95rem; display:block;">${escapeHtml(c.titleAr)}</strong>
                        <span style="color:var(--adm-gold); font-size:0.8rem; font-family:'JetBrains Mono',monospace;">${escapeHtml(c.titleEn || '')}</span>
                    </div>
                </td>
                <td>
                    <span class="adm-badge" style="background:rgba(59,130,246,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); padding:3px 8px; border-radius:6px; font-size:0.78rem;">${escapeHtml(catLabel)}</span>
                </td>
                <td>
                    <span style="font-weight:700; color:var(--adm-text-main); font-size:0.9rem;">${c.vacancies || 1} فرص</span>
                </td>
                <td>
                    <span style="color:var(--adm-text-dim); font-size:0.78rem; display:block; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(c.keywords || c.titleAr)}</span>
                </td>
                <td>
                    <button class="adm-visibility-toggle ${isVisible ? 'visible' : 'hidden'}" onclick="toggleCareerVisibilityDirect('${c.id}')" title="اضغط للتبديل بين إظهار أو إخفاء التخصص من صفحة فرص العمل">
                        <span>${isVisible ? '👁️ معروض للعامة' : '🔒 مخفي من الموقع'}</span>
                    </button>
                </td>
                <td>
                    <div class="adm-actions-cell">
                        <button class="adm-btn-action edit" onclick="openEditCareerModal('${c.id}')" title="تعديل القسم">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="adm-btn-action delete" onclick="deleteCareerPrompt('${c.id}', '${escapeHtml(c.titleAr)}')" title="حذف القسم">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function populateCareerCategorySelect(selectedId) {
    const select = document.getElementById('careerCategory');
    if (!select) return;
    const categories = SharksCloud.getCareerCategories();
    select.innerHTML = categories.map(cat => `
        <option value="${escapeHtml(cat.id)}">${escapeHtml(cat.label)}</option>
    `).join('');
    if (selectedId) {
        select.value = selectedId;
    }
}

function openAddCareerCategoryModal() {
    const input = document.getElementById('newCategoryName');
    if (input) input.value = '';
    openModal('modalNewCareerCategory');
    setTimeout(() => { if (input) input.focus(); }, 150);
}

function handleCareerCategorySelectChange(selectEl) {
    if (selectEl && selectEl.value === '__NEW__') {
        openAddCareerCategoryModal();
    }
}

function handleNewCareerCategorySubmit(e) {
    e.preventDefault();
    const input = document.getElementById('newCategoryName');
    const name = input ? input.value.trim() : '';
    if (!name) return;

    const newCat = SharksCloud.addCareerCategory(name);
    if (newCat) {
        showToast(`تمت إضافة القطاع المؤسسي "${newCat.label}" بنجاح!`);
        closeModal('modalNewCareerCategory');
        populateCareerCategorySelect(newCat.id);
        renderCareersTable();
    }
}

// Manage & Delete Career Categories Modal Handlers (User Request 1)
function openManageCareerCategoriesModal() {
    const input = document.getElementById('quickNewCategoryName');
    if (input) input.value = '';
    renderManageCategoriesList();
    openModal('modalManageCareerCategories');
}

function renderManageCategoriesList() {
    const listEl = document.getElementById('careerCategoriesManageList');
    if (!listEl) return;

    const categories = SharksCloud.getCareerCategories();
    const careers = SharksCloud.getCareers(false);

    if (categories.length === 0) {
        listEl.innerHTML = `
            <div style="text-align:center; padding:18px; color:var(--adm-text-dim); font-size:0.88rem;">
                لا توجد قطاعات مسجلة حالياً. استخدم الحقل بالأسفل لإضافة قطاع جديد.
            </div>
        `;
        return;
    }

    listEl.innerHTML = categories.map(cat => {
        const count = careers.filter(c => c.category === cat.id).length;
        const safeLabel = escapeHtml(cat.label);
        const safeId = escapeHtml(cat.id);
        const safeLabelParam = safeLabel.replace(/'/g, "\\'");
        return `
            <div class="adm-cat-item">
                <div class="adm-cat-info">
                    <span style="font-size:1.1rem; color:var(--adm-gold);">🏷️</span>
                    <span class="adm-cat-label">${safeLabel}</span>
                    <span class="adm-cat-count">${count} أقسام</span>
                </div>
                <button type="button" class="adm-cat-del-btn" onclick="deleteCareerCategoryDirect('${safeId}', '${safeLabelParam}')" title="حذف هذا القطاع">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    <span>حذف</span>
                </button>
            </div>
        `;
    }).join('');
}

function deleteCareerCategoryDirect(id, label) {
    if (!id) return;
    if (confirm(`هل أنت متأكد من رغبتك في حذف القطاع المؤسسي "${label}"؟ سيتم حذفه من القوائم وفلاتر الموقع فورياً.`)) {
        const ok = SharksCloud.deleteCareerCategory(id);
        if (ok) {
            showToast(`تم حذف القطاع المؤسسي "${label}" بنجاح!`);
            renderManageCategoriesList();
            populateCareerCategorySelect();
            renderCareersTable();
            renderDashboardOverview();
        } else {
            alert('تعذر حذف القطاع.');
        }
    }
}

function handleQuickAddCategory() {
    const input = document.getElementById('quickNewCategoryName');
    const name = input ? input.value.trim() : '';
    if (!name) {
        alert('يرجى إدخال اسم القطاع المؤسسي الجديد أولاً.');
        return;
    }

    const newCat = SharksCloud.addCareerCategory(name);
    if (newCat) {
        showToast(`تمت إضافة القطاع المؤسسي "${newCat.label}" بنجاح!`);
        if (input) input.value = '';
        renderManageCategoriesList();
        populateCareerCategorySelect(newCat.id);
        renderCareersTable();
        renderDashboardOverview();
    }
}

function openAddCareerModal() {
    editingCareerId = null;
    document.getElementById('modalCareerTitle').textContent = 'إضافة قسم وظيفي جديد';
    document.getElementById('formCareer').reset();
    populateCareerCategorySelect('engineering');
    document.getElementById('careerVisible').checked = true;
    openModal('modalCareer');
}

function openEditCareerModal(id) {
    const careers = SharksCloud.getCareers(false);
    const c = careers.find(x => x.id === id);
    if (!c) return;

    editingCareerId = id;
    document.getElementById('modalCareerTitle').textContent = 'تعديل القسم الوظيفي';
    document.getElementById('careerTitleAr').value = c.titleAr || '';
    document.getElementById('careerTitleEn').value = c.titleEn || '';
    populateCareerCategorySelect(c.category || 'engineering');
    document.getElementById('careerVacancies').value = c.vacancies || 1;
    document.getElementById('careerTags').value = Array.isArray(c.tags) ? c.tags.join(', ') : (c.tags || '');
    document.getElementById('careerKeywords').value = c.keywords || '';
    document.getElementById('careerDesc').value = c.description || '';
    document.getElementById('careerVisible').checked = c.visible !== false;

    openModal('modalCareer');
}

function handleCareerFormSubmit(e) {
    e.preventDefault();
    const titleAr = document.getElementById('careerTitleAr').value.trim();
    const titleEn = document.getElementById('careerTitleEn').value.trim();
    const category = document.getElementById('careerCategory').value;
    const vacancies = parseInt(document.getElementById('careerVacancies').value) || 1;
    const tagsRaw = document.getElementById('careerTags').value;
    const keywords = document.getElementById('careerKeywords').value.trim();
    const description = document.getElementById('careerDesc').value.trim();
    const visible = document.getElementById('careerVisible').checked;

    if (!titleAr) {
        alert('يرجى إدخال اسم القسم بالعربية');
        return;
    }

    const categories = SharksCloud.getCareerCategories();
    const catObj = categories.find(c => c.id === category);
    const catLabel = catObj ? catObj.label : 'القطاع المؤسسي';

    const data = {
        titleAr,
        titleEn,
        category,
        categoryLabel: catLabel,
        vacancies,
        tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : ['دوام كامل', 'مواقع ومشروعات'],
        keywords: keywords || titleAr,
        description,
        visible
    };

    if (editingCareerId) {
        SharksCloud.updateCareer(editingCareerId, data);
        showToast(`تم تحديث القسم الوظيفي "${titleAr}" بنجاح!`);
    } else {
        SharksCloud.addCareer(data);
        showToast(`تمت إضافة القسم الوظيفي الجديد "${titleAr}" بنجاح!`);
    }

    closeModal('modalCareer');
    renderCareersTable();
    renderDashboardOverview();
}

function deleteCareerPrompt(id, title) {
    if (confirm(`هل أنت متأكد من حذف قسم "${title}" نهائياً من النظام؟`)) {
        SharksCloud.deleteCareer(id);
        showToast(`تم حذف القسم الوظيفي "${title}"`);
        renderCareersTable();
        renderDashboardOverview();
    }
}

function toggleCareerVisibilityDirect(id) {
    const res = SharksCloud.toggleCareerVisibility(id);
    if (res) {
        showToast(res.visible ? `تم إظهار قسم "${res.titleAr}" في الموقع العام.` : `تم إخفاء قسم "${res.titleAr}" من الموقع العام.`);
        renderCareersTable();
        renderDashboardOverview();
    }
}

// -------------------------------------------------------------------
// 8. Global Modals & Utilities
// -------------------------------------------------------------------
function setupModals() {
    // Form submits
    const formSup = document.getElementById('formSupplier');
    if (formSup) formSup.addEventListener('submit', handleSupplierFormSubmit);

    const formProj = document.getElementById('formProject');
    if (formProj) formProj.addEventListener('submit', handleProjectFormSubmit);

    const formTask = document.getElementById('formTask');
    if (formTask) formTask.addEventListener('submit', handleTaskFormSubmit);

    const formEmp = document.getElementById('formEmployee');
    if (formEmp) formEmp.addEventListener('submit', handleEmployeeFormSubmit);

    const formCar = document.getElementById('formCareer');
    if (formCar) formCar.addEventListener('submit', handleCareerFormSubmit);

    // Search inputs
    const searchSup = document.getElementById('searchSuppliersInput');
    if (searchSup) {
        searchSup.addEventListener('input', (e) => renderSuppliersTable(e.target.value));
    }

    const searchProj = document.getElementById('searchProjectsInput');
    if (searchProj) {
        searchProj.addEventListener('input', (e) => renderProjectsTable(e.target.value));
    }

    const searchTask = document.getElementById('searchTasksInput');
    if (searchTask) {
        searchTask.addEventListener('input', (e) => renderTasksTable(e.target.value));
    }

    const searchEmp = document.getElementById('searchEmployeesInput');
    if (searchEmp) {
        searchEmp.addEventListener('input', (e) => renderEmployeesTable(e.target.value));
    }

    const searchCar = document.getElementById('careersSearchFilter');
    if (searchCar) {
        searchCar.addEventListener('input', (e) => renderCareersTable(e.target.value));
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function showToast(message) {
    const existing = document.querySelector('.adm-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'adm-toast';
    toast.innerHTML = `
        <span style="color:var(--adm-gold); font-size:1.2rem;">✨</span>
        <span style="font-weight:700; font-size:0.92rem;">${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Window Exposures for HTML inline handlers
window.switchAdminTab = switchAdminTab;
window.openAddSupplierModal = openAddSupplierModal;
window.openEditSupplierModal = openEditSupplierModal;
window.deleteSupplierPrompt = deleteSupplierPrompt;
window.toggleSupplierVisibility = toggleSupplierVisibility;

window.openAddProjectModal = openAddProjectModal;
window.openEditProjectModal = openEditProjectModal;
window.deleteProjectPrompt = deleteProjectPrompt;
window.toggleProjectVisibility = toggleProjectVisibility;
window.toggleProjectStatusDirect = toggleProjectStatusDirect;

window.openAddTaskModal = openAddTaskModal;
window.openEditTaskModal = openEditTaskModal;
window.deleteTaskPrompt = deleteTaskPrompt;
window.toggleTaskPriorityDirect = toggleTaskPriorityDirect;
window.toggleTaskStatusDirect = toggleTaskStatusDirect;

window.openAddEmployeeModal = openAddEmployeeModal;
window.openEditEmployeeModal = openEditEmployeeModal;
window.deleteEmployeePrompt = deleteEmployeePrompt;

window.openAddCareerModal = openAddCareerModal;
window.openEditCareerModal = openEditCareerModal;
window.deleteCareerPrompt = deleteCareerPrompt;
window.toggleCareerVisibilityDirect = toggleCareerVisibilityDirect;
window.renderCareersTable = renderCareersTable;

window.triggerAvatarUpload = triggerAvatarUpload;
window.handleAvatarFileSelect = handleAvatarFileSelect;
window.openForgotPasswordModal = openForgotPasswordModal;
window.backToFpStep1 = backToFpStep1;
window.handleRequestOtpSubmit = handleRequestOtpSubmit;
window.handleVerifyOtpSubmit = handleVerifyOtpSubmit;
window.handleResetPasswordSubmit = handleResetPasswordSubmit;

window.openModal = openModal;
window.closeModal = closeModal;
window.openAddCareerCategoryModal = openAddCareerCategoryModal;
window.handleCareerCategorySelectChange = handleCareerCategorySelectChange;
window.handleNewCareerCategorySubmit = handleNewCareerCategorySubmit;
window.populateCareerCategorySelect = populateCareerCategorySelect;
window.openManageCareerCategoriesModal = openManageCareerCategoriesModal;
window.renderManageCategoriesList = renderManageCategoriesList;
window.deleteCareerCategoryDirect = deleteCareerCategoryDirect;
window.handleQuickAddCategory = handleQuickAddCategory;


