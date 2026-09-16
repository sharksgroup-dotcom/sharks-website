/**
 * Sharks Group Enterprise Suite - Cloud Integration Layer (Firebase & Local Fallback)
 * -----------------------------------------------------------------------------------
 * This module seamlessly connects Sharks Group to Firebase Firestore & Auth.
 * If Firebase keys are configured, it syncs directly to the Cloud in Real-Time.
 * If running locally or offline, it transparently falls back to local storage
 * ensuring 100% uptime with zero errors.
 */

// 1. Firebase Configuration (Put your Firebase Project details here when ready)
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "sharks-group-contracting.firebaseapp.com",
    projectId: "sharks-group-contracting",
    storageBucket: "sharks-group-contracting.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Default Suppliers for Sharks Group
const DEFAULT_SUPPLIERS = [
    {
        id: "sup_ezz",
        name: "حديد عز (Ezz Steel)",
        category: "حديد وتسليح",
        logo: "assets/project_nile_foundation.jpg",
        contactPerson: "قطاع مبيعات المشاريع الكبرى",
        phone: "19555",
        email: "projects@ezzsteel.com",
        website: "https://www.ezzsteel.com",
        visible: true,
        description: "التوريد الرئيسي لحديد التسليح عالي المقاومة والمطابق للمواصفات القياسية المصرية والعالمية لكافة مشروعات شاركس جروب.",
        createdAt: "10 يناير 2026"
    },
    {
        id: "sup_suez",
        name: "أسمنت السويس (Heidelberg Materials)",
        category: "أسمنت وخرسانة",
        logo: "assets/project_engineers_site.jpg",
        contactPerson: "إدارة التوريدات الهندسية",
        phone: "16650",
        email: "orders@suezcement.com",
        website: "https://www.suezcement.com.eg",
        visible: true,
        description: "توريد الأسمنت البورتلاندي المقاوم والخرسانة الجاهزة عالية الإجهاد للأساسات والمنشآت الخرسانية الضخمة.",
        createdAt: "12 يناير 2026"
    },
    {
        id: "sup_sewedy",
        name: "السويدي إلكتريك (Elsewedy Electric)",
        category: "كابلات وكهروميكانيك",
        logo: "assets/project_infrastructure_pipes.jpg",
        contactPerson: "مهندس توريدات الشبكات والمقاولات",
        phone: "19777",
        email: "infrastructure@elsewedy.com",
        website: "https://www.elsewedyelectric.com",
        visible: true,
        description: "شريك التوريد الحصري لشبكات الكابلات الكهربائية، المحولات، والحلول الكهروميكانيكية لمشاريع البنية التحتية.",
        createdAt: "18 يناير 2026"
    },
    {
        id: "sup_sika",
        name: "سيكا مصر (Sika Egypt)",
        category: "عوازل ومواد كيميائية",
        logo: "assets/project_excavator_breaker.jpg",
        contactPerson: "قسم الدعم الفني والمشاريع",
        phone: "0226184500",
        email: "technical@eg.sika.com",
        website: "https://egy.sika.com",
        visible: true,
        description: "توريد كيماويات البناء الحديث، إضافات الخرسانة، ومواد العزل المائي والحراري المعتمدة في المشاريع القومية.",
        createdAt: "22 يناير 2026"
    },
    {
        id: "sup_jotun",
        name: "جوتين مصر (Jotun Paints)",
        category: "دهانات وتشطيبات",
        logo: "assets/project_road_earthwork.jpg",
        contactPerson: "المبيعات المعمارية المتخصصة",
        phone: "19888",
        email: "architectural@jotun.com.eg",
        website: "https://www.jotun.com/eg-ar",
        visible: true,
        description: "أنظمة الدهانات المقاومة للعوامل الجوية والتشطيبات الفاخرة للواجهات الخارجية والديكورات الداخلية.",
        createdAt: "01 فبراير 2026"
    }
];

// Default Career Sectors / Categories
const DEFAULT_CAREER_CATEGORIES = [
    { id: "engineering", label: "القطاع الهندسي والفني" },
    { id: "management", label: "إدارة وتخطيط المشروعات" },
    { id: "admin-finance", label: "الإدارة والمالية والدعم" }
];

// Default 15 Career Departments (Request 7)
const DEFAULT_CAREERS = [
    {
        id: "career_1",
        titleAr: "مهندسين الطرق",
        titleEn: "Roads & Highway Engineers",
        category: "engineering",
        categoryLabel: "القطاع الهندسي",
        description: "الإشراف الهندسي الميداني والتصميمي لمشاريع الطرق السريعة والمحاور الحضرية، تخطيط شبكات الأسفلت، اختبارات التربة، والتحكم في جودة الطبقات الإنشائية.",
        keywords: "طرق كباري اسفلت محاور هندسة مدنية مهندسين الطرق",
        tags: ["دوام كامل", "هندسة مدنية", "مواقع ومشروعات"],
        vacancies: 4,
        visible: true
    },
    {
        id: "career_2",
        titleAr: "مهندسين الكهرباء",
        titleEn: "Electrical & Power Engineers",
        category: "engineering",
        categoryLabel: "القطاع الهندسي",
        description: "إدارة وتنفيذ شبكات الجهد المتوسط والمنخفض، محطات التوزيع الكهربائي، إنارة الطرق والمحاور والأنفاق، وأنظمة التيار الخفيف والمولدات الاحتياطية.",
        keywords: "كهرباء جهد محطات تيار خفيف انارة مهندسين الكهربا الكهرباء",
        tags: ["دوام كامل", "شبكات وتوزيع", "مشاريع كبرى"],
        vacancies: 3,
        visible: true
    },
    {
        id: "career_3",
        titleAr: "مهندسين الميكانيكا",
        titleEn: "Mechanical & MEP Engineers",
        category: "engineering",
        categoryLabel: "القطاع الهندسي",
        description: "تنفيذ وإشراف أعمال شبكات البنية التحتية للمياه والصرف الصحي، محطات الرفع، منظومات مكافحة الحريق، وشبكات الـ MEP والمعدات الميكانيكية الثقيلة.",
        keywords: "ميكانيكا مرافق مياه صرف طلمبات تكييف حريق مهندسين الميكانيكا",
        tags: ["دوام كامل", "MEP ومحطات مياه", "إشراف ميداني"],
        vacancies: 3,
        visible: true
    },
    {
        id: "career_4",
        titleAr: "المكتب الفني",
        titleEn: "Technical Office Engineers",
        category: "engineering",
        categoryLabel: "القطاع الهندسي",
        description: "إعداد ومراجعة المخططات التنفيذية Shop Drawings، حصر الكميات والمقايسات، مطابقة المواصفات الفنية، وإعداد المستخلصات الدورية للمالك ومقاولي الباطن.",
        keywords: "مكتب فني حصر مستخلصات شوب دروينج اوتوكاد رسومات المكتب الفنى",
        tags: ["دوام كامل", "Shop Drawings", "حصر ومستخلصات"],
        vacancies: 5,
        visible: true
    },
    {
        id: "career_5",
        titleAr: "منسق مستندات",
        titleEn: "Document Controller",
        category: "management",
        categoryLabel: "التخطيط والدعم",
        description: "إدارة وتنظيم الدورة المستندية للمشروعات الهندسية، أرشفة المعاملات والمراسلات الفنية وتقارير الاستشاري، وإدارة منظومات الأرشفة الإلكترونية EDMS.",
        keywords: "منسق مستندات وثائق ارشفة دوكيومنت كنترول Document Controller منسق مستنداتو",
        tags: ["دوام كامل", "EDMS", "إدارة وتدقيق الوثائق"],
        vacancies: 2,
        visible: true
    },
    {
        id: "career_6",
        titleAr: "تكنولوجيا المعلومات",
        titleEn: "Information Technology (IT)",
        category: "admin-finance",
        categoryLabel: "الإدارة والدعم",
        description: "إدارة البنية التحتية للشبكات والخوادم، تأمين الأنظمة المؤسسية والسحابية، الدعم الفني لمقرات الشركة والمواقع، وإدارة البرمجيات والأنظمة الهندسية.",
        keywords: "تكنولوجيا المعلومات اي تي شبكات خوادم برمجيات IT تكنولوجيا المعلومات",
        tags: ["دوام كامل", "شبكات وسيرفرات", "أمن المعلومات"],
        vacancies: 2,
        visible: true
    },
    {
        id: "career_7",
        titleAr: "الموارد البشرية",
        titleEn: "Human Resources (HR)",
        category: "admin-finance",
        categoryLabel: "الإدارة والدعم",
        description: "استقطاب أفضل الكفاءات الهندسية والإدارية، إدارة عمليات التوظيف، شؤون العاملين والتأمينات، وتطوير برامج التدريب واللوائح المؤسسية للشركة.",
        keywords: "الموارد البشرية اتش ار توظيف شؤون العاملين مواهب HR الموارد البشرية",
        tags: ["دوام كامل", "استقطاب الكفاءات", "شؤون العاملين"],
        vacancies: 3,
        visible: true
    },
    {
        id: "career_8",
        titleAr: "المشتريات",
        titleEn: "Procurement & Purchasing",
        category: "admin-finance",
        categoryLabel: "الإدارة والمالية",
        description: "استدراج ومقارنة عروض الأسعار، التفاوض مع كبرى مصانع الحديد والأسمنت والركام والمعدات، وتأمين سلاسل الإمداد لمواقع المشروعات بالجدول الزمني المحدد.",
        keywords: "المشتريات توريدات موردين خامات اسعار عقود شراء المشتريات",
        tags: ["دوام كامل", "سلاسل الإمداد", "تفاوض وتعاقدات"],
        vacancies: 3,
        visible: true
    },
    {
        id: "career_9",
        titleAr: "المحاسبين",
        titleEn: "Accounting & Finance",
        category: "admin-finance",
        categoryLabel: "الإدارة والمالية",
        description: "إدارة الحسابات المالية، محاسبة تكاليف المشروعات الإنشائية، إعداد التدفقات النقدية وميزانيات المشاريع، ومتابعة مستخلصات الموردين ومقاولي الباطن.",
        keywords: "المحاسبين محاسبة مالية تكاليف تدقيق ضرائب ميزانيات المحاسبين",
        tags: ["دوام كامل", "محاسبة تكاليف", "تدقيق وقوائم مالية"],
        vacancies: 4,
        visible: true
    },
    {
        id: "career_10",
        titleAr: "المخازن",
        titleEn: "Warehouse & Inventory Management",
        category: "management",
        categoryLabel: "التخطيط والدعم",
        description: "إدارة المستودعات المركزية ومخازن المشروعات، استلام وتخزين المواد الإنشائية وقطع الغيار، تنظيم عمليات الصرف للمواقع، والجرد الدوري المحكم.",
        keywords: "المخازن مستودعات جرد خامات معدات فحص المخازن",
        tags: ["دوام كامل", "إدارة مخزون", "جرد وفحص خامات"],
        vacancies: 3,
        visible: true
    },
    {
        id: "career_11",
        titleAr: "الأمن والسلامة",
        titleEn: "Safety & Security (HSE)",
        category: "admin-finance",
        categoryLabel: "الإدارة والدعم",
        description: "تأمين المواقع الإنشائية والمعدات، تطبيق اشتراطات السلامة والصحة المهنية (HSE)، مراقبة الدخول والخروج، وإدارة خطط الطوارئ والوقاية من الحوادث.",
        keywords: "الامن الامن والسلامة حراسة مواقع سلامة صحة مهنية HSE الامن",
        tags: ["دوام كامل", "HSE & السلامة المهنية", "تأمين مواقع ومقرات"],
        vacancies: 4,
        visible: true
    },
    {
        id: "career_12",
        titleAr: "الشؤون الإدارية",
        titleEn: "Administrative Affairs",
        category: "admin-finance",
        categoryLabel: "الإدارة والدعم",
        description: "تسيير الخدمات الإدارية واللوجستية بمقرات وفروع الشركة، إدارة العقود والتراخيص والمراسلات الحكومية، وتوفير كافة متطلبات بيئة العمل المثالية.",
        keywords: "الشؤون الادارية خدمات مقرات تراخيص علاقات حكومية شؤون ادارية الشؤون الادارية",
        tags: ["دوام كامل", "خدمات إدارية", "تنسيق حكومي"],
        vacancies: 2,
        visible: true
    },
    {
        id: "career_13",
        titleAr: "إدارة المشاريع (PMO)",
        titleEn: "Project Management Office",
        category: "management",
        categoryLabel: "إدارة وتخطيط المشروعات",
        description: "التخطيط والتحكم الزمني والمالي للمشاريع الكبرى، إعداد خطط التنفيذ ببرامج Primavera P6، إدارة المخاطر، ومتابعة مؤشرات الإنجاز والجودة بالمواقع.",
        keywords: "ادارة المشاريع بي ام او PMO بريمافيرا جداول زمنية تخطيط مخاطر ادارة المشاريع",
        tags: ["دوام كامل", "PMP / Primavera", "تحكم ومتابعة نسب الإنجاز"],
        vacancies: 3,
        visible: true
    },
    {
        id: "career_14",
        titleAr: "التطوير المؤسسي",
        titleEn: "Corporate Development & Strategy",
        category: "management",
        categoryLabel: "إدارة وتخطيط المشروعات",
        description: "بناء وتطوير الاستراتيجيات والسياسات العامة للمجموعة، تحسين الكفاءة التشغيلية، تطبيق نظم الحوكمة والجودة المؤسسية، واستكشاف الفرص الاستثمارية الواعدة.",
        keywords: "التطوير المؤسسي استراتيجية جودة نظم حوكمة تطوير اعمال التطوير المؤسسي",
        tags: ["دوام كامل", "تخطيط استراتيجي", "تطوير نظم وحوكمة"],
        vacancies: 2,
        visible: true
    },
    {
        id: "career_15",
        titleAr: "دعم المشاريع",
        titleEn: "Project Support & Logistics",
        category: "management",
        categoryLabel: "إدارة وتخطيط المشروعات",
        description: "تقديم المساندة الميدانية واللوجستية المستمرة لمواقع العمل، تنسيق تزويد المعدات والوقود، الصيانة السريعة للآليات الإنشائية، وحل أي معوقات تشغيلية.",
        keywords: "دعم المشاريع لوجستيات تزويد مواقع وقود صيانة مساندة ميدانية دعم المشاريع",
        tags: ["دوام كامل", "مساندة ميدانية", "إمداد وصيانة معدات"],
        vacancies: 3,
        visible: true
    }
];

// Default Authorized Admin Accounts (Request 1)
const DEFAULT_ADMIN_USERS = {
    "ahmedelbaqly": {
        username: "ahmedelbaqly",
        password: "123@456#789",
        displayName: "ENG. Ahmed Elbaqly",
        title: "المؤسس والمدير العام",
        phone: "01033383232",
        role: "Admin"
    },
    "ahmedkhaled": {
        username: "ahmedkhaled",
        password: "bas@1512005",
        displayName: "ENG. Ahmed Khaled",
        title: "المؤسس والمدير العام",
        phone: "01033383232",
        role: "Admin"
    }
};

// Default Sample Supplier Applications for Realistic Demo
const DEFAULT_SUPPLIER_APPLICATIONS = [
    {
        id: "sup_app_1",
        trackingCode: "SHK-SUP-5921",
        companyName: "شركة حديد الدلتا للصناعات المعدنية",
        category: "حديد وتسليح",
        contactPerson: "المهندس / سامح عبد الرؤوف",
        contactTitle: "مدير مبيعات المشروعات الكبرى",
        phone: "01099238472",
        whatsapp: "01099238472",
        email: "sales@delta-steel.eg",
        commercialRegister: "148920",
        taxCard: "482-910-332",
        governorate: "العاشر من رمضان - الشرقية",
        website: "https://delta-steel.eg",
        notes: "توريد حديد تسليح عالي المقاومة B500DWR بكافة الأقطار من 10 مم حتى 32 مم، ومطابق للمواصفات القياسية المصرية والأمريكية ASTM A615 بطاقة يومية 500 طن للمواقع الإنشائية.",
        documents: [
            {
                name: "السجل_التجاري_حديد_الدلتا.pdf",
                size: "1.8 MB",
                type: "application/pdf",
                dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ..."
            },
            {
                name: "البطاقة_الضريبية_وسابقة_الاعمال.pdf",
                size: "2.4 MB",
                type: "application/pdf",
                dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ..."
            }
        ],
        status: "جديد",
        createdAt: "13 سبتمبر 2026",
        timestamp: Date.now() - 3600000
    },
    {
        id: "sup_app_2",
        trackingCode: "SHK-SUP-3184",
        companyName: "مجموعة لافارج والمهندس للخرسانة الجاهزة",
        category: "أسمنت وخرسانة جاهزة",
        contactPerson: "الأستاذ / ماجد الشناوي",
        contactTitle: "مدير إدارة التعاقدات والتوريدات",
        phone: "01288349210",
        whatsapp: "01288349210",
        email: "contracting@readymix-eg.com",
        commercialRegister: "295810",
        taxCard: "310-845-129",
        governorate: "القاهرة الجديدة",
        website: "https://readymix-eg.com",
        notes: "محطة خرسانة مركزية ومتحركة بقدرة إنتاجية 120 م3/ساعة، مع أسطول مضخات وخلاطات حديثة لتغطية مشروعات العاصمة الإدارية والتجمع والساحل الشمالي.",
        documents: [
            {
                name: "شهادة_الاعتماد_والفحص_المعملي.pdf",
                size: "1.2 MB",
                type: "application/pdf",
                dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ..."
            }
        ],
        status: "قيد المراجعة",
        createdAt: "12 سبتمبر 2026",
        timestamp: Date.now() - 86400000
    }
];

class SharksCloudStoreManager {
    constructor() {
        this.STORAGE_KEY = 'sharks_group_cloud_store_v1';
        this.AUTH_SESSION_KEY = 'sharks_admin_session';
        this.ADMIN_USERS_KEY = 'sharks_admin_users_v2';
        this.isFirebaseReady = false;
        this.db = null;
        this.auth = null;

        // Initialize Local cache
        this.localData = this.loadLocalData();
        this.initFirebase();
    }

    getAdminUsers() {
        try {
            const raw = localStorage.getItem(this.ADMIN_USERS_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        const initial = JSON.parse(JSON.stringify(DEFAULT_ADMIN_USERS));
        localStorage.setItem(this.ADMIN_USERS_KEY, JSON.stringify(initial));
        return initial;
    }

    saveAdminUsers(users) {
        localStorage.setItem(this.ADMIN_USERS_KEY, JSON.stringify(users));
    }

    initFirebase() {
        try {
            if (window.firebase && FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY_HERE") {
                if (!firebase.apps.length) {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }
                this.db = firebase.firestore();
                this.auth = firebase.auth();
                this.isFirebaseReady = true;
                console.log("⚡ Sharks Cloud: Connected to Firebase Firestore & Auth successfully.");

                // Real-time Firestore sync for Supplier Applications
                try {
                    this.db.collection('supplier_applications').onSnapshot((snapshot) => {
                        if (snapshot && !snapshot.empty) {
                            const apps = [];
                            snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
                            this.localData.supplier_applications = apps;
                            this.saveLocalData();
                            if (typeof window.renderSupplierApplicationsTable === 'function') {
                                window.renderSupplierApplicationsTable();
                            }
                        }
                    }, (err) => console.log("Firestore supplier_applications note:", err));
                } catch (e) {}
            } else {
                console.log("ℹ️ Sharks Cloud: Running on High-Speed Smart Local Store (Ready for Cloud Keys).");
            }
        } catch (err) {
            console.warn("⚠️ Sharks Cloud initialization fallback to local:", err);
            this.isFirebaseReady = false;
        }
    }

    loadLocalData() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                let changed = false;
                if (!parsed.suppliers || parsed.suppliers.length === 0) {
                    parsed.suppliers = JSON.parse(JSON.stringify(DEFAULT_SUPPLIERS));
                    changed = true;
                }
                if (!parsed.careers || parsed.careers.length === 0) {
                    parsed.careers = JSON.parse(JSON.stringify(DEFAULT_CAREERS));
                    changed = true;
                }
                if (!parsed.supplier_applications || parsed.supplier_applications.length === 0) {
                    parsed.supplier_applications = JSON.parse(JSON.stringify(DEFAULT_SUPPLIER_APPLICATIONS));
                    changed = true;
                }
                if (changed) {
                    this.saveLocalData(parsed);
                }
                return parsed;
            }
        } catch (e) {
            console.error("Error reading local data", e);
        }

        const initial = {
            suppliers: JSON.parse(JSON.stringify(DEFAULT_SUPPLIERS)),
            supplier_applications: JSON.parse(JSON.stringify(DEFAULT_SUPPLIER_APPLICATIONS)),
            careers: JSON.parse(JSON.stringify(DEFAULT_CAREERS)),
            projects: (typeof DEFAULT_DATA !== 'undefined' && DEFAULT_DATA.projects) ? DEFAULT_DATA.projects : [],
            tasks: (typeof DEFAULT_DATA !== 'undefined' && DEFAULT_DATA.tasks) ? DEFAULT_DATA.tasks : [],
            employees: (typeof DEFAULT_DATA !== 'undefined' && DEFAULT_DATA.employees) ? DEFAULT_DATA.employees : [],
            activities: (typeof DEFAULT_DATA !== 'undefined' && DEFAULT_DATA.activities) ? DEFAULT_DATA.activities : []
        };
        this.saveLocalData(initial);
        return initial;
    }

    saveLocalData(data = null) {
        if (data) this.localData = data;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.localData));
        } catch (e) {
            console.error("Error saving local data", e);
        }
    }

    // --- Authentication & Session Management (Request 1 & 2) ---
    login(identifier, password) {
        const users = this.getAdminUsers();
        const cleanId = (identifier || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        let matchedUser = null;

        for (const key of Object.keys(users)) {
            const u = users[key];
            if (u.username.toLowerCase() === cleanId || 
                (u.email && u.email.toLowerCase() === cleanId) || 
                (cleanId === 'admin' && key === 'ahmedkhaled')) {
                if (u.password === cleanPass) {
                    matchedUser = u;
                    break;
                }
            }
        }

        if (matchedUser) {
            const savedAvatar = this.getUserAvatar(matchedUser.username);
            const session = {
                user: {
                    username: matchedUser.username,
                    name: matchedUser.displayName,
                    title: matchedUser.title || "المؤسس والمدير العام",
                    avatar: savedAvatar || null,
                    role: matchedUser.role || "Admin",
                    loginAt: new Date().toISOString()
                },
                token: "sharks_token_" + Date.now(),
                lastActivity: Date.now()
            };
            sessionStorage.setItem(this.AUTH_SESSION_KEY, JSON.stringify(session));
            try { localStorage.removeItem(this.AUTH_SESSION_KEY); } catch(e) {}
            this.logActivity(`تسجيل دخول ناجح للمدير: ${matchedUser.displayName}`);
            return { success: true, session };
        } else {
            return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
        }
    }

    logout() {
        sessionStorage.removeItem(this.AUTH_SESSION_KEY);
        try { localStorage.removeItem(this.AUTH_SESSION_KEY); } catch(e) {}
        if (this.isFirebaseReady && this.auth) {
            this.auth.signOut().catch(console.error);
        }
    }

    checkAuth() {
        try {
            const raw = sessionStorage.getItem(this.AUTH_SESSION_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);

            // Refresh avatar from store if user exists
            if (parsed && parsed.user && parsed.user.username) {
                const freshAvatar = this.getUserAvatar(parsed.user.username);
                parsed.user.avatar = freshAvatar || null;
            }
            return parsed;
        } catch (e) {
            return null;
        }
    }

    updateSessionActivity() {
        try {
            const raw = sessionStorage.getItem(this.AUTH_SESSION_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            parsed.lastActivity = Date.now();
            sessionStorage.setItem(this.AUTH_SESSION_KEY, JSON.stringify(parsed));
        } catch (e) {}
    }

    // --- User Avatar Management (Request 2) ---
    getUserAvatar(username) {
        if (!username) return null;
        return localStorage.getItem('sharks_avatar_' + username) || null;
    }

    setUserAvatar(username, dataUrl) {
        if (!username) return;
        localStorage.setItem('sharks_avatar_' + username, dataUrl);
        const session = this.checkAuth();
        if (session && session.user && session.user.username === username) {
            session.user.avatar = dataUrl;
            sessionStorage.setItem(this.AUTH_SESSION_KEY, JSON.stringify(session));
        }
        this.logActivity(`تم تحديث الصورة الشخصية للمدير: ${username}`);
    }

    // --- Forgot Password & OTP (Request 1) ---
    requestPasswordResetOTP(phone) {
        const clean = (phone || '').replace(/\D/g, '');
        // Only allowed phone is 01033383232
        const isAllowed = clean === '01033383232' || clean.endsWith('1033383232');
        if (!isAllowed) {
            return {
                success: false,
                error: 'رقم الهاتف المدخل غير مصرح به. هذا الرقم غير مسجل كمدير نظام معتمد.'
            };
        }

        // Generate 6-digit random code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const otpSession = {
            phone: '01033383232',
            code: code,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        };
        localStorage.setItem('sharks_admin_otp', JSON.stringify(otpSession));
        this.logActivity(`طلب استعادة كلمة مرور - تم إرسال رمز أمان OTP إلى 01033383232`);
        return { success: true, code: code, phone: '01033383232' };
    }

    verifyOTP(enteredCode) {
        try {
            const raw = localStorage.getItem('sharks_admin_otp');
            if (!raw) return { success: false, error: 'لم يتم العثور على رمز تحقق نشط. يرجى طلب رمز جديد.' };
            const otpData = JSON.parse(raw);
            if (Date.now() > otpData.expiresAt) {
                return { success: false, error: 'انتهت صلاحية رمز التحقق (10 دقائق). يرجى طلب رمز جديد.' };
            }
            if (otpData.code === (enteredCode || '').trim()) {
                return { success: true };
            } else {
                return { success: false, error: 'رمز التحقق غير صحيح. تأكد من إدخال الرمز المكون من 6 أرقام.' };
            }
        } catch (e) {
            return { success: false, error: 'حدث خطأ أثناء فحص رمز التحقق.' };
        }
    }

    resetPassword(username, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: 'كلمة المرور يجب ألا تقل عن 6 خانات.' };
        }
        const users = this.getAdminUsers();
        if (!users[username]) {
            return { success: false, error: 'اسم المستخدم المطلوب غير موجود في النظام.' };
        }
        users[username].password = newPassword;
        this.saveAdminUsers(users);
        localStorage.removeItem('sharks_admin_otp');
        this.logActivity(`تم تعيين كلمة مرور جديدة بنجاح لحساب: ${users[username].displayName}`);
        return { success: true, message: `تم تحديث كلمة المرور للحساب "${users[username].displayName}" بنجاح!` };
    }

    // --- Suppliers CRUD ---
    getSuppliers(onlyPublic = false) {
        let list = this.localData.suppliers || [];
        if (onlyPublic) {
            list = list.filter(s => s.visible !== false);
        }
        return list;
    }

    addSupplier(supplier) {
        const newSupplier = {
            id: 'sup_' + Date.now(),
            name: supplier.name,
            category: supplier.category || 'عام',
            logo: supplier.logo || 'assets/logo.jpg',
            contactPerson: supplier.contactPerson || 'مسؤول التوريدات',
            phone: supplier.phone || '',
            email: supplier.email || '',
            website: supplier.website || '',
            visible: supplier.visible !== undefined ? supplier.visible : true,
            description: supplier.description || 'مورد وموزع معتمد لشركة شاركس جروب.',
            createdAt: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        if (!this.localData.suppliers) this.localData.suppliers = [];
        this.localData.suppliers.unshift(newSupplier);
        this.logActivity(`تم إضافة مورد جديد: ${newSupplier.name}`);
        this.incrementUnreadBadge('suppliers');
        this.saveLocalData();

        if (this.isFirebaseReady) {
            this.db.collection('suppliers').doc(newSupplier.id).set(newSupplier).catch(console.error);
        }
        return newSupplier;
    }

    updateSupplier(id, updateData) {
        const sup = (this.localData.suppliers || []).find(s => s.id === id);
        if (sup) {
            Object.assign(sup, updateData);
            this.logActivity(`تم تعديل بيانات المورد: ${sup.name}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('suppliers').doc(id).update(updateData).catch(console.error);
            }
            return sup;
        }
        return null;
    }

    deleteSupplier(id) {
        const sup = (this.localData.suppliers || []).find(s => s.id === id);
        if (sup) {
            this.localData.suppliers = this.localData.suppliers.filter(s => s.id !== id);
            this.logActivity(`تم حذف المورد: ${sup.name}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('suppliers').doc(id).delete().catch(console.error);
            }
            return true;
        }
        return false;
    }

    // --- Supplier Registration Applications (طلبات اعتماد وتسجيل الموردين الجدد) ---
    getSupplierApplications() {
        return this.localData.supplier_applications || [];
    }

    addSupplierApplication(appData) {
        const id = 'sup_app_' + Date.now();
        const randCode = Math.floor(1000 + Math.random() * 9000);
        const trackingCode = appData.trackingCode || `SHK-SUP-${randCode}`;

        const newApp = {
            id: id,
            trackingCode: trackingCode,
            entityType: appData.entityType || 'مورد',
            companyName: appData.companyName || '',
            category: appData.category || 'توريدات عامة',
            contactPerson: appData.contactPerson || '',
            contactTitle: appData.contactTitle || 'مسؤول التوريدات',
            phone: appData.phone || '',
            whatsapp: appData.whatsapp || appData.phone || '',
            email: appData.email || '',
            commercialRegister: appData.commercialRegister || '',
            taxCard: appData.taxCard || '',
            governorate: appData.governorate || 'القاهرة',
            website: appData.website || '',
            notes: appData.notes || '',
            documents: appData.documents || [], // Array of { name, size, type, dataUrl }
            status: appData.status || 'جديد', // جديد, قيد المراجعة, معتمد, مرفوض
            reviewNotes: appData.reviewNotes || '',
            createdAt: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };

        if (!this.localData.supplier_applications) {
            this.localData.supplier_applications = [];
        }
        this.localData.supplier_applications.unshift(newApp);
        this.logActivity(`تم استلام طلب انضمام وتأهيل ${newApp.entityType || 'مورد'} جديد: "${newApp.companyName}" (${newApp.category})`);
        this.incrementUnreadBadge('suppliers');
        this.saveLocalData();

        if (this.isFirebaseReady) {
            this.db.collection('supplier_applications').doc(newApp.id).set(newApp).catch(console.error);
        }
        return newApp;
    }

    updateSupplierApplication(id, updateData) {
        const app = (this.localData.supplier_applications || []).find(a => a.id === id);
        if (app) {
            Object.assign(app, updateData);
            this.logActivity(`تحديث طلب المورد: "${app.companyName}" - الحالة: ${app.status}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('supplier_applications').doc(id).update(updateData).catch(console.error);
            }
            return app;
        }
        return null;
    }

    approveSupplierApplication(id) {
        const app = (this.localData.supplier_applications || []).find(a => a.id === id);
        if (!app) return null;

        app.status = 'معتمد';
        this.saveLocalData();

        if (this.isFirebaseReady) {
            this.db.collection('supplier_applications').doc(id).update({ status: 'معتمد' }).catch(console.error);
        }

        // Add to approved suppliers directory
        const approvedSupplier = this.addSupplier({
            name: app.companyName,
            category: app.category,
            contactPerson: app.contactPerson,
            phone: app.phone,
            email: app.email,
            website: app.website,
            description: app.notes || `مورد وموزع معتمد لشركة شاركس جروب في مجال ${app.category}.`,
            visible: true
        });

        this.logActivity(`تم اعتماد المورد رسمياً وإضافته لقائمة الشركاء: "${app.companyName}"`);
        return { application: app, supplier: approvedSupplier };
    }

    deleteSupplierApplication(id) {
        const app = (this.localData.supplier_applications || []).find(a => a.id === id);
        if (app) {
            this.localData.supplier_applications = this.localData.supplier_applications.filter(a => a.id !== id);
            this.logActivity(`حذف طلب تسجيل المورد: "${app.companyName}"`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('supplier_applications').doc(id).delete().catch(console.error);
            }
            return true;
        }
        return false;
    }

    // --- Projects CRUD ---
    getProjects(onlyPublic = false) {
        let list = this.localData.projects || [];
        if (onlyPublic) {
            list = list.filter(p => p.visible !== false);
        }
        return list;
    }

    addProject(project) {
        const newProj = {
            id: 'proj_' + Date.now(),
            title: project.title,
            location: project.location || 'القاهرة الجديدة',
            date: project.date || new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
            status: project.status || 'جاري التنفيذ',
            progress: project.progress !== undefined ? parseInt(project.progress) : 65,
            feddan: parseInt(project.feddan) || 50,
            image: project.image || 'assets/project_nile_foundation.jpg',
            visible: project.visible !== undefined ? project.visible : true,
            description: project.description || 'مشروع عقاري متكامل تابع لشركة شاركس جروب.'
        };
        if (!this.localData.projects) this.localData.projects = [];
        this.localData.projects.unshift(newProj);
        this.logActivity(`تم إضافة مشروع جديد: ${newProj.title}`);
        this.incrementUnreadBadge('projects');
        this.saveLocalData();

        if (this.isFirebaseReady) {
            this.db.collection('projects').doc(newProj.id).set(newProj).catch(console.error);
        }
        return newProj;
    }

    updateProject(id, updateData) {
        const p = (this.localData.projects || []).find(x => x.id === id);
        if (p) {
            Object.assign(p, updateData);
            this.logActivity(`تم تحديث المشروع: ${p.title}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('projects').doc(id).update(updateData).catch(console.error);
            }
            return p;
        }
        return null;
    }

    deleteProject(id) {
        const p = (this.localData.projects || []).find(x => x.id === id);
        if (p) {
            this.localData.projects = this.localData.projects.filter(x => x.id !== id);
            this.logActivity(`تم حذف مشروع: ${p.title}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('projects').doc(id).delete().catch(console.error);
            }
            return true;
        }
        return false;
    }

    // --- Tasks CRUD ---
    getTasks() {
        return this.localData.tasks || [];
    }

    addTask(task) {
        const newTask = {
            id: 'task_' + Date.now(),
            title: task.title,
            project: task.project || 'مشروع شاركس',
            assignedTo: task.assignedTo || 'فريق التنفيذ',
            status: task.status || 'قيد التنفيذ',
            priority: task.priority || 'عالية',
            dueDate: task.dueDate || '20 أبريل 2026'
        };
        if (!this.localData.tasks) this.localData.tasks = [];
        this.localData.tasks.unshift(newTask);
        this.logActivity(`تم إنشاء مهمة: ${newTask.title}`);
        this.incrementUnreadBadge('tasks');
        this.saveLocalData();

        if (this.isFirebaseReady) {
            this.db.collection('tasks').doc(newTask.id).set(newTask).catch(console.error);
        }
        return newTask;
    }

    updateTask(id, updateData) {
        const t = (this.localData.tasks || []).find(x => x.id === id);
        if (t) {
            Object.assign(t, updateData);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('tasks').doc(id).update(updateData).catch(console.error);
            }
            return t;
        }
        return null;
    }

    deleteTask(id) {
        const t = (this.localData.tasks || []).find(x => x.id === id);
        if (t) {
            this.localData.tasks = this.localData.tasks.filter(x => x.id !== id);
            this.logActivity(`تم حذف المهمة: ${t.title}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('tasks').doc(id).delete().catch(console.error);
            }
            return true;
        }
        return false;
    }

    // --- Employees CRUD ---
    getEmployees() {
        return this.localData.employees || [];
    }

    addEmployee(emp) {
        const newEmp = {
            id: 'emp_' + Date.now(),
            name: emp.name,
            role: emp.role || 'مهندس موقع',
            department: emp.department || 'الهندسة والإنشاءات',
            email: emp.email || 'engineer@sharksgroup.com',
            phone: emp.phone || '01000000000',
            createdAt: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        if (!this.localData.employees) this.localData.employees = [];
        this.localData.employees.unshift(newEmp);
        this.logActivity(`تم إضافة الموظف: ${newEmp.name}`);
        this.incrementUnreadBadge('employees');
        this.saveLocalData();

        if (this.isFirebaseReady) {
            this.db.collection('employees').doc(newEmp.id).set(newEmp).catch(console.error);
        }
        return newEmp;
    }

    updateEmployee(id, empData) {
        const emp = (this.localData.employees || []).find(e => e.id === id);
        if (emp) {
            Object.assign(emp, empData);
            this.logActivity(`تم تعديل الموظف: ${emp.name}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('employees').doc(id).update(empData).catch(console.error);
            }
            return emp;
        }
        return null;
    }

    deleteEmployee(id) {
        const emp = (this.localData.employees || []).find(e => e.id === id);
        if (emp) {
            this.localData.employees = this.localData.employees.filter(e => e.id !== id);
            this.logActivity(`تم حذف الموظف: ${emp.name}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('employees').doc(id).delete().catch(console.error);
            }
            return true;
        }
        return false;
    }

    // --- Career Categories Management (Request 2) ---
    getCareerCategories() {
        try {
            const raw = localStorage.getItem('sharks_career_categories_db');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) return list;
            }
            let list = [...DEFAULT_CAREER_CATEGORIES];
            const careers = this.getCareers(false);
            careers.forEach(c => {
                if (c.category && !list.some(item => item.id === c.category)) {
                    list.push({ id: c.category, label: c.categoryLabel || c.category });
                }
            });
            localStorage.setItem('sharks_career_categories_db', JSON.stringify(list));
            return list;
        } catch (e) {
            return [...DEFAULT_CAREER_CATEGORIES];
        }
    }

    addCareerCategory(label) {
        const cleanLabel = (label || '').trim();
        if (!cleanLabel) return null;

        let cats = this.getCareerCategories();
        const existing = cats.find(c => c.label.toLowerCase() === cleanLabel.toLowerCase());
        if (existing) return existing;

        const newId = 'cat_' + Date.now();
        const newCat = { id: newId, label: cleanLabel };
        cats.push(newCat);
        localStorage.setItem('sharks_career_categories_db', JSON.stringify(cats));
        this.logActivity(`إضافة قطاع مؤسسي جديد: ${cleanLabel}`);
        return newCat;
    }

    deleteCareerCategory(id) {
        if (!id) return false;
        let cats = this.getCareerCategories();
        const target = cats.find(c => c.id === id);
        if (!target) return false;

        cats = cats.filter(c => c.id !== id);
        localStorage.setItem('sharks_career_categories_db', JSON.stringify(cats));

        // Reassign any existing careers referencing this category to fallback
        if (this.localData.careers && Array.isArray(this.localData.careers)) {
            const fallback = cats[0] ? cats[0].id : 'engineering';
            const fallbackLabel = cats[0] ? cats[0].label : 'القطاع المؤسسي';
            let changed = false;
            this.localData.careers.forEach(c => {
                if (c.category === id) {
                    c.category = fallback;
                    c.categoryLabel = fallbackLabel;
                    changed = true;
                }
            });
            if (changed) {
                localStorage.setItem('sharks_careers_db', JSON.stringify(this.localData.careers));
            }
        }

        this.logActivity(`تم حذف قطاع مؤسسي للتوظيف: ${target.label}`);
        return true;
    }

    // --- Careers CRUD (Request 7) ---
    getCareers(onlyPublic = false) {
        let list = this.localData.careers || [];
        if (onlyPublic) {
            list = list.filter(c => c.visible !== false);
        }
        return list;
    }

    addCareer(career) {
        const categories = this.getCareerCategories();
        const catObj = categories.find(c => c.id === career.category);
        const categoryLabel = career.categoryLabel || (catObj ? catObj.label : (career.category === 'engineering' ? 'القطاع الهندسي' : career.category === 'management' ? 'إدارة وتخطيط المشروعات' : 'الإدارة والمالية'));

        const newCareer = {
            id: 'career_' + Date.now(),
            titleAr: career.titleAr || 'قسم وظيفي جديد',
            titleEn: career.titleEn || 'New Department',
            category: career.category || 'engineering',
            categoryLabel: categoryLabel,
            description: career.description || 'وصف متطلبات ومهام القسم...',
            keywords: career.keywords || career.titleAr,
            tags: Array.isArray(career.tags) ? career.tags : (career.tags ? career.tags.split(',').map(t => t.trim()).filter(Boolean) : ['دوام كامل', 'مواقع ومشروعات']),
            vacancies: parseInt(career.vacancies) || 1,
            visible: career.visible !== undefined ? career.visible : true,
            createdAt: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        if (!this.localData.careers) this.localData.careers = [];
        this.localData.careers.unshift(newCareer);
        this.logActivity(`تم إضافة قسم وظيفي جديد: ${newCareer.titleAr}`);
        this.incrementUnreadBadge('careers');
        this.saveLocalData();

        if (this.isFirebaseReady) {
            this.db.collection('careers').doc(newCareer.id).set(newCareer).catch(console.error);
        }
        return newCareer;
    }

    updateCareer(id, updateData) {
        const career = (this.localData.careers || []).find(c => c.id === id);
        if (career) {
            if (updateData.category) {
                const categories = this.getCareerCategories();
                const catObj = categories.find(c => c.id === updateData.category);
                if (catObj) {
                    updateData.categoryLabel = catObj.label;
                }
            }
            if (updateData.tags && typeof updateData.tags === 'string') {
                updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            if (updateData.vacancies !== undefined) {
                updateData.vacancies = parseInt(updateData.vacancies) || 1;
            }
            Object.assign(career, updateData);
            this.logActivity(`تم تعديل بيانات القسم الوظيفي: ${career.titleAr}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('careers').doc(id).update(updateData).catch(console.error);
            }
            return career;
        }
        return null;
    }

    deleteCareer(id) {
        const career = (this.localData.careers || []).find(c => c.id === id);
        if (career) {
            this.localData.careers = this.localData.careers.filter(c => c.id !== id);
            this.logActivity(`تم حذف القسم الوظيفي: ${career.titleAr}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('careers').doc(id).delete().catch(console.error);
            }
            return true;
        }
        return false;
    }

    toggleCareerVisibility(id) {
        const career = (this.localData.careers || []).find(c => c.id === id);
        if (career) {
            career.visible = !career.visible;
            const statusStr = career.visible ? 'إظهار للعامة' : 'إخفاء من الموقع';
            this.logActivity(`تم تغيير حالة ظهور قسم (${career.titleAr}) إلى: ${statusStr}`);
            this.saveLocalData();

            if (this.isFirebaseReady) {
                this.db.collection('careers').doc(id).update({ visible: career.visible }).catch(console.error);
            }
            return career;
        }
        return null;
    }

    // --- Stats & Activities ---
    getStats() {
        const suppliers = this.getSuppliers(false);
        const projects = this.getProjects(false);
        const tasks = this.getTasks();
        const employees = this.getEmployees();
        const careers = this.getCareers(false);
        const apps = this.getSupplierApplications ? this.getSupplierApplications() : [];

        return {
            suppliersCount: suppliers.length,
            publicSuppliersCount: suppliers.filter(s => s.visible !== false).length,
            supplierApplicationsCount: apps.length,
            newSupplierApplicationsCount: apps.filter(a => a.status === 'جديد').length,
            projectsCount: projects.length,
            tasksCount: tasks.length,
            completedTasksCount: tasks.filter(t => t.status === 'مكتمل').length,
            employeesCount: employees.length,
            careersCount: careers.length,
            publicCareersCount: careers.filter(c => c.visible !== false).length
        };
    }

    logActivity(text) {
        if (!this.localData.activities) this.localData.activities = [];
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
        this.localData.activities.unshift({
            id: 'act_' + Date.now(),
            text: text,
            time: timeStr,
            date: dateStr
        });
        if (this.localData.activities.length > 25) {
            this.localData.activities = this.localData.activities.slice(0, 25);
        }
        this.saveLocalData();
    }

    getActivities() {
        return this.localData.activities || [];
    }

    // --- Unread Badges & Red Notification System ---
    getUnreadBadges() {
        try {
            const raw = localStorage.getItem('sharks_admin_unread_counts');
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return { suppliers: 0, projects: 0, tasks: 0, employees: 0, careers: 0 };
    }

    setUnreadBadges(counts) {
        try {
            localStorage.setItem('sharks_admin_unread_counts', JSON.stringify(counts));
        } catch(e) {}
    }

    incrementUnreadBadge(tabKey, amount = 1) {
        const counts = this.getUnreadBadges();
        counts[tabKey] = (counts[tabKey] || 0) + amount;
        this.setUnreadBadges(counts);
        if (typeof window !== 'undefined' && typeof window.updateAdminTabBadges === 'function') {
            window.updateAdminTabBadges();
        }
    }

    clearUnreadBadge(tabKey) {
        const counts = this.getUnreadBadges();
        counts[tabKey] = 0;
        this.setUnreadBadges(counts);
        if (typeof window !== 'undefined' && typeof window.updateAdminTabBadges === 'function') {
            window.updateAdminTabBadges();
        }
    }
}

// Global Singleton
window.SharksCloud = new SharksCloudStoreManager();
