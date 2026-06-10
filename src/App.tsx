/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  School, 
  Users, 
  UserSquare2, 
  DollarSign, 
  BookOpen, 
  Settings, 
  LogOut, 
  Sparkles,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Megaphone,
  Printer,
  Calculator,
  Calendar, 
  ShieldCheck,
  HelpCircle
} from "lucide-react";

import { 
  UserRole, 
  SchoolLevel, 
  Student, 
  Teacher, 
  ClassRoom, 
  Subject, 
  CourseMaterial, 
  FinancialTransaction, 
  AuditLog, 
  SchoolConfig 
} from "./types";

import { 
  initialConfig, 
  mockStudents, 
  mockTeachers, 
  mockClasses, 
  mockSubjects, 
  mockCourseMaterials, 
  mockFinancialTransactions, 
  mockAuditLogs 
} from "./mockData";

// Import modular panels
import Dashboard from "./components/Dashboard";
import StudentModule from "./components/StudentModule";
import TeacherModule from "./components/TeacherModule";
import FinanceModule from "./components/FinanceModule";
import SchoolStructure from "./components/SchoolStructure";
import AdminPanel from "./components/AdminPanel";
import CourseSpace from "./components/CourseSpace";
import FAQModule from "./components/FAQModule"; // Import new module
import AISidebarPanel from "./components/AISidebarPanel"; // Import new sidebar AI module
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";

export default function App() {
  // Global States
  const [config, setConfig] = useState<SchoolConfig>(initialConfig);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [classes, setClasses] = useState<ClassRoom[]>(mockClasses);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [materials, setMaterials] = useState<CourseMaterial[]>(mockCourseMaterials);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockFinancialTransactions);
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs);

  // Authentication & session workspace state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("isDarkMode");
    return saved ? JSON.parse(saved) : false;
  });

  React.useEffect(() => {
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleLogin = (role: UserRole, name: string) => {
    setSimulatedRole(role);
    setLoggedInUser(name);
    setIsLoggedIn(true);

    if (role === UserRole.STUDENT || role === UserRole.PARENT) {
      setSelectedStudentId("std_3"); // DEFAULT TO ARIEL YAO CE2 PREVIEW
      setActiveTab("students");
    } else {
      setActiveTab("dashboard");
      setSelectedStudentId(null);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser("");
  };

  // Active Session & Multi-role simulator state
  const [simulatedRole, setSimulatedRole] = useState<UserRole>(UserRole.SUPER_ADMIN);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Multi-currency Congolese system preferences
  const [currency, setCurrency] = useState<"USD" | "CDF">("USD");
  const conversionRate = config.usdToFCRate || 2500;

  const handleToggleCurrency = () => {
    setCurrency(prev => prev === "USD" ? "CDF" : "USD");
  };

  // Quick helper to log events to our security audit logs
  const systemAuditLog = (action: string, role: UserRole) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_simulated",
      userName: `Utilisateur (${role})`,
      userRole: role,
      action: action,
      ipAddress: "192.168.12.204"
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // State Modifiers
  const handleUpdateConfig = (newConfig: SchoolConfig) => {
    setConfig(newConfig);
    systemAuditLog("Mise à jour des paramètres fondamentaux de l'école", simulatedRole);
  };

  const handleAddStudent = (newStudent: Omit<Student, "id">) => {
    const freshStudent: Student = {
      ...newStudent,
      id: `std_${Date.now()}`
    };
    setStudents(prev => [freshStudent, ...prev]);
    systemAuditLog(`Inscription scolaire du nouvel élève: ${newStudent.firstName} ${newStudent.lastName}`, simulatedRole);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setSelectedStudentId(updatedStudent.id);
    setActiveTab("students");
    systemAuditLog(`Mise à jour des bulletins/notes de ${updatedStudent.firstName} ${updatedStudent.lastName}`, simulatedRole);
  };

  const handleAddTeacher = (newTeacher: Omit<Teacher, "id">) => {
    const freshTeacher: Teacher = {
      ...newTeacher,
      id: `tch_${Date.now()}`
    };
    setTeachers(prev => [freshTeacher, ...prev]);
    systemAuditLog(`Recrutement officiel de l'enseignant ${newTeacher.firstName} ${newTeacher.lastName}`, simulatedRole);
  };

  const handleUploadMaterial = (newMaterial: Omit<CourseMaterial, "id">) => {
    const freshMat: CourseMaterial = {
      ...newMaterial,
      id: `mat_${Date.now()}`
    };
    setMaterials(prev => [freshMat, ...prev]);
    systemAuditLog(`Mise en ligne du support de cours: ${newMaterial.title}`, simulatedRole);
  };

  const handleAddTransaction = (newTx: Omit<FinancialTransaction, "id">) => {
    const freshTx: FinancialTransaction = {
      ...newTx,
      id: `tx_${Date.now()}`
    };
    setTransactions(prev => [freshTx, ...prev]);
    systemAuditLog(`Enregistrement d'une écriture comptable : ${newTx.description} (${newTx.amount} €)`, simulatedRole);
  };

  const handleReceiveStudentFee = (studentId: string, amount: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          paidFees: Math.min(s.totalFees, s.paidFees + amount)
        };
      }
      return s;
    }));
    systemAuditLog(`Perception versement scolarité d'un montant de ${amount} €`, simulatedRole);
  };

  const handleAddClass = (newClass: Omit<ClassRoom, "id" | "totalStudents">) => {
    const freshCls: ClassRoom = {
      ...newClass,
      id: `cls_${Date.now()}`,
      totalStudents: 0
    };
    setClasses(prev => [freshCls, ...prev]);
    systemAuditLog(`Création de la nouvelle salle/classe scolaire: ${newClass.name}`, simulatedRole);
  };

  const handleAddSubject = (newSubject: Omit<Subject, "id">) => {
    const freshSub: Subject = {
      ...newSubject,
      id: `sub_${Date.now()}`
    };
    setSubjects(prev => [freshSub, ...prev]);
    systemAuditLog(`Ajout de la discipline d'étude ${newSubject.name} au plan d'enseignement`, simulatedRole);
  };

  const handleClearLogs = () => {
    setLogs([]);
    systemAuditLog("Purge complète du journal d'audit de sécurité par le Super Admin", simulatedRole);
  };

  // Multi-Perspective Authorization Menu Filtering
  const getNavLinks = () => {
    const common = [
      { id: "dashboard", label: "Tableau de Bord", icon: School },
      { id: "courses", label: "Espace Cours/Leçons", icon: BookOpen },
    ];

    if (simulatedRole === UserRole.SUPER_ADMIN || simulatedRole === UserRole.ADMIN) {
      return [
        { id: "dashboard", label: "Tableau de Bord", icon: School },
        { id: "students", label: "Gestion Élèves", icon: Users },
        { id: "teachers", label: "Enseignants", icon: UserSquare2 },
        { id: "courses", label: "Espace Cours/Leçons", icon: BookOpen },
        { id: "finance", label: "Comptabilité Pro", icon: DollarSign },
        { id: "structure", label: "Structure & Matières", icon: Calendar },
        { id: "admin", label: "Paramètres ERP", icon: Settings },
      ];
    }

    if (simulatedRole === UserRole.TEACHER) {
      return [
        { id: "dashboard", label: "Tableau de Bord", icon: School },
        { id: "students", label: "Mes Élèves", icon: Users },
        { id: "teachers", label: "Espace Profs", icon: UserSquare2 },
        { id: "courses", label: "Espace Cours/Leçons", icon: BookOpen },
        { id: "structure", label: "Plan d'études", icon: Calendar },
      ];
    }

    if (simulatedRole === UserRole.STUDENT || simulatedRole === UserRole.PARENT) {
      return [
        { id: "students", label: "Mon Carnet Scolaire", icon: Users },
        { id: "courses", label: "Espace Cours/Leçons", icon: BookOpen },
        { id: "ai", label: "Assistant IA", icon: Sparkles },
        { id: "faq", label: "FAQ", icon: HelpCircle },
      ];
    }

    return common;
  };

  // Quick navigation helpers
  const handleDashboardNavigate = (tab: string) => {
    setActiveTab(tab);
    setSelectedStudentId(null);
  };

  const handleDashboardSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setActiveTab("students");
  };

  const handleRoleSimulationSwitch = (role: UserRole) => {
    setSimulatedRole(role);
    // Auto shift to appropriate tab
    if (role === UserRole.STUDENT || role === UserRole.PARENT) {
      setSelectedStudentId("std_3"); // Show CE2 Ariel student by default for beautiful preview
      setActiveTab("students");
    } else {
      setActiveTab("dashboard");
      setSelectedStudentId(null);
    }
    systemAuditLog(`Changement de perspective : Affichage comme ${role}`, role);
  };

  const handleLogoutSimulate = () => {
    handleRoleSimulationSwitch(UserRole.STUDENT);
  };

  if (!isLoggedIn) {
    if (authMode === "register") {
      return <RegisterPage onBack={() => setAuthMode("login")} onRegister={() => setAuthMode("login")} />;
    }
    return <LoginPage onLogin={handleLogin} onRegisterClick={() => setAuthMode("register")} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"} flex flex-col md:flex-row`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 transition-all duration-300 md:static fixed inset-y-0 left-0 z-40 transform ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Logo & Name */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/10">
                {config.logoText}
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight leading-tight uppercase">{config.schoolName}</h2>
                <span className="text-[10px] text-indigo-400 font-semibold">{config.academicYear}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Simulated Role Selector (Extremely helpful for product demo valuation!) */}
          <div className="p-4 bg-slate-950 border-b border-slate-850 space-y-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Sélecteur de Rôle Démo
            </span>
            <select 
              className="w-full bg-slate-900 border border-slate-800 text-xs p-2 rounded-lg text-indigo-300 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold"
              value={simulatedRole}
              onChange={e => handleRoleSimulationSwitch(e.target.value as UserRole)}
            >
              <option value={UserRole.SUPER_ADMIN}>👑 Super Admin (ERP complet)</option>
              <option value={UserRole.ADMIN}>🧑💼 Secrétaire / Admin</option>
              <option value={UserRole.TEACHER}>👨🏫 Professeur (Saisie notes)</option>
              <option value={UserRole.STUDENT}>🎓 Élève (Ariel - CE2)</option>
              <option value={UserRole.PARENT}>👨👩 Parent d'Élève</option>
            </select>
          </div>

          {/* Nav Links List */}
          <nav className="p-4 flex-1 space-y-1.5">
            {getNavLinks().map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id && !selectedStudentId;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setSelectedStudentId(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" 
                      : "text-slate-405 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-all ${isActive ? "scale-110" : "text-slate-450"}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Active Work Space Profile Info & Logout */}
          <div className="p-4 bg-slate-950 border-t border-slate-850 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 font-extrabold text-white flex items-center justify-center text-xs shadow shadow-indigo-500/15">
                {loggedInUser ? loggedInUser[0].toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[11px] text-slate-100 truncate">{loggedInUser || "Session Active"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-[9px] text-indigo-400 font-mono tracking-wide uppercase font-black">{simulatedRole} Pro Max</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-900/30 rounded-xl text-[10px] font-extrabold uppercase transition cursor-pointer active:scale-95 duration-100"
            >
              <LogOut className="w-3.5 h-3.5" /> Se déconnecter
            </button>
          </div>

          {/* Footer of Sidebar */}
          <div className="p-4 bg-slate-950 text-slate-400 text-[11px] border-t border-slate-850 space-y-2 leading-tight">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <p className="font-semibold text-[10px] text-slate-300">Serveur de Production Actif</p>
            </div>
            <p className="text-[10px] text-slate-500">{config.slogan}</p>
            <p className="text-[9px] text-slate-600 border-t border-slate-900 pt-1.5 font-mono">
              Copyright by "vitech africa (vab&idriss)"
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay Toggle */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
        ></div>
      )}

      {/* Primary Main Content Pane Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Banner Announcement Marquee (Scrolling Info) */}
        {config.activeAnnouncement && (
          <div className="bg-amber-500 text-slate-950 py-1.5 px-4 text-xs font-black shrink-0 relative flex items-center overflow-hidden border-b border-amber-600 font-mono">
            <div className="flex items-center gap-1.5 shrink-0 bg-amber-400 px-2 py-0.5 rounded uppercase text-[9px] font-black z-10 border border-amber-600 shadow-sm mr-2 animate-bounce">
              <Megaphone className="w-3 h-3" /> Information Flash
            </div>
            <div className="marquee-text inline-block whitespace-nowrap animate-marquee pr-8">
              {config.activeAnnouncement}
            </div>
          </div>
        )}

        {/* Global Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-600 p-1.5 hover:bg-slate-50 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1">
              {activeTab === "dashboard" && "Tableau de Bord Administratif"}
              {activeTab === "students" && (selectedStudentId ? "Dossier Médical & Scolaire" : "Répertoire d'Élèves")}
              {activeTab === "courses" && "Leçons & Cours par Espace Élève / Prof"}
              {activeTab === "teachers" && "Espace Personnel Enseignants"}
              {activeTab === "finance" && "Trésorerie & Comptabilité Double-Entrée"}
              {activeTab === "structure" && "Configuration des Matières & Classes"}
              {activeTab === "admin" && "Configurations Globales du Système"}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            { (simulatedRole === UserRole.SUPER_ADMIN || simulatedRole === UserRole.ADMIN) && 
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-bold text-emerald-700 uppercase">2FA ACTIF</span>
              </div>
            }
            <div className="text-right hidden sm:block">
              <p className="font-extrabold text-slate-850">Console {simulatedRole}</p>
              <p className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono rounded-full border">
              {simulatedRole[0]}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Tab Renders */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl w-full mx-auto pb-12">
          {activeTab === "dashboard" && (
            <Dashboard 
              students={students}
              teachers={teachers}
              classes={classes}
              transactions={transactions}
              logs={logs}
              onNavigate={handleDashboardNavigate}
              onSelectStudent={handleDashboardSelectStudent}
            />
          )}

          {activeTab === "students" && (
            <StudentModule 
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
              onClearSelection={() => setSelectedStudentId(null)}
              currency={currency}
              onToggleCurrency={handleToggleCurrency}
              conversionRate={conversionRate}
              loggedInUser={loggedInUser}
              simulatedRole={simulatedRole}
            />
          )}

          {activeTab === "teachers" && (
            <TeacherModule 
              teachers={teachers}
              materials={materials}
              classes={classes}
              onAddTeacher={handleAddTeacher}
              onUploadMaterial={handleUploadMaterial}
            />
          )}

          {activeTab === "courses" && (
            <CourseSpace 
              materials={materials}
              simulatedRole={simulatedRole}
              onUploadMaterial={handleUploadMaterial}
            />
          )}

          {activeTab === "ai" && (
            <AISidebarPanel />
          )}

          {activeTab === "faq" && (
            <FAQModule />
          )}

          {activeTab === "finance" && (
            <FinanceModule 
              transactions={transactions}
              students={students}
              onAddTransaction={handleAddTransaction}
              onReceiveStudentFee={handleReceiveStudentFee}
              currency={currency}
              onToggleCurrency={handleToggleCurrency}
              conversionRate={conversionRate}
            />
          )}

          {activeTab === "structure" && (
            <SchoolStructure 
              classes={classes}
              subjects={subjects}
              onAddClass={handleAddClass}
              onAddSubject={handleAddSubject}
            />
          )}

          {activeTab === "admin" && (
            <AdminPanel 
              config={config}
              onUpdateConfig={handleUpdateConfig}
              logs={logs}
              onClearLogs={handleClearLogs}
              students={students}
              setStudents={setStudents}
              teachers={teachers}
              setTeachers={setTeachers}
              classes={classes}
              setClasses={setClasses}
              subjects={subjects}
              setSubjects={setSubjects}
              transactions={transactions}
              setTransactions={setTransactions}
              systemAuditLog={systemAuditLog}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          )}
        </main>

        {/* Site-wide Footer */}
        <footer className="w-full py-4 px-6 border-t border-slate-200/55 text-center text-[11px] text-slate-400 bg-white/80 backdrop-blur-sm shrink-0 mt-auto print:hidden">
          <p className="font-semibold">
            Copyright by <span className="text-indigo-600 font-bold">"vitech africa (vab&idriss)"</span>
          </p>
        </footer>

      </div>

    </div>
  );
}
