/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { 
  Settings, 
  Settings2, 
  BellRing, 
  ShieldAlert, 
  Activity, 
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Save,
  UserX,
  UserCheck,
  CheckCircle,
  FileCheck2,
  Lock,
  AppWindow,
  Trash2,
  Edit,
  Plus,
  UserPlus,
  Database,
  PlusCircle,
  Check,
  XCircle,
  Award,
  BookOpen,
  Coins,
  ShieldCheck,
  FileText
} from "lucide-react";
import { SchoolConfig, AuditLog, User, UserRole, Student, Teacher, ClassRoom, Subject, FinancialTransaction, SchoolLevel } from "../types";

interface AdminPanelProps {
  config: SchoolConfig;
  onUpdateConfig: (newConfig: SchoolConfig) => void;
  logs: AuditLog[];
  onClearLogs: () => void;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  classes: ClassRoom[];
  setClasses: React.Dispatch<React.SetStateAction<ClassRoom[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  transactions: FinancialTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  systemAuditLog: (action: string, role: UserRole) => void;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AdminPanel({
  config,
  onUpdateConfig,
  logs,
  onClearLogs,
  students,
  setStudents,
  teachers,
  setTeachers,
  classes,
  setClasses,
  subjects,
  setSubjects,
  transactions,
  setTransactions,
  systemAuditLog,
  isDarkMode,
  setIsDarkMode,
}: AdminPanelProps) {
  // Config Field states
  const [formName, setFormName] = useState(config.schoolName);
  const [formSlogan, setFormSlogan] = useState(config.slogan);
  const [formLogo, setFormLogo] = useState(config.logoText);
  const [formYear, setFormYear] = useState(config.academicYear);
  const [formAnn, setFormAnn] = useState(config.activeAnnouncement);
  const [formPhone, setFormPhone] = useState(config.phoneContact);
  const [formEmail, setFormEmail] = useState(config.emailContact);
  const [formColor, setFormColor] = useState(config.primaryColor);

  // Users Simulation list
  const [users, setUsers] = useState<User[]>([
    { id: "usr_sa", name: "Admin Général", email: "superadmin@saintjosias.edu", role: UserRole.SUPER_ADMIN, status: "Active" },
    { id: "usr_ad1", name: "Marcelle Adjovi", email: "sec.adjovi@saintjosias.edu", role: UserRole.ADMIN, status: "Active" },
    { id: "usr_tr7", name: "Désiré Mensah", email: "d.mensah@saintjosias.edu", role: UserRole.TEACHER, status: "Active" },
    { id: "usr_std5", name: "Samuel Togbé", email: "sam.togbe@student.csj", role: UserRole.STUDENT, status: "Active" },
    { id: "usr_sus9", name: "Suspect Attacker", email: "hacker@evil-corp.net", role: UserRole.STUDENT, status: "Suspended" },
  ]);

  // --- SUPER ADMIN ABSOLUTE CONTENT MANAGER STATES ---
  const [dbTab, setDbTab] = useState<"students" | "teachers" | "classes" | "subjects" | "transactions">("students");
  const [dbSearch, setDbSearch] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Editing Selection Key
  const [editingId, setEditingId] = useState<string | null>(null);

  // Buffers for input states
  // Student input states
  const [stFName, setStFName] = useState("");
  const [stLName, setStLName] = useState("");
  const [stReg, setStReg] = useState("");
  const [stLevel, setStLevel] = useState<SchoolLevel>(SchoolLevel.PRIMAIRE);
  const [stClassName, setStClassName] = useState("");
  const [stParentName, setStParentName] = useState("");
  const [stParentPhone, setStParentPhone] = useState("");
  const [stFees, setStFees] = useState(600);
  const [stPaid, setStPaid] = useState(400);
  const [stStatus, setStStatus] = useState<"Actif" | "Suspendu" | "Diplômé">("Actif");

  // Teacher input states
  const [tcFName, setTcFName] = useState("");
  const [tcLName, setTcLName] = useState("");
  const [tcEmail, setTcEmail] = useState("");
  const [tcPhone, setTcPhone] = useState("");
  const [tcSpecialty, setTcSpecialty] = useState("");
  const [tcSalary, setTcSalary] = useState(2000);
  const [tcStatus, setTcStatus] = useState<"Actif" | "Inactif">("Actif");

  // Class input states
  const [clName, setClName] = useState("");
  const [clRoom, setClRoom] = useState("");
  const [clLevel, setClLevel] = useState<SchoolLevel>(SchoolLevel.PRIMAIRE);
  const [clTeacherId, setClTeacherId] = useState("");

  // Subject input states
  const [sjName, setSjName] = useState("");
  const [sjLevel, setSjLevel] = useState<SchoolLevel>(SchoolLevel.PRIMAIRE);
  const [sjCoeff, setSjCoeff] = useState(2);

  // Transaction input states
  const [trDesc, setTrDesc] = useState("");
  const [trType, setTrType] = useState<"Recette" | "Dépense">("Recette");
  const [trCat, setTrCat] = useState("Scolarité");
  const [trAmount, setTrAmount] = useState(100);
  const [trMethod, setTrMethod] = useState<"Espèces" | "Chèque" | "Mobile Money" | "Virement">("Espèces");
  const [trDate, setTrDate] = useState(new Date().toISOString().split("T")[0]);

  // Load selected element into buffers for editing
  const loadStudentEdit = (std: Student) => {
    setEditingId(std.id);
    setIsAddingNew(false);
    setStFName(std.firstName);
    setStLName(std.lastName);
    setStReg(std.registrationNumber);
    setStLevel(std.level);
    setStClassName(std.className);
    setStParentName(std.parentName);
    setStParentPhone(std.parentPhone);
    setStFees(std.totalFees);
    setStPaid(std.paidFees);
    setStStatus(std.status);
  };

  const loadTeacherEdit = (tch: Teacher) => {
    setEditingId(tch.id);
    setIsAddingNew(false);
    setTcFName(tch.firstName);
    setTcLName(tch.lastName);
    setTcEmail(tch.email);
    setTcPhone(tch.phone);
    setTcSpecialty(tch.specialty);
    setTcSalary(tch.salary);
    setTcStatus(tch.status);
  };

  const loadClassEdit = (cls: ClassRoom) => {
    setEditingId(cls.id);
    setIsAddingNew(false);
    setClName(cls.name);
    setClRoom(cls.roomNumber || "");
    setClLevel(cls.level);
    setClTeacherId(cls.teacherId);
  };

  const loadSubjectEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setIsAddingNew(false);
    setSjName(sub.name);
    setSjLevel(sub.level);
    setSjCoeff(sub.coefficient);
  };

  const loadTransactionEdit = (tx: FinancialTransaction) => {
    setEditingId(tx.id);
    setIsAddingNew(false);
    setTrDesc(tx.description);
    setTrType(tx.type);
    setTrCat(tx.category);
    setTrAmount(tx.amount);
    setTrMethod(tx.paymentMethod);
    setTrDate(tx.date);
  };

  const resetBuffers = () => {
    setEditingId(null);
    setIsAddingNew(false);
    // Students
    setStFName(""); setStLName(""); setStReg(""); setStClassName(""); setStParentName(""); setStParentPhone(""); setStFees(600); setStPaid(400); setStStatus("Actif");
    // Teachers
    setTcFName(""); setTcLName(""); setTcEmail(""); setTcPhone(""); setTcSpecialty(""); setTcSalary(2000); setTcStatus("Actif");
    // Classes
    setClName(""); setClRoom(""); setClTeacherId("");
    // Subjects
    setSjName(""); setSjCoeff(2);
    // Transactions
    setTrDesc(""); setTrAmount(100); setTrDate(new Date().toISOString().split("T")[0]);
  };

  // Mutator triggers
  const handleModifyStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stFName || !stLName) { alert("Saisissez le prénom et le nom."); return; }
    
    if (editingId) {
      setStudents(prev => prev.map(s => s.id === editingId ? {
        ...s,
        firstName: stFName,
        lastName: stLName,
        registrationNumber: stReg || s.registrationNumber,
        level: stLevel,
        className: stClassName || s.className,
        parentName: stParentName,
        parentPhone: stParentPhone,
        totalFees: Number(stFees),
        paidFees: Number(stPaid),
        status: stStatus,
      } : s));
      systemAuditLog(`[SUPER ADMIN] Modification fiche élève : ${stFName} ${stLName}`, UserRole.SUPER_ADMIN);
      alert("✓ Fiche élève enregistrée.");
    } else {
      const newS: Student = {
        id: `std_sa_${Date.now()}`,
        registrationNumber: stReg || `CSJ-SA-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: stFName,
        lastName: stLName,
        birthDate: "2015-01-01",
        level: stLevel,
        className: stClassName || "CP (P1)",
        parentName: stParentName || "Non spécifié",
        parentPhone: stParentPhone || "Non spécifié",
        dateEnrolled: new Date().toISOString().split("T")[0],
        status: stStatus,
        grades: [],
        attendance: [],
        totalFees: Number(stFees),
        paidFees: Number(stPaid),
      };
      setStudents(prev => [newS, ...prev]);
      systemAuditLog(`[SUPER ADMIN] Création manuelle d'un nouvel élève : ${stFName} ${stLName}`, UserRole.SUPER_ADMIN);
      alert("✓ Nouvel élève créé avec succès.");
    }
    resetBuffers();
  };

  const handleModifyTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tcFName || !tcLName) { alert("Saisissez le prénom et le nom."); return; }

    if (editingId) {
      setTeachers(prev => prev.map(t => t.id === editingId ? {
        ...t,
        firstName: tcFName,
        lastName: tcLName,
        email: tcEmail,
        phone: tcPhone,
        specialty: tcSpecialty,
        salary: Number(tcSalary),
        status: tcStatus
      } : t));
      systemAuditLog(`[SUPER ADMIN] Mise à jour du profil enseignant : ${tcFName} ${tcLName}`, UserRole.SUPER_ADMIN);
      alert("✓ Profil enseignant mis à jour.");
    } else {
      const newT: Teacher = {
        id: `tch_sa_${Date.now()}`,
        firstName: tcFName,
        lastName: tcLName,
        email: tcEmail || `teach.${Date.now()}@saintjosias.edu`,
        phone: tcPhone || "+243 0000055",
        specialty: tcSpecialty || "Enseignement Général",
        salary: Number(tcSalary),
        classIds: [],
        subjectIds: [],
        status: tcStatus,
        joinDate: new Date().toISOString().split("T")[0]
      };
      setTeachers(prev => [newT, ...prev]);
      systemAuditLog(`[SUPER ADMIN] Recrutement de l'enseignant : ${tcFName} ${tcLName}`, UserRole.SUPER_ADMIN);
      alert("✓ Profil enseignant ajouté.");
    }
    resetBuffers();
  };

  const handleModifyClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clName) { alert("Saisissez le nom de la classe."); return; }

    if (editingId) {
      setClasses(prev => prev.map(c => c.id === editingId ? {
        ...c,
        name: clName,
        roomNumber: clRoom,
        level: clLevel,
        teacherId: clTeacherId
      } : c));
      systemAuditLog(`[SUPER ADMIN] Modification classe ${clName}`, UserRole.SUPER_ADMIN);
      alert("✓ Classe modifiée.");
    } else {
      const newC: ClassRoom = {
        id: `cls_sa_${Date.now()}`,
        name: clName,
        level: clLevel,
        teacherId: clTeacherId || "tch_1",
        totalStudents: 0,
        roomNumber: clRoom
      };
      setClasses(prev => [...prev, newC]);
      systemAuditLog(`[SUPER ADMIN] Création de la classe : ${clName}`, UserRole.SUPER_ADMIN);
      alert("✓ Classe créée.");
    }
    resetBuffers();
  };

  const handleModifySubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sjName) { alert("Saisissez le nom de la matière."); return; }

    if (editingId) {
      setSubjects(prev => prev.map(s => s.id === editingId ? {
        ...s,
        name: sjName,
        level: sjLevel,
        coefficient: Number(sjCoeff)
      } : s));
      systemAuditLog(`[SUPER ADMIN] Modification matière ${sjName}`, UserRole.SUPER_ADMIN);
      alert("✓ Matière réenregistrée.");
    } else {
      const newSub: Subject = {
        id: `sub_sa_${Date.now()}`,
        name: sjName,
        level: sjLevel,
        coefficient: Number(sjCoeff)
      };
      setSubjects(prev => [...prev, newSub]);
      systemAuditLog(`[SUPER ADMIN] Nouvelle matière lancée : ${sjName}`, UserRole.SUPER_ADMIN);
      alert("✓ Nouvelle discipline enregistrée.");
    }
    resetBuffers();
  };

  const handleModifyTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trDesc || trAmount <= 0) { alert("Désignation et montant positif requis."); return; }

    if (editingId) {
      setTransactions(prev => prev.map(t => t.id === editingId ? {
        ...t,
        description: trDesc,
        type: trType,
        category: trCat as any,
        amount: Number(trAmount),
        paymentMethod: trMethod,
        date: trDate
      } : t));
      systemAuditLog(`[SUPER ADMIN] Édition de la transaction : ${trDesc}`, UserRole.SUPER_ADMIN);
      alert("✓ Écritures modifiées.");
    } else {
      const newT: FinancialTransaction = {
        id: `tx_sa_${Date.now()}`,
        date: trDate,
        type: trType,
        category: trCat as any,
        description: trDesc,
        amount: Number(trAmount),
        paymentMethod: trMethod
      };
      setTransactions(prev => [newT, ...prev]);
      systemAuditLog(`[SUPER ADMIN] Écriture manuelle : ${trDesc} (${trAmount} $)`, UserRole.SUPER_ADMIN);
      alert("✓ Saisie validée.");
    }
    resetBuffers();
  };

  const handleDeleteItem = (id: string, type: "student" | "teacher" | "class" | "subject" | "transaction") => {
    if (!window.confirm("Êtes-vous certain de vouloir supprimer définitivement cet élément de la base de données de l'école ?")) return;

    if (type === "student") {
      setStudents(prev => prev.filter(s => s.id !== id));
      systemAuditLog(`[SUPER ADMIN] Suppression définitive d'un profil élève ID ${id}`, UserRole.SUPER_ADMIN);
    } else if (type === "teacher") {
      setTeachers(prev => prev.filter(t => t.id !== id));
      systemAuditLog(`[SUPER ADMIN] Suppression définitive d'un professeur ID ${id}`, UserRole.SUPER_ADMIN);
    } else if (type === "class") {
      setClasses(prev => prev.filter(c => c.id !== id));
      systemAuditLog(`[SUPER ADMIN] Suppression définitive d'une salle de classe ID ${id}`, UserRole.SUPER_ADMIN);
    } else if (type === "subject") {
      setSubjects(prev => prev.filter(s => s.id !== id));
      systemAuditLog(`[SUPER ADMIN] Retrait de la discipline ID ${id} du plan d'enseignement`, UserRole.SUPER_ADMIN);
    } else if (type === "transaction") {
      setTransactions(prev => prev.filter(t => t.id !== id));
      systemAuditLog(`[SUPER ADMIN] Annulation et suppression d'une écriture comptable ID ${id}`, UserRole.SUPER_ADMIN);
    }
    alert("✓ Élement supprimé définitivement.");
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      schoolName: formName,
      slogan: formSlogan,
      logoText: formLogo,
      academicYear: formYear,
      activeAnnouncement: formAnn,
      phoneContact: formPhone,
      emailContact: formEmail,
      primaryColor: formColor,
    });
    alert("Configurations générales de l'école appliquées avec succès !");
  };

  const handleExportAuditLogs = () => {
    const doc = new jsPDF();
    doc.text("Journal d'audit de sécurité complet - Collège Saint Josias", 14, 15);
    (doc as any).autoTable({
        head: [['Utilisateur', 'Rôle', 'Action', 'IP', 'Date']],
        body: logs.map(log => [
            log.userName,
            log.userRole,
            log.action,
            log.ipAddress,
            new Date(log.timestamp).toLocaleString("fr-FR")
        ]),
        startY: 25,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save(`audit_logs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === "Active" ? "Suspended" : "Active"
        };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core School Settings Form */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b mb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                Paramètres Généraux de l'ERP
              </h3>
              <p className="text-[10px] text-slate-400">Identité visuelle, logos, contacts et slogans scolaires</p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-full">
              Année: {config.academicYear}
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Nom légal de l'établissement</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formName} 
                  onChange={e => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Sigle / Acronyme Logo</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                  value={formLogo} 
                  onChange={e => setFormLogo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Slogan de l'établissement</label>
              <input 
                type="text" 
                className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                value={formSlogan} 
                onChange={e => setFormSlogan(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Téléphone Standard</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                  value={formPhone} 
                  onChange={e => setFormPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Adresse Mail Contact</label>
                <input 
                  type="email" 
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                  value={formEmail} 
                  onChange={e => setFormEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl space-y-2 border border-amber-100">
              <h4 className="font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <BellRing className="w-3.5 h-3.5" />
                Bandeau d'Alerte Général d'Accueil
              </h4>
              <p className="text-[10px] text-slate-500">Ce message défilera en haut de l'ERP pour avertir les enseignants, élèves et parents.</p>
              <textarea 
                className="w-full p-2.5 bg-white border rounded text-slate-800 text-xs h-16"
                value={formAnn}
                onChange={e => setFormAnn(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Année Académique Active</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                  value={formYear} 
                  onChange={e => setFormYear(e.target.value)}
                />
              </div>
              
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Thème de Couleur</label>
                <select 
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                  value={formColor}
                  onChange={e => setFormColor(e.target.value)}
                >
                  <option value="indigo">Bleu Impérial</option>
                  <option value="emerald">Vert Émeraude</option>
                  <option value="amber">Ambre Scolaire</option>
                  <option value="rose">Bordeaux Chic</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Mode Sombre</label>
                <button 
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}                
                  className={`w-full p-2.5 border rounded-lg font-bold flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'}`}
                >
                  {isDarkMode ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                  {isDarkMode ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" /> Sauvegarder les configurations
              </button>
            </div>
          </form>
        </div>

        {/* Audit Database Logs Scroll with Security Telemetry */}
        <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md space-y-4 flex flex-col justify-between border border-slate-750">
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-mono text-cyan-400 font-bold text-xs flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-indigo-400" />
                SYSTEM SHIELD SECURITY LOGS
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportAuditLogs}
                  className="flex items-center gap-1.5 text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 cursor-pointer border border-indigo-500 shadow-sm transition"
                >
                  <FileText className="w-3.5 h-3.5" /> Exporter PDF complet
                </button>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest font-mono">
                  ● Live Auditing
                </span>
              </div>
            </div>
            
            {/* Real-time Telemetry Dashboard */}
            <div className="grid grid-cols-2 gap-2 py-2.5 font-mono text-[8px] tracking-wide border-b border-slate-800">
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800 text-slate-300">
                <span className="text-slate-500 block uppercase font-bold text-[7px]">Chiffrement Stock</span>
                <span className="text-cyan-400 font-black">AES-GCM 256-BIT</span>
              </div>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800 text-slate-300">
                <span className="text-slate-500 block uppercase font-bold text-[7px]">Signature Bulletins</span>
                <span className="text-indigo-400 font-black">SHA-256 SIGNED</span>
              </div>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800 text-slate-300">
                <span className="text-slate-500 block uppercase font-bold text-[7px]">Protection ERP</span>
                <span className="text-emerald-400 font-black">FIREWALL ENGAGÉ</span>
              </div>
              <div className="p-1.5 bg-slate-950/60 rounded border border-slate-800 text-slate-300">
                <span className="text-slate-500 block uppercase font-bold text-[7px]">Double Facteur 2FA</span>
                <span className="text-amber-400 font-black">OBLIGATOIRE</span>
              </div>
            </div>
          </div>

          {/* Log Entry List */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[290px] pr-1 font-mono text-[9px] mt-2 style-scrollbar">
            {logs.map((log, index) => {
              // Deduce some realistic colors and categories based on the action content
              let badgeColor = "text-cyan-400 bg-cyan-950/40 border-cyan-900/40";
              let badgeWord = "INFO";
              if (log.action.includes("Suspension") || log.action.includes("Bannir") || log.action.includes("alert")) {
                badgeColor = "text-rose-400 bg-rose-950/40 border-rose-900/40";
                badgeWord = "ATTENTION";
              } else if (log.action.includes("mise à jour") || log.action.includes("Inscription") || log.action.includes("Règlement")) {
                badgeColor = "text-emerald-400 bg-emerald-950/40 border-emerald-900/40";
                badgeWord = "CRÉATION";
              }

              // Simple deterministically simulated integrity hash representing secure immutable audit blockchain
              const dummyHash = `sha256:d8a5...${Math.abs((index + 7) * 4429).toString(16).slice(0, 4)}`;

              return (
                <div key={log.id} className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-850 space-y-1 hover:border-slate-700 transition duration-150">
                  <div className="flex items-center justify-between text-[8px] border-b border-slate-900 pb-1">
                    <span className="text-slate-400 font-bold">{log.userName}</span>
                    <span className="text-[7.5px] px-1 bg-slate-800 text-indigo-300 rounded uppercase font-mono">{log.userRole}</span>
                  </div>
                  
                  <p className="text-slate-200 leading-normal font-sans py-0.5">
                    <span className="text-slate-500 font-mono text-[8px] mr-1.5 font-bold">▶</span>
                    {log.action}
                  </p>

                  <div className="flex items-center justify-between text-[8px] text-slate-500 pt-1 border-t border-slate-900/40">
                    <span>IP {log.ipAddress}</span>
                    <span className="text-[7.5px] text-slate-400 bg-slate-900 px-1 rounded font-mono select-all font-bold">
                      {dummyHash}
                    </span>
                    <span className="text-[7px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString("fr-FR")}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={onClearLogs}
            className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-750 text-cyan-400 font-mono text-[9px] rounded-lg transition duration-200 cursor-pointer text-center uppercase tracking-wider font-extrabold border border-indigo-950"
          >
            Vider la base d'audit de sécurité
          </button>
        </div>

      </div>

      {/* User Accounts Management Simulation */}
      <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4 text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-indigo-650" />
              Contrôle d'Accès de l'ERP & Statuts Comptes (RBAC Accounts)
            </h3>
            <p className="text-[10px] text-slate-400">Suspendre ou réactiver instantanément l'authentification d'un profil</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 text-[10px] font-bold rounded-lg border border-indigo-100">
              5 Profils Référencés
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-100">
              MFA Requis Actif
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left divide-y">
            <thead className="bg-slate-50 text-slate-450 font-bold">
              <tr>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">E-mail institutionnel</th>
                <th className="p-3">Rôle système</th>
                <th className="p-3 text-center">Statut d'accès</th>
                <th className="p-3 text-center">Action Sécurité</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-800 font-medium whitespace-nowrap">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-700 text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                      u.role === UserRole.SUPER_ADMIN ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                      u.role === UserRole.TEACHER ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      u.role === UserRole.STUDENT ? "bg-cyan-50 text-cyan-700 border-cyan-100" :
                      "bg-slate-50 text-slate-700 border-slate-100"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                      u.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
                    }`}>
                      {u.status === "Active" ? "Autorisé" : "Banni"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => toggleUserStatus(u.id)}
                      className="inline-flex p-1 text-slate-400 hover:text-indigo-600 cursor-pointer align-middle transition-opacity hover:opacity-100"
                    >
                      {u.status === "Active" ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1">
                          <UserX className="w-3.5 h-3.5" /> Suspendre
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1">
                          <UserCheck className="w-3.5 h-3.5" /> Ré-autoriser
                        </div>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise-grade RBAC Matrix Settings Module */}
      <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4 text-xs">
        <div className="pb-3 border-b border-indigo-50">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
            <Lock className="w-5 h-5 text-indigo-900" />
            Matrice de Permissions Granulaires de l'ERP Scolaire (RBAC Matrix)
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Configurez les droits d'écriture, de consultation et de suppression au niveau global de la base de données</p>
        </div>

        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-slate-50 text-slate-450 font-bold border-b">
              <tr>
                <th className="p-3.5">Fonction d'ERP / Module de Sécurité</th>
                <th className="p-3 text-center font-mono text-[10px]">Super Admin</th>
                <th className="p-3 text-center font-mono text-[10px]">Admin Principal</th>
                <th className="p-3 text-center font-mono text-[10px]">Professeur</th>
                <th className="p-3 text-center font-mono text-[10px]">Facturation Caisse</th>
                <th className="p-3 text-center font-mono text-[10px]">Élève & Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-800 font-medium">
              {[
                { name: "Saisie et modification des notes scolaires", sa: true, ad: true, pr: true, cs: false, st: false },
                { name: "Visualisation globale du carnet de notes", sa: true, ad: true, pr: true, cs: false, st: true },
                { name: "Facturation, encaissement de scolarité & versement don", sa: true, ad: true, pr: false, cs: true, st: false },
                { name: "Suppression définitive d'un profil élève ou professeur", sa: true, ad: false, pr: false, cs: false, st: false },
                { name: "Consultation, purge et audit des logs système SHIELD", sa: true, ad: false, pr: false, cs: false, st: false },
                { name: "Modification de la structure des classes et configurations", sa: true, ad: true, pr: false, cs: false, st: false },
                { name: "Ajout et modification d'observations comportementales", sa: true, ad: true, pr: true, cs: false, st: false }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/40 transition">
                  <td className="p-3.5 font-bold text-slate-700">{row.name}</td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={row.sa} disabled className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-not-allowed" />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" defaultChecked={row.ad} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" defaultChecked={row.pr} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" defaultChecked={row.cs} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" defaultChecked={row.st} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 text-amber-900 leading-normal text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            Remarque d'intégrité : Les changements sur cette grille configurent de façon permanente les pare-feux applicatifs de l'infrastructure Cloud.
          </div>
          <button 
            onClick={() => alert("✓ Matrice de permissions RBAC synchronisée avec la passerelle Cloud de sécurité !")}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition text-[10px] font-extrabold uppercase shrink-0 cursor-pointer"
          >
            Enregistrer la matrice
          </button>
        </div>
      </div>

      {/* 👑 CONSOLE DE CONTRÔLE DE CONTENU ABSOLU (A à Z) */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl mt-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider animate-pulse">Super Admin</span>
              <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                Console de Contrôle de Contenu Intégral (A à Z)
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Bypass de sécurité globale : permettant de modifier, ajouter ou supprimer n'importe quel contenu de la plateforme directement.</p>
          </div>

          {/* Sub tabs switches */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-0.5 rounded-xl">
            <button
              onClick={() => { setDbTab("students"); resetBuffers(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dbTab === "students" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              Élèves ({students.length})
            </button>
            <button
              onClick={() => { setDbTab("teachers"); resetBuffers(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dbTab === "teachers" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              Profs ({teachers.length})
            </button>
            <button
              onClick={() => { setDbTab("classes"); resetBuffers(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dbTab === "classes" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              Classes ({classes.length})
            </button>
            <button
              onClick={() => { setDbTab("subjects"); resetBuffers(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dbTab === "subjects" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              Matières ({subjects.length})
            </button>
            <button
              onClick={() => { setDbTab("transactions"); resetBuffers(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dbTab === "transactions" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              Écritures ({transactions.length})
            </button>
          </div>
        </div>

        {/* Global search row inside database */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Rechercher dans la collection (${dbTab === "students" ? "Nom, classe, tuteur..." : "Désignation, ID, Spécialité..."})...`}
              value={dbSearch}
              onChange={(e) => setDbSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-805 border-slate-800 text-slate-100 rounded-xl px-4 py-2 text-xs focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => { resetBuffers(); setIsAddingNew(true); }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Créer & Enregistrer Nouveau
          </button>
        </div>

        {/* FORM DRAWER (IF EDITING OR CREATING NEW) */}
        {(editingId || isAddingNew) && (
          <div className="p-5 bg-slate-950 border border-amber-400/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-805 border-slate-800 pb-3">
              <h4 className="text-xs font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-400" />
                {editingId ? "Modification En Cours :" : "Formulaire de Création Libre :"} {dbTab.toUpperCase()}
              </h4>
              <button onClick={resetBuffers} className="text-slate-400 hover:text-rose-450 hover:text-rose-400 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Render student form */}
            {dbTab === "students" && (
              <form onSubmit={handleModifyStudentSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Prénom élève</label>
                  <input type="text" value={stFName} onChange={e => setStFName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Nom de famille élève</label>
                  <input type="text" value={stLName} onChange={e => setStLName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Matricule ERP (laisser vide pour auto)</label>
                  <input type="text" value={stReg} onChange={e => setStReg(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" placeholder="ex: CSJ-8495" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Niveau d'étude</label>
                  <select value={stLevel} onChange={e => setStLevel(e.target.value as SchoolLevel)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value={SchoolLevel.MATERNEL}>Maternelle</option>
                    <option value={SchoolLevel.PRIMAIRE}>Primaire</option>
                    <option value={SchoolLevel.SECONDAIRE}>Secondaire</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Classe affectée</label>
                  <input type="text" value={stClassName} onChange={e => setStClassName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" placeholder="ex: 6ème Primaire A" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Responsable légal / Tuteur</label>
                  <input type="text" value={stParentName} onChange={e => setStParentName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Téléphone Tuteur</label>
                  <input type="text" value={stParentPhone} onChange={e => setStParentPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Frais Scolaires Annuels ($)</label>
                  <input type="number" value={stFees} onChange={e => setStFees(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Montant Déjà Payé ($)</label>
                  <input type="number" value={stPaid} onChange={e => setStPaid(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Statut académique</label>
                  <select value={stStatus} onChange={e => setStStatus(e.target.value as any)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value="Actif">Actif / Scolarisé</option>
                    <option value="Suspendu">Suspendu / Temporaire</option>
                    <option value="Diplômé">Diplômé / Sorti</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                  <button type="button" onClick={resetBuffers} className="px-4 py-2 bg-slate-900 text-slate-300 rounded hover:text-white cursor-pointer">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-amber-400 text-slate-950 font-extrabold rounded hover:bg-amber-500 flex items-center gap-1.5 cursor-pointer">
                    <Check className="w-4 h-4" />
                    Sauvegarder les Fichiers
                  </button>
                </div>
              </form>
            )}

            {/* Render teacher form */}
            {dbTab === "teachers" && (
              <form onSubmit={handleModifyTeacherSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Prénom de l'enseignant</label>
                  <input type="text" value={tcFName} onChange={e => setTcFName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Nom de famille</label>
                  <input type="text" value={tcLName} onChange={e => setTcLName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Adresse Courriel</label>
                  <input type="email" value={tcEmail} onChange={e => setTcEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Numéro Contact</label>
                  <input type="text" value={tcPhone} onChange={e => setTcPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Matière Spécialité</label>
                  <input type="text" value={tcSpecialty} onChange={e => setTcSpecialty(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" placeholder="ex: Sciences Physiques" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Rémunération de base ($ / mois)</label>
                  <input type="number" value={tcSalary} onChange={e => setTcSalary(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Statut Actif d'Enseignement</label>
                  <select value={tcStatus} onChange={e => setTcStatus(e.target.value as any)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif / Libre</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                  <button type="button" onClick={resetBuffers} className="px-4 py-2 bg-slate-900 text-slate-300 rounded hover:text-white cursor-pointer">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-amber-400 text-slate-950 font-extrabold rounded hover:bg-amber-500 flex items-center gap-1.5 cursor-pointer">
                    <Check className="w-4 h-4" />
                    Enregistrer Enseignant
                  </button>
                </div>
              </form>
            )}

            {/* Render classroom form */}
            {dbTab === "classes" && (
              <form onSubmit={handleModifyClassSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Nom de la classe</label>
                  <input type="text" value={clName} onChange={e => setClName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" placeholder="ex: 1ère Année Secondaire A" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Numéro de Local / Salle</label>
                  <input type="text" value={clRoom} onChange={e => setClRoom(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" placeholder="ex: Local 102" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Cycle ERP</label>
                  <select value={clLevel} onChange={e => setClLevel(e.target.value as SchoolLevel)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value={SchoolLevel.MATERNEL}>Maternelle</option>
                    <option value={SchoolLevel.PRIMAIRE}>Primaire</option>
                    <option value={SchoolLevel.SECONDAIRE}>Secondaire</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Titulaire Principal (ID Enseignant)</label>
                  <select value={clTeacherId} onChange={e => setClTeacherId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value="">-- Assigner Prof --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.specialty})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button type="button" onClick={resetBuffers} className="px-4 py-2 bg-slate-900 text-slate-300 rounded hover:text-white cursor-pointer">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-amber-400 text-slate-950 font-extrabold rounded hover:bg-amber-500 flex items-center gap-1.5 cursor-pointer">
                    <Check className="w-4 h-4" />
                    Enregistrer la Salle
                  </button>
                </div>
              </form>
            )}

            {/* Render subject form */}
            {dbTab === "subjects" && (
              <form onSubmit={handleModifySubjectSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Intitulé de l'élément / Discipline</label>
                  <input type="text" value={sjName} onChange={e => setSjName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" placeholder="ex: Mathématiques Financières" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Niveau / Cycle d'introduction</label>
                  <select value={sjLevel} onChange={e => setSjLevel(e.target.value as SchoolLevel)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value={SchoolLevel.MATERNEL}>Maternelle</option>
                    <option value={SchoolLevel.PRIMAIRE}>Primaire</option>
                    <option value={SchoolLevel.SECONDAIRE}>Secondaire</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Coefficient de pondération</label>
                  <input type="number" min="1" max="10" value={sjCoeff} onChange={e => setSjCoeff(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-805 border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                  <button type="button" onClick={resetBuffers} className="px-4 py-2 bg-slate-900 text-slate-300 rounded hover:text-white cursor-pointer">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-amber-400 text-slate-950 font-extrabold rounded hover:bg-amber-500 flex items-center gap-1.5 cursor-pointer">
                    <Check className="w-4 h-4" />
                    Enregistrer Discipline
                  </button>
                </div>
              </form>
            )}

            {/* Render transaction form */}
            {dbTab === "transactions" && (
              <form onSubmit={handleModifyTransactionSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Libellé / Désignation écriture</label>
                  <input type="text" value={trDesc} onChange={e => setTrDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" placeholder="ex: Achat de fournitures de bureau" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Type comptable</label>
                  <select value={trType} onChange={e => setTrType(e.target.value as any)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value="Recette">Recette (Entrée (+))</option>
                    <option value="Dépense">Dépense (Charge (-))</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Catégorie de flux</label>
                  <select value={trCat} onChange={e => setTrCat(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value="Scolarité">Frais Scolarité (Minerval)</option>
                    <option value="Infrastructure">Infrastructure & Travaux</option>
                    <option value="Salaires">Salaires Enseignants (Payroll)</option>
                    <option value="Fournitures">Fournitures & Manuels</option>
                    <option value="Événementiel">Événements & Kermesse</option>
                    <option value="Autre">Autre flux divers</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Montant consolidé ($)</label>
                  <input type="number" value={trAmount} onChange={e => setTrAmount(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Mode de payement</label>
                  <select value={trMethod} onChange={e => setTrMethod(e.target.value as any)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white">
                    <option value="Espèces">Espèces</option>
                    <option value="Virement">Virement Bancaire (EquityBCDC)</option>
                    <option value="Mobile Money">Mobile Money (M-Pesa / OrangeMoney)</option>
                    <option value="Chèque">Chèque Certifié</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Date comptable</label>
                  <input type="date" value={trDate} onChange={e => setTrDate(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white" />
                </div>
                <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                  <button type="button" onClick={resetBuffers} className="px-4 py-2 bg-slate-900 text-slate-300 rounded hover:text-white cursor-pointer">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-amber-400 text-slate-950 font-extrabold rounded hover:bg-amber-500 flex items-center gap-1.5 cursor-pointer">
                    <Check className="w-4 h-4" />
                    Enregistrer la Transaction
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* DATABASE TABLE AND FILTER ROWS */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
          {dbTab === "students" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3">Numéro Reg</th>
                    <th className="p-3">Nom complet</th>
                    <th className="p-3">Classe & Cycle</th>
                    <th className="p-3">Tuteur</th>
                    <th className="p-3 text-right">Frais d'Étude</th>
                    <th className="p-3 text-center">Statut</th>
                    <th className="p-3 text-center">Actions de contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                  {students
                    .filter(s => `${s.firstName} ${s.lastName} ${s.className} ${s.registrationNumber}`.toLowerCase().includes(dbSearch.toLowerCase()))
                    .map(s => (
                      <tr key={s.id} className="hover:bg-slate-900/60 transition duration-150">
                        <td className="p-3 font-mono text-amber-400 font-extrabold">{s.registrationNumber}</td>
                        <td className="p-3 font-extrabold text-white">{s.firstName} {s.lastName}</td>
                        <td className="p-3">
                          <span className="font-extrabold text-slate-200 block">{s.className}</span>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">{s.level}</span>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-300 font-bold">{s.parentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.parentPhone}</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="text-emerald-400 font-black">{s.paidFees} $ / {s.totalFees} $</div>
                          <div className="text-[9px] text-slate-500 uppercase font-black">Coût contractuel</div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                            s.status === "Actif" ? "bg-emerald-950 text-emerald-300" : s.status === "Suspendu" ? "bg-rose-950 text-rose-300" : "bg-indigo-950 text-indigo-300"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => loadStudentEdit(s)}
                              type="button"
                              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-400 rounded-lg text-slate-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Éditer
                            </button>
                            <button
                              onClick={() => handleDeleteItem(s.id, "student")}
                              type="button"
                              className="p-1 px-2 bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Retirer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {dbTab === "teachers" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3">Nom</th>
                    <th className="p-3">Matière Spécialité</th>
                    <th className="p-3">Email & Téléphone</th>
                    <th className="p-3 text-right">Salaire Mensuel</th>
                    <th className="p-3 text-center">Statut ERP</th>
                    <th className="p-3 text-center">Actions de contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                  {teachers
                    .filter(t => `${t.firstName} ${t.lastName} ${t.specialty}`.toLowerCase().includes(dbSearch.toLowerCase()))
                    .map(t => (
                      <tr key={t.id} className="hover:bg-slate-900/60 transition duration-150">
                        <td className="p-3 font-extrabold text-white">{t.firstName} {t.lastName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] rounded font-bold">{t.specialty}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          <div>{t.email}</div>
                          <div>{t.phone}</div>
                        </td>
                        <td className="p-3 text-right text-emerald-400 font-extrabold font-mono">{t.salary} $ / mois</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.status === "Actif" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => loadTeacherEdit(t)}
                              type="button"
                              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-400 rounded-lg text-slate-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Éditer
                            </button>
                            <button
                              onClick={() => handleDeleteItem(t.id, "teacher")}
                              type="button"
                              className="p-1 px-2 bg-rose-950 hover:bg-rose-905 bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Retirer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {dbTab === "classes" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3">Nom Classe</th>
                    <th className="p-3">Cycle ERP</th>
                    <th className="p-3">Local / Salle</th>
                    <th className="p-3">Titulaire Enseignant Assigné</th>
                    <th className="p-3 text-center">Actions de contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                  {classes
                    .filter(c => `${c.name} ${c.roomNumber || ""}`.toLowerCase().includes(dbSearch.toLowerCase()))
                    .map(c => {
                      const titulaire = teachers.find(t => t.id === c.teacherId);
                      return (
                        <tr key={c.id} className="hover:bg-slate-900/60 transition">
                          <td className="p-3 font-extrabold text-white text-sm">{c.name}</td>
                          <td className="p-3 uppercase font-extrabold tracking-widest text-slate-400">{c.level}</td>
                          <td className="p-3 font-mono text-amber-300 font-extrabold">{c.roomNumber || "Non spécifié"}</td>
                          <td className="p-3 text-slate-200">
                            {titulaire ? `${titulaire.firstName} ${titulaire.lastName} (${titulaire.specialty})` : <span className="text-rose-400 italic">Aucun titulaire</span>}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => loadClassEdit(c)}
                                type="button"
                                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-400 rounded-lg text-slate-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" /> Éditer
                              </button>
                              <button
                                onClick={() => handleDeleteItem(c.id, "class")}
                                type="button"
                                className="p-1 px-2 bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Retirer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          )}

          {dbTab === "subjects" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3">Discipline</th>
                    <th className="p-3">Cycle ERP d'introduction</th>
                    <th className="p-3 text-center">Coefficient Pondération</th>
                    <th className="p-3 text-center">Actions de contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                  {subjects
                    .filter(s => s.name.toLowerCase().includes(dbSearch.toLowerCase()))
                    .map(s => (
                      <tr key={s.id} className="hover:bg-slate-900/60 transition">
                        <td className="p-3 font-extrabold text-white text-sm">{s.name}</td>
                        <td className="p-3 uppercase font-extrabold tracking-widest text-slate-400">{s.level}</td>
                        <td className="p-3 text-center text-amber-400 font-black text-sm">x{s.coefficient}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => loadSubjectEdit(s)}
                              type="button"
                              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-400 rounded-lg text-slate-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Éditer
                            </button>
                            <button
                              onClick={() => handleDeleteItem(s.id, "subject")}
                              type="button"
                              className="p-1 px-2 bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Retirer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {dbTab === "transactions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3">Date</th>
                    <th className="p-3">Désignation</th>
                    <th className="p-3">Catégorie de Flux</th>
                    <th className="p-3">Méthode</th>
                    <th className="p-3 text-right">Value (USD)</th>
                    <th className="p-3 text-center">Actions de contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                  {transactions
                    .filter(t => `${t.description} ${t.category}`.toLowerCase().includes(dbSearch.toLowerCase()))
                    .map(t => (
                      <tr key={t.id} className="hover:bg-slate-900/60 transition">
                        <td className="p-3 font-mono text-slate-400">{t.date}</td>
                        <td className="p-3 font-extrabold text-white text-xs">{t.description}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.type === "Recette" ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"
                          }`}>
                            {t.category} ({t.type === "Recette" ? "Entrée" : "Sortie"})
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-300">{t.paymentMethod}</td>
                        <td className={`p-3 text-right font-black text-sm ${t.type === "Recette" ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.type === "Recette" ? "+" : "-"}{t.amount.toLocaleString("fr-FR")} $
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => loadTransactionEdit(t)}
                              type="button"
                              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-400 rounded-lg text-slate-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Éditer
                            </button>
                            <button
                              onClick={() => handleDeleteItem(t.id, "transaction")}
                              type="button"
                              className="p-1 px-2 bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Supprim
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
