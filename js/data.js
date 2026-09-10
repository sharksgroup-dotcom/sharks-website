/**
 * Sharks Group Enterprise Suite
 * Default Initial Database matching user's clean design
 */

const DEFAULT_DATA = {
    company: {
        name: "شاركس جروب",
        sub: "للمقاولات العامة والتطوير العقاري",
        currentUser: {
            name: "مهندس تكنولوجيا المعلومات",
            email: "it@sharksgroup.com",
            avatarChar: "ش"
        }
    },
    projects: [
        {
            id: "proj_1",
            title: "كمبوند شاركس ريزيدنس",
            location: "التجمع الخامس، القاهرة الجديدة",
            date: "15 يناير 2026",
            status: "جاري التنفيذ", // جاري التنفيذ, مكتمل, قيد التخطيط
            description: "مشروع سكني متكامل لشركة شاركس جروب يضم فيلات وعمارات سكنية ومناطق خدمية وتجارية متطورة بأحدث المعايير الهندسية."
        }
    ],
    employees: [
        {
            id: "emp_1",
            name: "م. أحمد نبيل",
            role: "مسؤول النظام",
            department: "تكنولوجيا المعلومات",
            email: "it@sharksgroup.com",
            phone: "01000000001",
            createdAt: "7 سبتمبر 2026"
        }
    ],
    tasks: [
        {
            id: "task_1",
            title: "مراجعة المخططات الإنشائية",
            project: "كمبوند شاركس ريزيدنس",
            assignedTo: "م. أحمد نبيل",
            status: "قيد التنفيذ", // قيد التنفيذ, مكتمل, قيد الانتظار
            priority: "عالية", // عالية, متوسطة, عادية
            dueDate: "20 أبريل 2026"
        }
    ],
    activities: [
        {
            id: "act_1",
            text: "تم إنشاء مهمة جديدة: مراجعة المخططات الإنشائية",
            time: "منذ 44 دقيقة"
        },
        {
            id: "act_2",
            text: "تم إضافة مشروع جديد: كمبوند شاركس ريزيدنس",
            time: "منذ 44 دقيقة"
        },
        {
            id: "act_3",
            text: "تم إضافة الموظف: م. أحمد نبيل",
            time: "منذ 44 دقيقة"
        }
    ]
};
