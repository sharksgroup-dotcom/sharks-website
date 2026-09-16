/**
 * Sharks Group Enterprise Suite & Official Website
 * Integrated UI Controller & Interactive Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    initSplashScreen();
    initTheme();
    initHeroSlider();
    initServicesSliderApp();
    initScrollAnimations();
    initStatsCounter();
    initDropdownInteraction();
    initSmartSlider();

    // Render operational data
    renderDashboard();
    renderProjects();
    renderTasks();
    renderEmployees();
    populateTaskModalSelects();
    renderPublicCareers();
    initSupplierPortal();

    // Ensure any stale localStorage view is wiped clean
    try {
        localStorage.removeItem('sharks_active_view');
        localStorage.removeItem('sharks_last_view');
    } catch(e) {}

    // Check for reload session view (survives F5 reload; resets to home when closing/reopening website)
    const validViews = ['home', 'services', 'founders', 'contact', 'projects', 'suppliers', 'careers', 'dashboard', 'tasks', 'employees'];
    const sessionView = sessionStorage.getItem('sharks_active_view');
    const initialView = (sessionView && validViews.includes(sessionView)) ? sessionView : 'home';
    
    document.documentElement.classList.add('app-initialized');
    switchMainView(initialView);

    // Close modal when clicking outside modal box
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}

// -------------------------------------------------------------
// ULTRA-FAST CINEMATIC SPLASH SCREEN CONTROLLER WITH SESSION CACHE (REQUEST 4)
// -------------------------------------------------------------
let splashTimeout = null;

function initSplashScreen() {
    const splash = document.getElementById('sharksSplashScreen');
    if (!splash) return;

    // Show splash screen only once per browser session (User Request 4)
    const sessionShown = sessionStorage.getItem('sharks_splash_shown');
    if (sessionShown === 'true') {
        splash.style.display = 'none';
        return;
    }

    // First visit in current session -> record and show
    sessionStorage.setItem('sharks_splash_shown', 'true');

    const statusText = document.getElementById('splashStatusText');

    // Instant click or touch to dismiss anytime
    splash.style.cursor = 'pointer';
    splash.addEventListener('click', dismissSplashScreen);
    splash.addEventListener('touchstart', dismissSplashScreen, { passive: true });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
            dismissSplashScreen();
        }
    }, { once: true });

    // Status message update at 1100ms
    setTimeout(() => {
        if (statusText) {
            statusText.textContent = 'مرحباً بكم في شاركس جروب ✓';
            statusText.style.color = '#ebc760';
        }
    }, 1100);

    // Restored original 2-second cinematic duration
    splashTimeout = setTimeout(() => {
        dismissSplashScreen();
    }, 2000);
}

function dismissSplashScreen() {
    const splash = document.getElementById('sharksSplashScreen');
    if (!splash || splash.classList.contains('splash-fade-out')) return;

    if (splashTimeout) clearTimeout(splashTimeout);

    splash.classList.add('splash-fade-out');

    setTimeout(() => {
        splash.style.display = 'none';
    }, 550);
}

window.dismissSplashScreen = dismissSplashScreen;

// -------------------------------------------------------------
// THEME SWITCHER ENGINE (LIGHT & DARK MODE - DEFAULT IS LIGHT)
// -------------------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem('sharks_theme_v2') || localStorage.getItem('sharks_admin_theme_v2') || 'light';
    applyTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem('sharks_theme_v2', nextTheme);
    localStorage.setItem('sharks_admin_theme_v2', nextTheme);
    localStorage.setItem('sharks_theme', nextTheme);
    localStorage.setItem('sharks_admin_theme', nextTheme);

    // Dynamic shockwave pulse animation on button
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.classList.remove('pulse-active');
        void themeBtn.offsetWidth; // force browser repaint
        themeBtn.classList.add('pulse-active');
        setTimeout(() => themeBtn.classList.remove('pulse-active'), 750);
    }
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

// -------------------------------------------------------------
// HERO BACKGROUND SLIDER (ROTATES EVERY 2 SECONDS - REQUEST 2)
// -------------------------------------------------------------
let heroSliderInterval = null;

function initHeroSlider() {
    const slides = document.querySelectorAll('#heroSliderTrack .hero-slide');
    if (slides.length <= 1) return;

    let currentSlide = 0;

    // Clear any existing timer if called multiple times
    if (heroSliderInterval) {
        clearInterval(heroSliderInterval);
    }

    heroSliderInterval = setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 2000); // exactly 2 seconds as requested by the user
}

// -------------------------------------------------------------
// SERVICES, FOUNDERS & CAREERS ROTATING BACKGROUND SLIDERS
// -------------------------------------------------------------
function initTrackSlider(trackId, intervalMs = 3000) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const slides = track.querySelectorAll('.services-slide, .hero-slide');
    if (slides.length <= 1) return;

    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, intervalMs);
}

function initServicesSliderApp() {
    initTrackSlider('servicesSliderTrackApp', 3000);
    initTrackSlider('foundersSliderTrack', 3000);
    initTrackSlider('careersSliderTrack', 3000);
}

// -------------------------------------------------------------
// UNIFIED MASTER VIEW SWITCHER (REQUESTS 1, 2, 3, 4, CAREERS)
// -------------------------------------------------------------
function switchMainView(viewName) {
    const validViews = ['home', 'services', 'founders', 'contact', 'projects', 'suppliers', 'careers', 'dashboard', 'tasks', 'employees'];
    if (!validViews.includes(viewName)) viewName = 'home';

    // 1. Hide all platform views and display target
    const views = document.querySelectorAll('.platform-view');
    views.forEach(v => {
        v.classList.remove('active');
    });

    const viewMap = {
        'home': 'view-home',
        'services': 'view-services',
        'founders': 'view-founders',
        'contact': 'view-contact',
        'projects': 'view-projects',
        'suppliers': 'view-suppliers',
        'careers': 'view-careers',
        'dashboard': 'view-dashboard',
        'tasks': 'view-tasks',
        'employees': 'view-employees'
    };

    const targetViewId = viewMap[viewName] || 'view-home';
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
        targetView.classList.add('active');
        // Ensure child elements are revealed immediately
        targetView.querySelectorAll('.scroll-reveal').forEach(el => {
            el.classList.add('revealed');
            el.classList.add('visible');
        });
    }

    // 2. Update active state in top navbar
    const tabNavMap = {
        'home': 'tabNavHome',
        'services': 'tabNavServices',
        'founders': 'tabNavFounders',
        'contact': 'tabNavContact',
        'projects': 'tabNavProjects',
        'suppliers': 'tabNavSuppliers',
        'careers': 'tabNavCareers',
        'dashboard': 'tabNavDashboard',
        'tasks': 'tabNavTasks',
        'employees': 'tabNavEmployees'
    };

    document.querySelectorAll('.unified-nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeNavBtnId = tabNavMap[viewName];
    if (activeNavBtnId) {
        const activeNavBtn = document.getElementById(activeNavBtnId);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
            if (window.innerWidth <= 860) {
                try {
                    activeNavBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                } catch (e) {}
            }
        }
    }

    // 3. Close dropdown menu if open
    const dropdown = document.querySelector('.nav-dropdown');
    if (dropdown) dropdown.classList.remove('show');

    // 4. Update data-active-view attribute on html for synchronized styling
    document.documentElement.setAttribute('data-active-view', viewName);

    // 5. Persist active view in sessionStorage ONLY (survives reload; resets to home when closing/reopening website)
    try {
        sessionStorage.setItem('sharks_active_view', viewName);
    } catch(e) {}

    // 6. Instant scroll to top (0ms delay - ultra-fast, smooth, and seamless)
    window.scrollTo(0, 0);
}

// Sub-navigation from dropdown under الرئيسية (Request 1)
function goToHomeSection(sectionId) {
    // Switch to home view first
    switchMainView('home');

    // Close dropdown
    const dropdown = document.querySelector('.nav-dropdown');
    if (dropdown) dropdown.classList.remove('show');

    // Smooth scroll to target section after DOM settles
    setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) {
            const navOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, 120);
}

// Dropdown click & hover interaction helper
function initDropdownInteraction() {
    const homeBtn = document.getElementById('tabNavHome');
    const dropdown = document.querySelector('.nav-dropdown');

    if (homeBtn && dropdown) {
        // Allow mobile tap or click on the arrow/btn to toggle dropdown
        homeBtn.addEventListener('click', (e) => {
            if (homeBtn.classList.contains('active')) {
                dropdown.classList.toggle('show');
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.unified-nav-item')) {
                dropdown.classList.remove('show');
            }
        });
    }
}

// Dedicated Contact Page Form submission (Request 2)
function handleDedicatedContact(e) {
    e.preventDefault();
    alert("شكراً لتواصلك مع شركة شاركس جروب للمقاولات العامة والتطوير العقاري!\n\nتم استلام استفسارك بنجاح، وسيتواصل معك أحد مهندسينا وممثلي خدمة العملاء في أقرب وقت.");
    e.target.reset();
}

// Legacy public contact form fallback
function handlePublicContact(e) {
    e.preventDefault();
    alert("شكراً لتواصلك مع شركة شاركس جروب للمقاولات والتطوير العقاري!\nتم استلام رسالتك بنجاح.");
    e.target.reset();
}

// Backward-compatibility wrappers
function switchToHomeView() {
    switchMainView('home');
}
function switchToPortalView(targetSectionId = 'section-dashboard') {
    if (targetSectionId.includes('project')) switchMainView('projects');
    else if (targetSectionId.includes('task')) switchMainView('tasks');
    else if (targetSectionId.includes('employee')) switchMainView('employees');
    else switchMainView('dashboard');
}
function navigateToSection(sectionId) {
    if (sectionId.includes('project')) switchMainView('projects');
    else if (sectionId.includes('task')) switchMainView('tasks');
    else if (sectionId.includes('employee')) switchMainView('employees');
    else switchMainView('dashboard');
}

// -------------------------------------------------------------
// SCROLL REVEAL ANIMATIONS
// -------------------------------------------------------------
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// Animated Statistics Counter
function initStatsCounter() {
    const counters = document.querySelectorAll('.stat-counter-number');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'), 10);
                    const isPlus = counter.textContent.includes('+');
                    let start = 0;
                    const duration = 1500;
                    const step = Math.max(1, Math.floor(target / (duration / 25)));

                    const timer = setInterval(() => {
                        start += step;
                        if (start >= target) {
                            start = target;
                            clearInterval(timer);
                        }
                        counter.textContent = (isPlus ? '+' : '') + start;
                    }, 25);
                });
            }
        });
    }, { threshold: 0.25 });

    const statsSection = document.getElementById('home-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Interactive About Tabs
function switchAboutTab(tabKey) {
    const buttons = document.querySelectorAll('.about-tab-btn');
    const contents = document.querySelectorAll('.about-tab-content');

    buttons.forEach(btn => btn.classList.remove('active'));
    contents.forEach(cnt => cnt.classList.remove('active'));

    const activeBtn = Array.from(buttons).find(b => b.getAttribute('onclick')?.includes(tabKey));
    if (activeBtn) activeBtn.classList.add('active');

    const activeContent = document.getElementById(`tab-${tabKey}`);
    if (activeContent) activeContent.classList.add('active');
}

// -------------------------------------------------------------
// 1. DASHBOARD VIEW & SMART SLIDER (REQUESTS 1, 2, 3)
// -------------------------------------------------------------
const SMART_CONSTRUCTION_SLIDES = [
    {
        image: 'assets/project_nile_foundation.jpg',
        title: 'صب الأساسات الخرسانية الكبرى',
        progress: 92
    },
    {
        image: 'assets/project_infrastructure_pipes.jpg',
        title: 'شبكات ومحطات البنية التحتية والمياه',
        progress: 86
    },
    {
        image: 'assets/project_engineers_site.jpg',
        title: 'الإشراف الهندسي وإدارة المشروعات',
        progress: 94
    },
    {
        image: 'assets/project_road_earthwork.jpg',
        title: 'أعمال تمهيد ورصف شبكات الطرق',
        progress: 78
    },
    {
        image: 'assets/project_excavator_breaker.jpg',
        title: 'أعمال الحفر والردم والتجهيزات الإنشائية',
        progress: 89
    }
];

let currentSmartSlide = 0;
let smartSliderTimer = null;

function initSmartSlider() {
    const track = document.getElementById('smartSliderTrack');
    if (!track) return;

    if (smartSliderTimer) clearInterval(smartSliderTimer);
    updateSmartSlideUI(currentSmartSlide);

    // Auto rotate every 7 seconds (7000ms)
    smartSliderTimer = setInterval(() => {
        currentSmartSlide = (currentSmartSlide + 1) % SMART_CONSTRUCTION_SLIDES.length;
        updateSmartSlideUI(currentSmartSlide);
    }, 7000);
}

function switchSmartSlide(index) {
    if (index < 0 || index >= SMART_CONSTRUCTION_SLIDES.length) return;
    currentSmartSlide = index;
    updateSmartSlideUI(currentSmartSlide);
    if (smartSliderTimer) clearInterval(smartSliderTimer);
    smartSliderTimer = setInterval(() => {
        currentSmartSlide = (currentSmartSlide + 1) % SMART_CONSTRUCTION_SLIDES.length;
        updateSmartSlideUI(currentSmartSlide);
    }, 7000);
}

function updateSmartSlideUI(index) {
    const slides = document.querySelectorAll('.smart-slide');
    const dots = document.querySelectorAll('.smart-slider-dot');
    slides.forEach((s, idx) => {
        if (idx === index) s.classList.add('active');
        else s.classList.remove('active');
    });
    dots.forEach((d, idx) => {
        if (idx === index) d.classList.add('active');
        else d.classList.remove('active');
    });

    const slideData = SMART_CONSTRUCTION_SLIDES[index];
    if (slideData) {
        const constructionStatus = document.getElementById('dashConstructionStatus');
        const constructionFill = document.getElementById('dashConstructionFill');
        const activeSiteProject = document.getElementById('dashActiveSiteProject');

        if (constructionStatus) constructionStatus.textContent = `${slideData.progress}% مكتمل`;
        if (constructionFill) constructionFill.style.width = `${slideData.progress}%`;
        if (activeSiteProject) {
            activeSiteProject.textContent = slideData.title;
        }
    }
}

function renderDashboard() {
    const stats = tracker.getStats();
    const tasks = tracker.getTasks();
    const projects = tracker.getProjects();
    const employees = tracker.getEmployees();

    const completedTasks = stats.completedTasksCount;
    const totalTasks = stats.tasksCount;
    const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 1. Task Execution Metric (Arc Card 1)
    const execPercentEl = document.getElementById('dashTaskExecPercent');
    if (execPercentEl) execPercentEl.textContent = `${taskPercent}%`;

    const cTasksCountEl = document.getElementById('dashCompletedTasksCount');
    if (cTasksCountEl) cTasksCountEl.textContent = completedTasks;

    const tTasksCountEl = document.getElementById('dashTasksCount');
    if (tTasksCountEl) tTasksCountEl.textContent = totalTasks;

    // SVG Task Gauge Arc: circumference is 251.2 (r=40)
    const gaugeTasks = document.getElementById('dashGaugeTasks');
    if (gaugeTasks) {
        const offset = 251.2 * (1 - (taskPercent / 100));
        gaugeTasks.style.strokeDashoffset = offset;
    }

    // 2. Active Projects Metric (Arc Card 2)
    const pCountEl = document.getElementById('dashProjectsCount');
    if (pCountEl) pCountEl.textContent = stats.projectsCount;

    const gaugeProjects = document.getElementById('dashGaugeProjects');
    if (gaugeProjects) {
        const projPercent = Math.min(100, Math.max(15, stats.projectsCount * 25));
        const offset = 251.2 * (1 - (projPercent / 100));
        gaugeProjects.style.strokeDashoffset = offset;
    }

    // 3. Middle Card: توزيع الأعمال والمشاريع (Dynamic Spaces Comparison Chart)
    const inProgressProjects = projects.filter(p => p.status === 'جاري التنفيذ' || p.status === 'قيد التنفيذ' || p.status === 'قيد التخطيط').length;
    const completedProjects = projects.filter(p => p.status === 'مكتمل' || p.status === 'مكتملة ومستلمة' || p.status === 'مكتملة').length;

    const inProgressTasks = tasks.filter(t => t.status === 'قيد التنفيذ' || t.status === 'قيد الانتظار').length;
    const completedTasksCount = tasks.filter(t => t.status === 'مكتمل').length;

    const totalWorks = projects.length + tasks.length;
    const totalInProgress = inProgressProjects + inProgressTasks;
    const totalCompleted = completedProjects + completedTasksCount;

    let inProgressPercent = 63;
    let completedPercent = 37;

    if (totalWorks > 0) {
        inProgressPercent = Math.round((totalInProgress / totalWorks) * 100);
        completedPercent = 100 - inProgressPercent;
    }

    const inProgressValEl = document.getElementById('dashInProgressVal');
    const inProgressPillarEl = document.getElementById('dashInProgressPillar');
    const inProgressTagEl = document.getElementById('dashInProgressTag');

    const completedValEl = document.getElementById('dashCompletedVal');
    const completedPillarEl = document.getElementById('dashCompletedPillar');
    const completedTagEl = document.getElementById('dashCompletedTag');

    if (inProgressValEl) inProgressValEl.textContent = `${inProgressPercent}%`;
    if (completedValEl) completedValEl.textContent = `${completedPercent}%`;

    const maxHeight = 135;
    const minHeight = 28;
    const inProgHeight = Math.max(minHeight, Math.round((inProgressPercent / 100) * maxHeight));
    const compHeight = Math.max(minHeight, Math.round((completedPercent / 100) * maxHeight));

    if (inProgressPillarEl) inProgressPillarEl.style.height = `${inProgHeight}px`;
    if (completedPillarEl) completedPillarEl.style.height = `${compHeight}px`;

    if (inProgressTagEl) {
        const trend = (inProgressPercent / 10).toFixed(1);
        inProgressTagEl.textContent = `+${trend}%`;
    }
    if (completedTagEl) {
        const trend = (completedPercent / 10).toFixed(1);
        completedTagEl.textContent = `+${trend}%`;
    }

    // Side stats: Total Sites (فدان) & Employees
    const totalSitesEl = document.getElementById('dashTotalSites');
    if (totalSitesEl) {
        let totalFeddans = 0;
        projects.forEach(p => {
            const parsed = parseInt(p.feddan);
            totalFeddans += !isNaN(parsed) ? parsed : 55;
        });
        if (projects.length === 1 && (!projects[0].feddan)) totalFeddans = 111;
        if (projects.length === 0) totalFeddans = 0;
        totalSitesEl.textContent = `${totalFeddans} فدان`;
    }

    const empCountEl = document.getElementById('dashEmployeesCount');
    if (empCountEl) {
        const count = employees.length;
        let label = `${count} موظف`;
        if (count === 1) label = `1 موظف`;
        else if (count === 2) label = `2 موظفين`;
        else if (count >= 3 && count <= 10) label = `${count} موظفين`;
        else if (count > 10) label = `${count} موظفاً`;
        empCountEl.textContent = label;
    }

    // 4. Latest Project Box
    const latestProjContainer = document.getElementById('dashLatestProjectContainer');
    if (latestProjContainer) {
        if (projects.length > 0) {
            const p = projects[0];
            latestProjContainer.innerHTML = `
                <div class="project-preview-card" style="cursor: pointer;" onclick="switchMainView('projects')">
                    <div class="project-preview-info">
                        <h4>${p.title}</h4>
                        <p>${p.location}</p>
                    </div>
                    <div>
                        <button class="badge-status-green" style="cursor:pointer; border:none; font-family:inherit;" onclick="event.stopPropagation(); toggleProjectStatus('${p.id}')">${p.status}</button>
                    </div>
                </div>
            `;
        } else {
            latestProjContainer.innerHTML = `<p style="color: var(--text-dim); font-size: 0.9rem;">لا توجد مشاريع مضافة حتى الآن.</p>`;
        }
    }

    // 5. Real-time Activity List
    const activityList = document.getElementById('dashActivityList');
    if (activityList) {
        const activities = tracker.data.activities || [];
        activityList.innerHTML = activities.slice(0, 5).map(act => `
            <li class="activity-list-item">
                <div class="activity-left-part">
                    <span class="activity-dot-yellow"></span>
                    <span>${act.text}</span>
                </div>
                <span class="activity-time-text">${act.time}</span>
            </li>
        `).join('');
    }

    // 6. Recent Tasks List
    const latestTasksContainer = document.getElementById('dashLatestTasksContainer');
    if (latestTasksContainer) {
        if (tasks.length > 0) {
            latestTasksContainer.innerHTML = tasks.slice(0, 3).map(t => `
                <div class="recent-task-row" style="margin-bottom: 8px;">
                    <div>
                        <span class="recent-task-title">${t.title}</span>
                        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">${t.project} &bull; ${t.assignedTo}</div>
                    </div>
                    <button class="badge-status-dark" style="cursor:pointer; border:none; font-family:inherit;" onclick="toggleTaskStatus('${t.id}')" title="انقر للتبديل بين قيد التنفيذ ومكتمل">${t.status}</button>
                </div>
            `).join('');
        } else {
            latestTasksContainer.innerHTML = `<p style="color: var(--text-dim); font-size: 0.9rem; padding-top: 10px;">لا توجد مهام حالياً.</p>`;
        }
    }
}

// -------------------------------------------------------------
// STATUS TOGGLERS (PROJECT & TASK)
// -------------------------------------------------------------
function toggleProjectStatus(id) {
    const proj = tracker.getProjects().find(p => p.id === id);
    if (!proj) return;
    if (proj.status === 'مكتمل' || proj.status === 'مكتملة ومستلمة') {
        proj.status = 'جاري التنفيذ';
        tracker.logActivity(`تم تحويل حالة المشروع إلى جاري التنفيذ: ${proj.title}`);
    } else {
        proj.status = 'مكتمل';
        tracker.logActivity(`تم اكتمال واستلام المشروع بنجاح: ${proj.title}`);
    }
    tracker.saveData();
    renderProjects();
    renderDashboard();
    const modalDetails = document.getElementById('modalProjectDetails');
    if (modalDetails && modalDetails.classList.contains('active')) {
        showProjectDetails(id);
    }
}

function toggleTaskStatus(id) {
    const task = tracker.getTasks().find(t => t.id === id);
    if (!task) return;
    if (task.status === 'مكتمل') {
        task.status = 'قيد التنفيذ';
        tracker.logActivity(`تم تحويل المهمة إلى قيد التنفيذ: ${task.title}`);
    } else {
        task.status = 'مكتمل';
        tracker.logActivity(`تم إكمال المهمة بنجاح: ${task.title}`);
    }
    tracker.saveData();
    renderTasks();
    renderDashboard();
}

// -------------------------------------------------------------
// 2. PROJECTS VIEW (PUBLIC SHOWCASE)
// -------------------------------------------------------------
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const projects = (typeof SharksCloud !== 'undefined') ? SharksCloud.getProjects(true) : tracker.getProjects();

    if (projects.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-dim); font-size: 0.95rem;">لم يتم إضافة أي مشروع بعد.</p>`;
        return;
    }

    grid.innerHTML = projects.map(p => `
        <div class="project-full-card" style="cursor: pointer;" onclick="showProjectDetails('${p.id}')">
            <div style="height: 200px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 16px; border: 1px solid var(--border-subtle); position: relative;">
                <img src="${p.image || 'assets/project_nile_foundation.jpg'}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/project_nile_foundation.jpg'">
                <div style="position: absolute; top: 12px; right: 12px;">
                    <span class="badge-status-green">${p.status || 'جاري التنفيذ'}</span>
                </div>
            </div>

            <div class="project-card-header">
                <h3 class="project-card-title">${p.title}</h3>
            </div>

            <div class="project-meta-row">
                <div class="meta-icon-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>${p.location}</span>
                </div>
                <div class="meta-icon-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>${p.date || '2026'}</span>
                </div>
            </div>

            <p class="project-card-description">${p.description}</p>

            <button class="project-card-btn" onclick="event.stopPropagation(); showProjectDetails('${p.id}')">
                <span>استعراض التفاصيل</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
        </div>
    `).join('');
}

function showProjectDetails(projId) {
    const list = (typeof SharksCloud !== 'undefined') ? SharksCloud.getProjects(false) : tracker.getProjects();
    const proj = list.find(x => x.id === projId);
    if (!proj) return;

    document.getElementById('detailsProjectTitle').textContent = proj.title;
    document.getElementById('projectDetailsContent').innerHTML = `
        <div style="height: 220px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 8px;">
            <img src="${proj.image || 'assets/project_nile_foundation.jpg'}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/project_nile_foundation.jpg'">
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>حالة المشروع:</span>
            <span class="badge-status-green">${proj.status}</span>
        </div>
        <div>
            <strong style="color:var(--text-white);">الموقع الجغرافي:</strong>
            <p style="margin-top:4px;">${proj.location}</p>
        </div>
        <div>
            <strong style="color:var(--text-white);">المساحة الإجمالية:</strong>
            <p style="margin-top:4px;">${proj.feddan || 55} فدان</p>
        </div>
        <div>
            <strong style="color:var(--text-white);">نطاق ومواصفات المشروع:</strong>
            <p style="margin-top:4px; line-height:1.6;">${proj.description}</p>
        </div>
        <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
            <button class="btn-hero-primary" style="padding: 9px 20px; font-size: 0.88rem;" onclick="closeModal('modalProjectDetails'); switchMainView('contact');">
                <span>طلب استشارة أو معلومات</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <button class="btn-dark-outline" style="padding: 8px 16px; font-size: 0.86rem;" onclick="closeModal('modalProjectDetails')">إغلاق</button>
        </div>
    `;

    openModal('modalProjectDetails');
}

// -------------------------------------------------------------
// 2.1 SUPPLIER ONBOARDING & REGISTRATION PORTAL (بوابة تسجيل الموردين)
// -------------------------------------------------------------
let supplierUploadedFiles = []; // Array of { name, size, type, dataUrl }

function initSupplierPortal() {
    const dropzone = document.getElementById('supplierDropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.remove('drag-over'), false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length) {
            handleSupplierFiles(dt.files);
        }
    }, false);
}

function handleSupplierFilesSelect(event) {
    if (event.target && event.target.files) {
        handleSupplierFiles(event.target.files);
    }
}

function handleSupplierFiles(fileList) {
    const listContainer = document.getElementById('supplierFilesList');
    if (!listContainer) return;

    const files = Array.from(fileList);
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    files.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
            showToast(`الملف "${file.name}" أكبر من الحد المسموح (15MB)`);
            return;
        }

        // Avoid exact duplicates
        if (supplierUploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            supplierUploadedFiles.push({
                name: file.name,
                size: formatFileSize(file.size),
                rawSize: file.size,
                type: file.type || 'application/octet-stream',
                dataUrl: e.target.result
            });
            renderSupplierFilesList();
        };
        reader.readAsDataURL(file);
    });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function removeSupplierDoc(index) {
    supplierUploadedFiles.splice(index, 1);
    renderSupplierFilesList();
}

function renderSupplierFilesList() {
    const container = document.getElementById('supplierFilesList');
    if (!container) return;

    if (supplierUploadedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = supplierUploadedFiles.map((doc, idx) => `
        <div class="supplier-file-chip">
            <div class="file-chip-info">
                <svg class="file-chip-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span class="file-chip-name" title="${doc.name}">${doc.name}</span>
                <span class="file-chip-size">${doc.size}</span>
            </div>
            <button type="button" class="file-chip-remove" onclick="removeSupplierDoc(${idx})" title="إزالة الملف">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    `).join('');
}

function handleSupplierPortalSubmit(event) {
    event.preventDefault();

    const companyName = document.getElementById('supplierCompanyName').value.trim();
    const supplyCategory = (document.getElementById('supplierCategory')?.value || '').trim();
    const contractingCategory = (document.getElementById('supplierContractingCategory')?.value || '').trim();
    const governorate = document.getElementById('supplierGovernorate').value.trim();
    const contactPerson = document.getElementById('supplierContactPerson').value.trim();
    const contactTitle = (document.getElementById('supplierContactTitle').value || '').trim();
    const phone = document.getElementById('supplierPhone').value.trim();
    const whatsapp = document.getElementById('supplierWhatsapp').value.trim();
    const email = document.getElementById('supplierEmail').value.trim();
    const commercialReg = document.getElementById('supplierCommercialReg').value.trim();
    const taxCard = document.getElementById('supplierTaxCard').value.trim();
    const website = (document.getElementById('supplierWebsite').value || '').trim();
    const notes = (document.getElementById('supplierNotes').value || '').trim();

    if (!companyName || (!supplyCategory && !contractingCategory) || !governorate || !contactPerson || !phone || !commercialReg || !taxCard) {
        showToast('يرجى استيفاء جميع الحقول الإلزامية وتحديد مجال التوريد أو المقاولات.');
        return;
    }

    const submitBtn = document.getElementById('btnSubmitSupplierPortal');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <span>جاري حفظ البيانات ورفع المستندات...</span>
        `;
    }

    setTimeout(() => {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const trackingCode = `SHK-SUP-${randNum}`;

        const entityTypeRadio = document.querySelector('input[name="supplierEntityType"]:checked');
        const entityType = entityTypeRadio ? entityTypeRadio.value : 'مورد';

        const categoryCombined = supplyCategory && contractingCategory 
            ? `${supplyCategory} | مقاولات: ${contractingCategory}` 
            : (supplyCategory || contractingCategory || 'عام');

        const applicationData = {
            trackingCode: trackingCode,
            entityType: entityType,
            companyName: companyName,
            category: categoryCombined,
            supplyCategory: supplyCategory,
            contractingCategory: contractingCategory,
            contactPerson: contactPerson,
            contactTitle: contactTitle,
            phone: phone,
            whatsapp: whatsapp,
            email: email,
            commercialRegister: commercialReg,
            taxCard: taxCard,
            governorate: governorate,
            website: website,
            notes: notes,
            documents: [...supplierUploadedFiles],
            status: 'جديد'
        };

        if (window.SharksCloud && SharksCloud.addSupplierApplication) {
            SharksCloud.addSupplierApplication(applicationData);
        } else if (window.tracker) {
            tracker.logActivity(`تم استلام طلب قيد ${entityType} جديد: ${companyName}`);
        }

        // Show Success Modal
        const trackingElem = document.getElementById('supplierSuccessTrackingCode');
        if (trackingElem) trackingElem.textContent = trackingCode;

        const msgElem = document.getElementById('supplierSuccessMessage');
        if (msgElem) {
            msgElem.textContent = `تم تسجيل طلبكم لشركة (${companyName}) في مجال (${categoryCombined}) برقم تتبع (${trackingCode}) بنجاح. تم حفظ كافة المستندات وعددها (${supplierUploadedFiles.length}) ملف، وجاري فحصها من لجنة المشتريات والتوريدات وسيتم التواصل معكم قريباً.`;
        }

        const whatsappDirect = document.getElementById('supplierWhatsappDirectBtn');
        if (whatsappDirect) {
            const waText = encodeURIComponent(`مرحباً إدارة المشتريات بشركة شاركس جروب، تم تقديم طلب قيد ${entityType} لشركة: ${companyName}، كود الطلب: ${trackingCode}.`);
            whatsappDirect.href = `https://wa.me/201111994425?text=${waText}`;
        }

        openModal('modalSupplierPortalSuccess');

        // Reset form & state
        document.getElementById('formSupplierPortal').reset();
        supplierUploadedFiles = [];
        renderSupplierFilesList();

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }

        showToast(`تم إرسال طلب اعتماد "${companyName}" بنجاح!`);
    }, 600);
}

function closeSupplierSuccessModal() {
    closeModal('modalSupplierPortalSuccess');
}

window.handleSupplierPortalSubmit = handleSupplierPortalSubmit;
window.handleSupplierFilesSelect = handleSupplierFilesSelect;
window.removeSupplierDoc = removeSupplierDoc;
window.closeSupplierSuccessModal = closeSupplierSuccessModal;
window.initSupplierPortal = initSupplierPortal;


// -------------------------------------------------------------
// 3. TASKS VIEW
// -------------------------------------------------------------
function renderTasks() {
    const container = document.getElementById('tasksListContainer');
    if (!container) return;

    let tasks = tracker.getTasks();

    const statusFilter = document.getElementById('taskFilterStatus')?.value || 'all';
    const priorityFilter = document.getElementById('taskFilterPriority')?.value || 'all';

    if (statusFilter !== 'all') {
        tasks = tasks.filter(t => t.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
        tasks = tasks.filter(t => t.priority === priorityFilter);
    }

    if (tasks.length === 0) {
        container.innerHTML = `<p style="color: var(--text-dim); font-size: 0.95rem;">لا توجد مهام مسجلة. اضغط على "+ مهمة جديدة".</p>`;
        return;
    }

    container.innerHTML = tasks.map(t => `
        <div class="task-item-card">
            <div class="task-info-part">
                <div class="task-info-title">${t.title}</div>
                <div class="task-info-sub">
                    <span class="task-project-badge">${t.project}</span>
                    <span>المسؤول: ${t.assignedTo}</span>
                </div>
            </div>

            <div class="task-badges-part">
                <button class="badge-status-dark" style="cursor:pointer; border:none; font-family:inherit;" onclick="toggleTaskStatus('${t.id}')" title="انقر للتبديل بين قيد التنفيذ ومكتمل">${t.status}</button>
                <span class="task-priority-pill">${t.priority}</span>
                <span class="task-due-date">${t.dueDate}</span>
                <button class="clean-modal-close" style="font-size: 1.1rem; color: var(--status-red); margin-right: 6px;" title="حذف المهمة" onclick="deleteTaskItem('${t.id}')">&times;</button>
            </div>
        </div>
    `).join('');
}

function toggleTaskFilter() {
    const filterRow = document.getElementById('tasksFilterRow');
    if (filterRow) {
        filterRow.style.display = filterRow.style.display === 'none' ? 'block' : 'none';
    }
}

function deleteTaskItem(id) {
    if (confirm("هل تريد بالتأكيد حذف هذه المهمة؟")) {
        tracker.deleteTask(id);
        renderTasks();
        renderDashboard();
    }
}

// -------------------------------------------------------------
// 4. EMPLOYEES VIEW
// -------------------------------------------------------------
function renderEmployees() {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;

    const employees = tracker.getEmployees();

    if (employees.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim); padding:24px;">لا يوجد موظفين مضافين حالياً.</td></tr>`;
        return;
    }

    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td>
                <div class="emp-name-col">
                    <div class="emp-user-avatar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span>${emp.name}</span>
                </div>
            </td>
            <td>${emp.role}</td>
            <td>${emp.department}</td>
            <td>
                <div class="contact-col-wrap">
                    <div class="contact-col-item">
                        <span>${emp.email}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div class="contact-col-item">
                        <span>${emp.phone}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                </div>
            </td>
            <td>${emp.createdAt}</td>
            <td>
                <div class="table-actions-wrap">
                    <button class="btn-table-edit" onclick="openEditEmployee('${emp.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        <span>تعديل</span>
                    </button>
                    <button class="btn-table-delete" onclick="deleteEmployeeItem('${emp.id}')">حذف</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteEmployeeItem(id) {
    if (confirm("هل تريد بالتأكيد حذف هذا الموظف؟")) {
        tracker.deleteEmployee(id);
        renderEmployees();
        renderDashboard();
        populateTaskModalSelects();
    }
}

// -------------------------------------------------------------
// MODALS LOGIC
// -------------------------------------------------------------
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Add Employee
function handleAddEmployee(e) {
    e.preventDefault();
    const name = document.getElementById('empName').value.trim();
    const email = document.getElementById('empEmail').value.trim();
    const phone = document.getElementById('empPhone').value.trim();
    const role = document.getElementById('empRole').value;
    const department = document.getElementById('empDept').value;

    if (!name || !email || !phone) return;

    tracker.addEmployee({ name, email, phone, role, department });

    document.getElementById('formAddEmployee').reset();
    closeModal('modalAddEmployee');

    renderEmployees();
    renderDashboard();
    populateTaskModalSelects();
}

// Edit Employee
function openEditEmployee(id) {
    const emp = tracker.getEmployees().find(e => e.id === id);
    if (!emp) return;

    document.getElementById('editEmpId').value = emp.id;
    document.getElementById('editEmpName').value = emp.name;
    document.getElementById('editEmpEmail').value = emp.email;
    document.getElementById('editEmpPhone').value = emp.phone;
    document.getElementById('editEmpRole').value = emp.role;
    document.getElementById('editEmpDept').value = emp.department;

    openModal('modalEditEmployee');
}

function handleEditEmployee(e) {
    e.preventDefault();
    const id = document.getElementById('editEmpId').value;
    const name = document.getElementById('editEmpName').value.trim();
    const email = document.getElementById('editEmpEmail').value.trim();
    const phone = document.getElementById('editEmpPhone').value.trim();
    const role = document.getElementById('editEmpRole').value;
    const department = document.getElementById('editEmpDept').value;

    tracker.updateEmployee(id, { name, email, phone, role, department });

    closeModal('modalEditEmployee');
    renderEmployees();
    renderDashboard();
    populateTaskModalSelects();
}

// Add Project
function handleAddProject(e) {
    e.preventDefault();
    const title = document.getElementById('projTitle').value.trim();
    const location = document.getElementById('projLocation').value.trim();
    const date = document.getElementById('projDate').value.trim();
    const feddan = parseInt(document.getElementById('projFeddan')?.value) || 55;
    const status = document.getElementById('projStatus').value;
    const description = document.getElementById('projDesc').value.trim();

    if (!title || !location) return;

    tracker.addProject({ title, location, date, feddan, status, description });

    document.getElementById('formAddProject').reset();
    closeModal('modalAddProject');

    renderProjects();
    renderDashboard();
    populateTaskModalSelects();
}

// Add Task
function handleAddTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const project = document.getElementById('taskProjectSelect').value;
    const assignedTo = document.getElementById('taskEmployeeSelect').value;
    const priority = document.getElementById('taskPriority').value;
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value.trim() || '20 أبريل 2026';

    if (!title) return;

    tracker.addTask({ title, project, assignedTo, priority, status, dueDate });

    document.getElementById('formAddTask').reset();
    closeModal('modalAddTask');

    renderTasks();
    renderDashboard();
}

function populateTaskModalSelects() {
    const projSelect = document.getElementById('taskProjectSelect');
    const empSelect = document.getElementById('taskEmployeeSelect');

    if (projSelect) {
        const projs = tracker.getProjects();
        projSelect.innerHTML = projs.map(p => `<option value="${p.title}">${p.title}</option>`).join('');
    }

    if (empSelect) {
        const emps = tracker.getEmployees();
        empSelect.innerHTML = emps.map(e => `<option value="${e.name}">${e.name} (${e.role})</option>`).join('');
    }
}

// -------------------------------------------------------------
// INTERACTIVE CONTACT: GMAIL COMPOSE & PHONE COPY / CALL
// -------------------------------------------------------------
function openEmailClient(email) {
    if (!email) email = 'info@sharks-eg.com';
    window.location.href = `mailto:${email}`;
}

function handlePhoneClick(phone, event) {
    if (event) event.preventDefault();
    if (!phone) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    
    if (isMobile) {
        window.location.href = `tel:${phone}`;
    } else {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(phone).then(() => {
                showToast(`تم نسخ رقم الهاتف بنجاح: ${phone} 📋`);
            }).catch(() => {
                fallbackCopy(phone);
            });
        } else {
            fallbackCopy(phone);
        }
    }
}

function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try {
        document.execCommand('copy');
        showToast(`تم نسخ رقم الهاتف بنجاح: ${text} 📋`);
    } catch (e) {
        showToast(`الرقم: ${text}`);
    }
    document.body.removeChild(temp);
}

function showToast(message) {
    let toast = document.getElementById('copyToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'copyToast';
        toast.className = 'copy-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

// -------------------------------------------------------------
// FOUNDERS / LEADERSHIP MODAL & DETAILS
// -------------------------------------------------------------
const FOUNDERS_DATA = {
    'founder-1': {
        name: 'المهندس / أحمد البقلي',
        role: 'رئيس مجلس الإدارة والمؤسس',
        image: 'assets/chairman.jpg',
        experience: 'خبرة قيادية واستراتيجية ممتدة في التطوير الإنشائي والعمراني',
        bio: 'رائد أعمال ومهندس قيادي يمتلك رؤية استراتيجية متكاملة في قطاع المقاولات العامة والتطوير العمراني، قاد تأسيس ونمو شاركس جروب منذ عام 2016 لتصبح إحدى الكيانات الهندسية المتميزة في مصر، متبنياً أعلى معايير الجودة والاستدامة والحوكمة المؤسسية.',
        achievements: [
            'قيادة استراتيجية التأسيس والتوسع لمجموعة شاركس جروب منذ عام 2016.',
            'الإشراف العام على تنفيذ مشروعات البنية التحتية العملاقة والمقاولات العامة.',
            'ترسيخ شراكات استراتيجية ناجحة مع كبرى المؤسسات والجهات التنموية.',
            'تطبيق أحدث معايير السلامة المهنية ونظم الجودة العالمية في كافة مواقع العمل.'
        ],
        quote: 'رسالتنا أن نبني مشروعات تسبق عصرها، نصنع بها فارقاً حقيقياً في بنية الوطن، ونقدم لعملائنا وشركائنا قيمة استثمارية وهندسية تدوم لعقود.'
    },
    'founder-2': {
        name: 'المهندس / عمرو عطا الله',
        role: 'المدير التنفيذي',
        image: 'assets/ceo.jpg',
        experience: 'خبرة تنفيذية وإدارية واسعة في العمليات الإنشائية والهندسية الكبرى',
        bio: 'قائد تنفيذي وهندسي خبير في إدارة وتطوير المشروعات الكبرى والعمليات التشغيلية، يمتلك سجلاً حافلاً في تحويل الرؤى الهندسية إلى واقع تنفيذي متقن، مع التركيز على كفاءة إدارة الموارد والتكنولوجيا الإنشائية الحديثة وسرعة ودقة الإنجاز.',
        achievements: [
            'إدارة وتنفيذ منظومة المشروعات الكبرى في شبكات البنية التحتية والطرق والمقاولات العامة.',
            'تطوير الهيكل التشغيلي وضبط معايير الأداء المؤسسي والسلامة المهنية.',
            'تحقيق معدلات إنجاز قياسية في تسليم المشروعات وفق أعلى المواصفات الهندسية المعتمدة.',
            'قيادة فرق المهندسين والفنيين وإدارة الأسطول والمعدات الثقيلة بكفاءة استثنائية.'
        ],
        quote: 'التميز الهندسي ليس مجرد إتقان في التنفيذ، بل هو التزام يومي بالدقة، وإدارة ذكية لكل مرحلة تضمن أعلى كفاءة وأسرع وتيرة إنجاز.'
    }
};

function openFounderModal(founderId) {
    const data = FOUNDERS_DATA[founderId];
    if (!data) return;
    
    let modal = document.getElementById('modalFounderDetails');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalFounderDetails';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="clean-modal-box" style="max-width: 680px;">
                <div class="clean-modal-header">
                    <button class="clean-modal-close" onclick="closeModal('modalFounderDetails')">&times;</button>
                    <h3 class="clean-modal-title" id="founderModalTitle">تفاصيل القيادة</h3>
                </div>
                <div id="founderModalContent" style="display: flex; flex-direction: column; gap: 18px; color: var(--text-muted); font-size: 0.95rem; padding-top: 10px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('founderModalTitle').textContent = data.name;
    const content = document.getElementById('founderModalContent');
    content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 14px;">
                ${data.image ? `<img src="${data.image}" alt="${data.name}" style="width: 58px; height: 58px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.4);">` : ''}
                <div>
                    <span style="color: var(--gold-primary); font-weight: 800; font-size: 1.1rem; display: block;">${data.role}</span>
                    <span style="color: var(--text-white); font-size: 0.95rem; font-weight: 700;">${data.name}</span>
                </div>
            </div>
            <span style="background: rgba(235,199,96,0.15); color: var(--gold-primary); padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">${data.experience}</span>
        </div>
        <div>
            <h4 style="color: var(--text-white); font-weight: 800; margin-bottom: 6px;">النبذة القيادية والتنفيذية:</h4>
            <p style="line-height: 1.75; color: var(--text-muted); font-size: 0.96rem;">${data.bio}</p>
        </div>
        <div>
            <h4 style="color: var(--text-white); font-weight: 800; margin-bottom: 10px;">أبرز الإنجازات والمسيرة المهنية:</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                ${data.achievements.map(a => `
                    <li style="display: flex; align-items: flex-start; gap: 8px; line-height: 1.5;">
                        <span style="color: var(--gold-primary); font-weight: 900;">✓</span>
                        <span>${a}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        <div style="background: var(--bg-card-inner); padding: 16px; border-radius: var(--radius-sm); border-right: 3px solid var(--gold-primary); font-style: italic; line-height: 1.6; color: var(--text-white);">
            "${data.quote}"
        </div>
        <div style="display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;">
            <button onclick="openEmailClient('info@sharks-eg.com')" class="btn-hero-primary" style="flex: 1; min-width: 140px; justify-content: center; padding: 10px;">
                <span>تواصل عبر البريد</span>
            </button>
            <button onclick="handlePhoneClick('01038502003', event)" class="btn-hero-secondary" style="flex: 1; min-width: 140px; justify-content: center; padding: 10px;">
                <span>اتصال أو نسخ الرقم</span>
            </button>
        </div>
    `;
    
    openModal('modalFounderDetails');
}

// -------------------------------------------------------------
// EXPANDABLE FLOATING SOCIAL WIDGET (تابعنا)
// -------------------------------------------------------------
function toggleSocialDock(event) {
    if (event) event.stopPropagation();
    const dock = document.getElementById('stickySocialDock');
    if (!dock) return;
    dock.classList.toggle('open');
}

// Click outside to collapse floating social dock
document.addEventListener('click', (e) => {
    const dock = document.getElementById('stickySocialDock');
    if (dock && dock.classList.contains('open') && !dock.contains(e.target)) {
        dock.classList.remove('open');
    }
});

// -------------------------------------------------------------
// CAREERS & TALENT RECRUITMENT SYSTEM (15 DEPARTMENTS & info@sharks-eg.com)
// -------------------------------------------------------------
window.currentCvFile = null;

function filterCareers(category, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.careers-pill-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }

    const cards = document.querySelectorAll('.dept-card');
    cards.forEach(card => {
        const cardCat = card.dataset.category;
        if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function handleCareerSearch(query) {
    const cleanQuery = (query || '').trim().toLowerCase();
    const cards = document.querySelectorAll('.dept-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const keywords = (card.dataset.keywords || '').toLowerCase();
        if (!cleanQuery || text.includes(cleanQuery) || keywords.includes(cleanQuery)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function getCareerIconSvg(category) {
    if (category === 'management') {
        return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>`;
    } else if (category === 'admin-finance') {
        return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`;
    } else {
        return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
    }
}

function escapeCareerHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderPublicCareers() {
    const grid = document.getElementById('careersGrid');
    if (!grid) return;

    if (typeof SharksCloud === 'undefined' || !SharksCloud.getCareers) {
        return;
    }

    const careers = SharksCloud.getCareers(true); // only visible departments

    // 1. Update count in hero stats bar & title (Request 7)
    const countText = document.getElementById('careersCountText');
    if (countText) {
        countText.textContent = `${careers.length} قسماً وتخصصاً متاحاً`;
        if (countText.parentElement) {
            countText.parentElement.title = `${careers.length} قسماً وتخصصاً متاحاً`;
        }
    }

    // 2. Update count and category filter pills dynamically (Request 2 & 3 & 7)
    const pillsContainer = document.getElementById('careersPillsContainer');
    if (pillsContainer) {
        const categories = (typeof SharksCloud !== 'undefined' && SharksCloud.getCareerCategories)
            ? SharksCloud.getCareerCategories()
            : [
                { id: 'engineering', label: 'القطاع الهندسي والفني' },
                { id: 'management', label: 'إدارة وتخطيط المشروعات' },
                { id: 'admin-finance', label: 'الإدارة والمالية والدعم' }
            ];

        // Filter to ONLY available institutional sectors with active jobs/departments (User Request 3)
        const availableCategories = categories.filter(cat => {
            return careers.some(c => c.category === cat.id);
        });

        const activeBtn = pillsContainer.querySelector('.careers-pill-btn.active');
        const prevActiveCat = activeBtn ? (activeBtn.getAttribute('data-category') || 'all') : 'all';
        const isStillValid = prevActiveCat === 'all' || availableCategories.some(c => c.id === prevActiveCat);
        const activeCat = isStillValid ? prevActiveCat : 'all';

        let pillsHtml = `
            <button id="careersFilterAllPill" data-category="all" class="careers-pill-btn ${activeCat === 'all' ? 'active' : ''}" onclick="filterCareers('all', this)">
                جميع الأقسام (${careers.length})
            </button>
        `;

        availableCategories.forEach(cat => {
            const countInCat = careers.filter(c => c.category === cat.id).length;
            pillsHtml += `
                <button data-category="${escapeCareerHtml(cat.id)}" class="careers-pill-btn ${activeCat === cat.id ? 'active' : ''}" onclick="filterCareers('${escapeCareerHtml(cat.id)}', this)">
                    ${escapeCareerHtml(cat.label)} (${countInCat})
                </button>
            `;
        });

        pillsContainer.innerHTML = pillsHtml;
    } else {
        const allPill = document.getElementById('careersFilterAllPill');
        if (allPill) {
            allPill.textContent = `جميع الأقسام (${careers.length})`;
        }
    }

    // 3. Update department select options in job application modal
    const jobDeptSelect = document.getElementById('jobDepartmentSelect');
    if (jobDeptSelect && careers.length > 0) {
        const currentVal = jobDeptSelect.value;
        jobDeptSelect.innerHTML = careers.map(c => `
            <option value="${escapeCareerHtml(c.titleAr)}">${escapeCareerHtml(c.titleAr)} - ${escapeCareerHtml(c.titleEn || '')}</option>
        `).join('');
        if (currentVal) {
            jobDeptSelect.value = currentVal;
        }
    }

    // 4. Render department cards in grid
    if (careers.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
                <p style="font-size: 1.1rem; margin: 0;">لا توجد أقسام توظيف معلنة في الوقت الحالي.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = careers.map(c => {
        const tagsHtml = (c.tags || []).map(t => `<span class="dept-tag">${escapeCareerHtml(t)}</span>`).join('');
        const safeTitle = escapeCareerHtml(c.titleAr || '');
        const safeTitleJs = safeTitle.replace(/'/g, "\\'");
        return `
            <div class="dept-card" data-category="${escapeCareerHtml(c.category || 'engineering')}" data-keywords="${escapeCareerHtml((c.keywords || '') + ' ' + (c.titleAr || ''))}">
                <div>
                    <div class="dept-card-top">
                        <div class="dept-icon-box">
                            ${getCareerIconSvg(c.category)}
                        </div>
                        <span class="dept-category-badge">${escapeCareerHtml(c.categoryLabel || 'القطاع المؤسسي')}</span>
                    </div>
                    <div class="dept-title-group">
                        <h3 class="dept-title">${safeTitle}</h3>
                        <span class="dept-subtitle">${escapeCareerHtml(c.titleEn || '')}</span>
                    </div>
                    <p class="dept-description">
                        ${escapeCareerHtml(c.description || '')}
                    </p>
                    <div class="dept-tags-row">
                        ${tagsHtml}
                    </div>
                </div>
                <button type="button" class="dept-apply-btn" onclick="openJobModal('${safeTitleJs}')">
                    <span>التقديم على هذا القسم</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
            </div>
        `;
    }).join('');
}

// Real-time synchronization when admin updates careers or categories in another tab
window.addEventListener('storage', (e) => {
    if (e.key === 'sharks_careers_db' || e.key === 'sharks_career_categories_db') {
        renderPublicCareers();
    }
});

function openJobModal(deptName) {
    const modal = document.getElementById('modalJobApplication');
    if (!modal) return;

    const titleSpan = document.getElementById('modalTargetDeptName');
    const select = document.getElementById('jobDepartmentSelect');
    const hidden = document.getElementById('jobHiddenDept');

    if (deptName) {
        if (titleSpan) titleSpan.textContent = deptName;
        if (select) select.value = deptName;
        if (hidden) hidden.value = deptName;
    }

    // Reset CV file zone
    window.currentCvFile = null;
    const fileInput = document.getElementById('jobCvFile');
    if (fileInput) fileInput.value = '';
    const display = document.getElementById('cvFileDisplay');
    if (display) display.classList.remove('active');

    // Init Drag & Drop if not already initialized
    initCvDragAndDrop();

    modal.classList.add('active');
}

function closeJobModal() {
    const modal = document.getElementById('modalJobApplication');
    if (modal) modal.classList.remove('active');
}

function syncJobDept(deptName) {
    const titleSpan = document.getElementById('modalTargetDeptName');
    const hidden = document.getElementById('jobHiddenDept');
    if (titleSpan) titleSpan.textContent = deptName;
    if (hidden) hidden.value = deptName;
}

function handleCvFileSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        setChosenCvFile(file);
    }
}

function setChosenCvFile(file) {
    window.currentCvFile = file;
    const display = document.getElementById('cvFileDisplay');
    const nameSpan = document.getElementById('cvFileNameText');
    const sizeSpan = document.getElementById('cvFileSizeText');

    if (display && nameSpan) {
        nameSpan.textContent = file.name;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        if (sizeSpan) sizeSpan.textContent = `(${sizeMb} MB)`;
        display.classList.add('active');
    }
}

function removeCvFile(e) {
    if (e) e.stopPropagation();
    window.currentCvFile = null;
    const fileInput = document.getElementById('jobCvFile');
    if (fileInput) fileInput.value = '';
    const display = document.getElementById('cvFileDisplay');
    if (display) display.classList.remove('active');
}

function initCvDragAndDrop() {
    const zone = document.getElementById('cvUploadZone');
    if (!zone || zone.dataset.dragInit) return;
    zone.dataset.dragInit = 'true';

    ['dragenter', 'dragover'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('dragover');
        }, false);
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('dragover');
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files[0]) {
            setChosenCvFile(dt.files[0]);
        }
    }, false);
}

function handleJobApplicationSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('jobApplicantName').value.trim();
    const email = document.getElementById('jobApplicantEmail').value.trim();
    const phone = document.getElementById('jobApplicantPhone').value.trim();
    const dept = document.getElementById('jobDepartmentSelect').value;
    const exp = document.getElementById('jobExperienceLevel').value;
    const portfolio = (document.getElementById('jobPortfolioLink').value || '').trim();
    const notes = (document.getElementById('jobExtraDocsNotes').value || '').trim();
    const cvFile = window.currentCvFile || (document.getElementById('jobCvFile').files ? document.getElementById('jobCvFile').files[0] : null);

    if (!name || !email || !phone) {
        showToast('يرجى ملء جميع الحقول الإلزامية');
        return;
    }

    const cvFileName = cvFile ? cvFile.name : 'مرفق بالبريد';

    // Build the mailto link to info@sharks-eg.com
    const subject = encodeURIComponent(`طلب توظيف جديد: ${name} - ${dept}`);
    let body = `السادة إدارة الموارد البشرية - شركة شاركس جروب للمقاولات العامة والتطوير العقاري،%0D%0A%0D%0A`;
    body += `تحية طيبة وبعد،%0D%0A%0D%0A`;
    body += `أتقدم بطلب انضمام لشغل وظيفة في قسم: ${encodeURIComponent(dept)}%0D%0A%0D%0A`;
    body += `بيانات المتقدم:%0D%0A`;
    body += `- الاسم الكامل: ${encodeURIComponent(name)}%0D%0A`;
    body += `- البريد الإلكتروني: ${encodeURIComponent(email)}%0D%0A`;
    body += `- رقم الهاتف / الواتساب: ${encodeURIComponent(phone)}%0D%0A`;
    body += `- القسم المطلوب: ${encodeURIComponent(dept)}%0D%0A`;
    body += `- سنوات الخبرة: ${encodeURIComponent(exp)}%0D%0A`;
    body += `- ملف السيرة الذاتية: ${encodeURIComponent(cvFileName)}%0D%0A`;
    if (portfolio) {
        body += `- رابط الأعمال / Portfolio: ${encodeURIComponent(portfolio)}%0D%0A`;
    }
    if (notes) {
        body += `%0D%0Aملاحظات ومستندات إضافية:%0D%0A${encodeURIComponent(notes)}%0D%0A`;
    }
    body += `%0D%0Aتاريخ التقديم: ${encodeURIComponent(new Date().toLocaleDateString('ar-EG'))}%0D%0A`;

    const mailtoUrl = `mailto:info@sharks-eg.com?subject=${subject}&body=${body}`;

    // Update the direct button in success modal
    const directLink = document.getElementById('directMailtoLink');
    if (directLink) {
        directLink.href = mailtoUrl;
    }

    const msg = document.getElementById('jobSuccessMessage');
    if (msg) {
        msg.textContent = `تم تسجيل طلبك لقسم (${dept}) بنجاح باسم (${name}). تم تجهيز تفاصيل طلبك لإرسالها مباشرة إلى بريد الشركة الرسمي info@sharks-eg.com وسنقوم بمراجعة سيرتك الذاتية والتواصل معك قريباً.`;
    }

    // Log to tracker
    if (window.tracker) {
        tracker.logActivity(`تم استلام طلب توظيف: ${name} - قسم ${dept}`);
    }

    // Close application modal and open success modal
    closeJobModal();
    const successModal = document.getElementById('modalJobSuccess');
    if (successModal) {
        successModal.classList.add('active');
    }

    // Trigger mail client popup
    setTimeout(() => {
        try {
            window.location.href = mailtoUrl;
        } catch (e) {
            console.log("Mail client trigger: ", e);
        }
    }, 400);

    // Reset form
    document.getElementById('formJobApplication').reset();
    removeCvFile();
}

// Expose all handlers globally for inline HTML event triggers
function handleSupplierWhatsappClick() {
    closeModal('modalSupplierPortalSuccess');
    switchMainView('home');
    window.scrollTo(0, 0);
}

function deleteProjectItem(id) {
    if (window.SharksCloud && SharksCloud.deleteProject) {
        SharksCloud.deleteProject(id);
    }
}
function renderPublicSuppliers() {}
function filterPublicSuppliers() {}

window.handleSupplierWhatsappClick = handleSupplierWhatsappClick;
window.switchMainView = switchMainView;
window.goToHomeSection = goToHomeSection;
window.handleDedicatedContact = handleDedicatedContact;
window.handlePublicContact = handlePublicContact;
window.switchToHomeView = switchToHomeView;
window.switchToPortalView = switchToPortalView;
window.navigateToSection = navigateToSection;
window.switchAboutTab = switchAboutTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.handleAddEmployee = handleAddEmployee;
window.openEditEmployee = openEditEmployee;
window.handleEditEmployee = handleEditEmployee;
window.deleteEmployeeItem = deleteEmployeeItem;
window.handleAddProject = handleAddProject;
window.showProjectDetails = showProjectDetails;
window.deleteProjectItem = deleteProjectItem;
window.handleAddTask = handleAddTask;
window.toggleTaskFilter = toggleTaskFilter;
window.deleteTaskItem = deleteTaskItem;
window.renderTasks = renderTasks;
window.toggleTheme = toggleTheme;
window.openEmailClient = openEmailClient;
window.handlePhoneClick = handlePhoneClick;
window.showToast = showToast;
window.openFounderModal = openFounderModal;
window.toggleSocialDock = toggleSocialDock;
window.filterCareers = filterCareers;
window.handleCareerSearch = handleCareerSearch;
window.openJobModal = openJobModal;
window.closeJobModal = closeJobModal;
window.syncJobDept = syncJobDept;
window.handleCvFileSelect = handleCvFileSelect;
window.removeCvFile = removeCvFile;
window.handleJobApplicationSubmit = handleJobApplicationSubmit;
window.initServicesSliderApp = initServicesSliderApp;
window.renderPublicSuppliers = renderPublicSuppliers;
window.filterPublicSuppliers = filterPublicSuppliers;
window.renderPublicCareers = renderPublicCareers;



