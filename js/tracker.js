/**
 * Sharks Group Enterprise Suite
 * Clean Data Manager & Operations Store
 */

class SharksTracker {
    constructor() {
        this.STORAGE_KEY = 'sharks_group_clean_suite_v2';
        this.data = this.loadData();
    }

    loadData() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.error("Error loading localStorage", e);
        }
        this.saveData(DEFAULT_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    saveData(dataToSave = null) {
        try {
            if (dataToSave) {
                this.data = dataToSave;
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error("Error saving to localStorage", e);
        }
    }

    resetToDefault() {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.saveData();
    }

    logActivity(text) {
        if (!this.data.activities) this.data.activities = [];
        this.data.activities.unshift({
            id: 'act_' + Date.now(),
            text: text,
            time: 'الآن'
        });
        if (this.data.activities.length > 10) {
            this.data.activities = this.data.activities.slice(0, 10);
        }
        this.saveData();
    }

    getStats() {
        const projectsCount = (this.data.projects || []).length;
        const tasksCount = (this.data.tasks || []).length;
        const employeesCount = (this.data.employees || []).length;
        const completedTasksCount = (this.data.tasks || []).filter(t => t.status === 'مكتمل').length;

        return {
            projectsCount,
            tasksCount,
            employeesCount,
            completedTasksCount
        };
    }

    // Projects
    getProjects() {
        return this.data.projects || [];
    }

    addProject(project) {
        const newProj = {
            id: 'proj_' + Date.now(),
            title: project.title,
            location: project.location || 'القاهرة الجديدة',
            date: project.date || new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
            status: project.status || 'جاري التنفيذ',
            feddan: parseInt(project.feddan) || 55,
            description: project.description || 'مشروع عقاري متكامل تابع لشركة شاركس جروب.'
        };
        this.data.projects.unshift(newProj);
        this.logActivity(`تم إضافة مشروع جديد: ${newProj.title}`);
        this.saveData();
        return newProj;
    }

    updateProject(id, updateData) {
        const p = this.data.projects.find(x => x.id === id);
        if (p) {
            Object.assign(p, updateData);
            this.saveData();
            return p;
        }
        return null;
    }

    deleteProject(id) {
        const p = this.data.projects.find(x => x.id === id);
        if (p) {
            this.data.projects = this.data.projects.filter(x => x.id !== id);
            this.logActivity(`تم حذف مشروع: ${p.title}`);
            this.saveData();
        }
    }

    // Employees
    getEmployees() {
        return this.data.employees || [];
    }

    addEmployee(emp) {
        const newEmp = {
            id: 'emp_' + Date.now(),
            name: emp.name,
            role: emp.role || 'موظف',
            department: emp.department || 'الهندسة المدنية',
            email: emp.email || 'user@sharksgroup.com',
            phone: emp.phone || '01000000000',
            createdAt: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        this.data.employees.unshift(newEmp);
        this.logActivity(`تم إضافة الموظف: ${newEmp.name}`);
        this.saveData();
        return newEmp;
    }

    updateEmployee(id, empData) {
        const index = this.data.employees.findIndex(e => e.id === id);
        if (index !== -1) {
            this.data.employees[index] = { ...this.data.employees[index], ...empData };
            this.logActivity(`تم تعديل بيانات الموظف: ${this.data.employees[index].name}`);
            this.saveData();
            return this.data.employees[index];
        }
        return null;
    }

    deleteEmployee(id) {
        const emp = this.data.employees.find(e => e.id === id);
        if (emp) {
            this.data.employees = this.data.employees.filter(e => e.id !== id);
            this.logActivity(`تم حذف الموظف: ${emp.name}`);
            this.saveData();
        }
    }

    // Tasks
    getTasks() {
        return this.data.tasks || [];
    }

    addTask(task) {
        const newTask = {
            id: 'task_' + Date.now(),
            title: task.title,
            project: task.project || 'كمبوند شاركس ريزيدنس',
            assignedTo: task.assignedTo || 'م. أحمد نبيل',
            status: task.status || 'قيد التنفيذ',
            priority: task.priority || 'عالية',
            dueDate: task.dueDate || '20 أبريل 2026'
        };
        this.data.tasks.unshift(newTask);
        this.logActivity(`تم إنشاء مهمة جديدة: ${newTask.title}`);
        this.saveData();
        return newTask;
    }

    updateTask(id, updateData) {
        const t = this.data.tasks.find(x => x.id === id);
        if (t) {
            Object.assign(t, updateData);
            this.saveData();
            return t;
        }
        return null;
    }

    deleteTask(id) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            this.data.tasks = this.data.tasks.filter(t => t.id !== id);
            this.logActivity(`تم حذف المهمة: ${task.title}`);
            this.saveData();
        }
    }
}

const tracker = new SharksTracker();
