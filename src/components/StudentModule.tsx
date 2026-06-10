/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  UserPlus, 
  GraduationCap, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Printer, 
  ArrowLeft, 
  AlertCircle, 
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  Calculator,
  UserCheck,
  Check,
  Percent,
  Trash2,
  Clock
} from "lucide-react";
import { Student, SchoolLevel, UserRole } from "../types";
import { mockSubjects, initialConfig } from "../mockData";
import { formatCurrency, formatCurrencyCompact, formatByCurrency } from "../utils";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface StudentModuleProps {
  students: Student[];
  onAddStudent: (newStudent: Omit<Student, "id">) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  selectedStudentId: string | null;
  onSelectStudent?: (id: string | null) => void;
  onClearSelection: () => void;
  currency: "USD" | "CDF";
  onToggleCurrency: () => void;
  conversionRate: number;
  loggedInUser?: string;
  simulatedRole?: UserRole;
}

export default function StudentModule({
  students,
  onAddStudent,
  onUpdateStudent,
  selectedStudentId,
  onSelectStudent,
  onClearSelection,
  currency,
  onToggleCurrency,
  conversionRate,
  loggedInUser = "Administration / Professeur",
  simulatedRole,
}: StudentModuleProps) {
  // Navigation & UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [bulletinStudent, setBulletinStudent] = useState<Student | null>(null);

  const handleGeneratePDF = (student: Student) => {
    const doc = new jsPDF();
    doc.text(`Rapport Académique: ${student.firstName} ${student.lastName}`, 14, 20);
    
    (doc as any).autoTable({
      head: [['Matière', 'Coeff', 'Annuelle']],
      body: student.grades.map(g => [
        mockSubjects.find(s => s.id === g.subjectId)?.name || 'N/A',
        mockSubjects.find(s => s.id === g.subjectId)?.coefficient || 0,
        calculateOverallMoyenne(student)
      ]),
      startY: 30
    });
    
    doc.save(`Rapport_${student.firstName}.pdf`);
  };

  // Profile Tab toggles with log states
  const [activeProfileTab, setActiveProfileTab] = useState<"academic" | "gestion">("academic");
  const [formLogCategory, setFormLogCategory] = useState<"Comportement" | "Note Administrative" | "Absence" | "Sanction" | "Autre">("Comportement");
  const [formLogComment, setFormLogComment] = useState("");
  const [formLogAuthor, setFormLogAuthor] = useState(loggedInUser);
  const [formLogDate, setFormLogDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  // Synchronize formLogAuthor when loggedInUser prop changes
  React.useEffect(() => {
    setFormLogAuthor(loggedInUser);
  }, [loggedInUser]);

  // Accounting and payment donation states for Gestion tab
  const [paymentAmount, setPaymentAmount] = useState<any>(150);
  const [paymentTitle, setPaymentTitle] = useState<string>("Réglement Trimestre 3 & Soutien");
  const [paymentMethod, setPaymentMethod] = useState<string>("Mobile Money");
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [lastPaymentDetails, setLastPaymentDetails] = useState<any>(null);

  const handleAddPaymentDon = (e: React.FormEvent) => {
    e.preventDefault();
    const activeStudent = students.find(s => s.id === selectedStudentId);
    if (!activeStudent || !paymentAmount || Number(paymentAmount) <= 0) return;

    const amountNum = Number(paymentAmount);
    const newPaidFees = activeStudent.paidFees + amountNum;

    // Log this transaction into the student's unified logs
    const transactionLog = {
      id: `pay_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      category: "Note Administrative" as const,
      comment: `💰 [COMPTABILITÉ] Reçu de ${amountNum} $ (${paymentMethod}) transmis à la comptabilité de l'ERP pour : "${paymentTitle}". Règlement enregistré avec succès.`,
      author: loggedInUser || "Administration"
    };

    const updatedLogs = [...(activeStudent.behavioralLogs || []), transactionLog];

    onUpdateStudent({
      ...activeStudent,
      paidFees: newPaidFees,
      behavioralLogs: updatedLogs
    });

    // Save transaction receipt details
    setLastPaymentDetails({
      id: `REC-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      amount: amountNum,
      title: paymentTitle,
      method: paymentMethod,
      studentName: `${activeStudent.firstName} ${activeStudent.lastName}`,
      regNumber: activeStudent.registrationNumber,
      level: activeStudent.level,
      className: activeStudent.className,
      prevPaid: activeStudent.paidFees,
      newPaid: newPaidFees,
      totalFees: activeStudent.totalFees
    });

    setPaymentSuccess(true);
    setPaymentAmount(150);
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 4500);
  };

  const handleAddBehavioralLog = (e: React.FormEvent) => {
    e.preventDefault();
    const activeStudent = students.find(s => s.id === selectedStudentId);
    if (!activeStudent || !formLogComment.trim()) return;

    // Beautifully format selected formLogDate (e.g., DD/MM/YYYY à HH:mm)
    let formattedDate = "";
    if (formLogDate) {
      try {
        const d = new Date(formLogDate);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        formattedDate = `${day}/${month}/${year} à ${hours}:${minutes}`;
      } catch (err) {
        formattedDate = formLogDate;
      }
    } else {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      formattedDate = `${day}/${month}/${year} à ${hours}:${minutes}`;
    }

    const newLog = {
      id: `blog_${Date.now()}`,
      date: formattedDate,
      category: formLogCategory,
      comment: formLogComment,
      author: formLogAuthor.trim() || loggedInUser || "Administration"
    };

    const updatedLogs = [...(activeStudent.behavioralLogs || []), newLog];
    onUpdateStudent({
      ...activeStudent,
      behavioralLogs: updatedLogs
    });

    setFormLogComment("");
    // Reset date to current local timestamp
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setFormLogDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const handleDeleteBehavioralLog = (logId: string) => {
    const activeStudent = students.find(s => s.id === selectedStudentId);
    if (!activeStudent) return;
    const updatedLogs = (activeStudent.behavioralLogs || []).filter(log => log.id !== logId);
    onUpdateStudent({
      ...activeStudent,
      behavioralLogs: updatedLogs
    });
  };

  // New Student Form State
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formBirthDate, setFormBirthDate] = useState("2018-01-01");
  const [formLevel, setFormLevel] = useState<SchoolLevel>(SchoolLevel.PRIMAIRE);
  const [formClass, setFormClass] = useState("CE2 (P3)");
  const [formParentName, setFormParentName] = useState("");
  const [formParentPhone, setFormParentPhone] = useState("");
  const [formParentEmail, setFormParentEmail] = useState("");
  const [formTotalFees, setFormTotalFees] = useState(600);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = `${student.firstName} ${student.lastName} ${student.registrationNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "All" || student.level === levelFilter;
    const matchesStatus = statusFilter === "All" || student.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const activeStudent = students.find(s => s.id === selectedStudentId) || null;

  // React state synchronization for Conce (Gestion) textareas
  const [adminNotesText, setAdminNotesText] = useState("");
  const [statusCommentsText, setStatusCommentsText] = useState("");
  const [lastSyncedStudentId, setLastSyncedStudentId] = useState<string | null>(null);

  const [adminNotesSaved, setAdminNotesSaved] = useState(false);
  const [statusCommentsSaved, setStatusCommentsSaved] = useState(false);

  if (activeStudent && activeStudent.id !== lastSyncedStudentId) {
    setAdminNotesText(activeStudent.administrativeNotes || "");
    setStatusCommentsText(activeStudent.internalStatusComments || "");
    setLastSyncedStudentId(activeStudent.id);
  }

  const handleSaveAdminNotes = () => {
    if (!activeStudent) return;
    onUpdateStudent({
      ...activeStudent,
      administrativeNotes: adminNotesText
    });
    setAdminNotesSaved(true);
    setTimeout(() => setAdminNotesSaved(false), 3000);
  };

  const handleSaveStatusComments = () => {
    if (!activeStudent) return;
    onUpdateStudent({
      ...activeStudent,
      internalStatusComments: statusCommentsText
    });
    setStatusCommentsSaved(true);
    setTimeout(() => setStatusCommentsSaved(false), 3000);
  };

  // Grade Input states
  const [editingNotes, setEditingNotes] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [tempTermNotes, setTempTermNotes] = useState<string>("");

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formLastName || !formParentName || !formParentPhone) {
      alert("Veuillez remplir les champs obligatoires.");
      return;
    }

    const regYear = new Date().getFullYear();
    const randNum = Math.floor(100 + Math.random() * 900);
    const regNum = `CSJ-${regYear}-0${randNum}`;

    const newStudent: Omit<Student, "id"> = {
      registrationNumber: regNum,
      firstName: formFirstName,
      lastName: formLastName,
      birthDate: formBirthDate,
      level: formLevel,
      className: formClass,
      parentName: formParentName,
      parentPhone: formParentPhone,
      parentEmail: formParentEmail || undefined,
      dateEnrolled: new Date().toISOString().split('T')[0],
      status: "Actif",
      grades: mockSubjects
        .filter(sub => sub.level === formLevel)
        .map(sub => ({
          subjectId: sub.id,
          term1: [12, 14],
          term2: [13, 14],
          term3: [15],
        })),
      attendance: [
        { date: new Date().toISOString().split('T')[0], status: "Présent" }
      ],
      totalFees: Number(formTotalFees),
      paidFees: 0
    };

    onAddStudent(newStudent);
    setIsAddingUser(false);
    // Reset forms
    setFormFirstName("");
    setFormLastName("");
    setFormParentName("");
    setFormParentPhone("");
    setFormParentEmail("");
  };

  const handleUpdateNotes = () => {
    if (!activeStudent || !selectedSubjectId) return;

    const notesArray = tempTermNotes.split(",").map(n => Number(n.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 20);
    
    const updatedGrades = activeStudent.grades.map(g => {
      if (g.subjectId === selectedSubjectId) {
        return {
          ...g,
          term3: notesArray.length > 0 ? notesArray : g.term3
        };
      }
      return g;
    });

    onUpdateStudent({
      ...activeStudent,
      grades: updatedGrades
    });
    setEditingNotes(false);
    setSelectedSubjectId("");
    setTempTermNotes("");
  };

  // Helper calculation for beautiful interactive bulletin card
  const calculateSubjectAvg = (grades: number[]) => {
    if (!grades || grades.length === 0) return 10; // Default
    const sum = grades.reduce((acc, g) => acc + g, 0);
    return Math.round((sum / grades.length) * 100) / 100;
  };

  const calculateOverallMoyenne = (student: Student) => {
    const studentSubjects = mockSubjects.filter(sub => sub.level === student.level);
    let totalPoints = 0;
    let totalCoeffs = 0;

    studentSubjects.forEach(sub => {
      const studentGradeObj = student.grades.find(g => g.subjectId === sub.id);
      if (studentGradeObj) {
        // Average over T1, T2, T3
        const avg1 = calculateSubjectAvg(studentGradeObj.term1);
        const avg2 = calculateSubjectAvg(studentGradeObj.term2);
        const avg3 = calculateSubjectAvg(studentGradeObj.term3);
        const yearlySubjectAvg = (avg1 + avg2 + avg3) / 3;
        totalPoints += yearlySubjectAvg * sub.coefficient;
        totalCoeffs += sub.coefficient;
      }
    });

    return totalCoeffs > 0 ? Math.round((totalPoints / totalCoeffs) * 100) / 100 : 10;
  };

  const handleTriggerPrintSimulate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Pop-up Invoice Receipt Modal */}
      {lastPaymentDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 print:bg-white print:p-0">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-indigo-200 animate-in fade-in zoom-in duration-200 print:shadow-none print:border-none print:w-full">
            {/* Header Control (Invisible on print) */}
            <div className="bg-indigo-950 text-white p-4 flex items-center justify-between print:hidden">
              <span className="font-bold text-xs tracking-wider uppercase text-indigo-300 flex items-center gap-1.5 font-mono">
                ✨ FACTURE COMPTABLE GÉNÉRÉE (Vitech ERP)
              </span>
              <button 
                onClick={() => setLastPaymentDetails(null)}
                className="text-xs bg-indigo-900 rounded-lg px-2.5 py-1 text-slate-200 hover:text-white transition cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {/* Receipt Preview */}
            <div className="p-6 space-y-4 text-xs text-slate-700 print:p-0" id="bulletin-official-sheet">
              <div className="text-center border-b pb-3 border-slate-100 flex flex-col items-center">
                <div className="w-10 h-10 bg-indigo-900 text-white font-black text-sm flex items-center justify-center rounded-xl shadow mb-2">
                  CSJ
                </div>
                <h3 className="font-black text-sm text-indigo-950 tracking-wider uppercase">COLLÈGE SAINT JOSIAS</h3>
                <p className="text-[9px] text-slate-400">Kinshasa Gombe, République Démocratique du Congo</p>
                <p className="text-[8px] text-slate-400 font-mono mt-0.5">Cellule ERP de Facturation & Comptabilité</p>
                <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block print:border-none">
                  ✓ Transmis avec succès à la Comptabilité Générale
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[10px] print:bg-white print:border-none">
                <div>
                  <p className="text-slate-400">Reçu N° :</p>
                  <strong className="text-slate-800 font-black">{lastPaymentDetails.id}</strong>
                </div>
                <div>
                  <p className="text-slate-400">Date Opération :</p>
                  <strong className="text-slate-800">{lastPaymentDetails.date}</strong>
                </div>
                <div className="col-span-2 border-t pt-2 mt-1 border-slate-200/50">
                  <p className="text-slate-400">Élève :</p>
                  <strong className="text-slate-900 text-xs font-black uppercase">{lastPaymentDetails.studentName}</strong>
                </div>
                <div>
                  <p className="text-slate-400">Matricule :</p>
                  <strong className="text-slate-800">{lastPaymentDetails.regNumber}</strong>
                </div>
                <div>
                  <p className="text-slate-400">Classe / Niveau :</p>
                  <strong className="text-slate-800">{lastPaymentDetails.className} ({lastPaymentDetails.level})</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between font-bold text-slate-800 border-b pb-1.5 border-dashed border-slate-200">
                  <span>Nature du Paiement / Libellé de l'opération</span>
                  <span>Montant</span>
                </div>
                <div className="flex justify-between text-slate-700 py-1 font-semibold text-[11px]">
                  <span>{lastPaymentDetails.title}</span>
                  <span className="font-black text-slate-900 text-right">{formatByCurrency(lastPaymentDetails.amount, currency, conversionRate)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px] italic">
                  <span>Méthode de règlement :</span>
                  <span className="font-bold text-indigo-700">{lastPaymentDetails.method}</span>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-1.5 mt-3 print:bg-white print:border-slate-200">
                <p className="text-[10px] font-extrabold text-indigo-950 uppercase tracking-wider">État Écolage de l'élève après encaissement :</p>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Ancien montant réglé :</span>
                  <span>{formatByCurrency(lastPaymentDetails.prevPaid, currency, conversionRate)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-indigo-950 font-bold border-t border-indigo-100/50 pt-1">
                  <span>Nouveau total validé :</span>
                  <span className="text-emerald-700">{formatByCurrency(lastPaymentDetails.newPaid, currency, conversionRate)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-rose-700 font-extrabold">
                  <span>Solde restant à devoir :</span>
                  <span>{formatByCurrency(lastPaymentDetails.totalFees - lastPaymentDetails.newPaid, currency, conversionRate)}</span>
                </div>
              </div>

              {/* QR Code and verification on receipt */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 print:bg-white print:border-none">
                <div className="shrink-0 p-1 bg-white border border-slate-200 rounded-lg">
                  <QRCodeSVG 
                    value={`CSJ-INVOICE-${lastPaymentDetails.id}-${lastPaymentDetails.regNumber}`}
                    size={48}
                    level="Q"
                    fgColor="#1e1b4b"
                    className="w-12 h-12 block"
                  />
                </div>
                <div>
                  <p className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">AUTHENTIFICATION SECURE DE DON</p>
                  <p className="text-[8px] text-slate-400 mt-0.5 leading-relaxed">
                    Ce reçu certifie que les fonds ont été imputés de la scolarité de l'élève et reversés au compte trésorier de l'institution.
                  </p>
                </div>
              </div>

              {/* Certifying markings */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[9px] text-slate-400 font-mono">
                <div>
                  <p>Guichetier ERP : <span className="text-slate-700 font-semibold">{loggedInUser}</span></p>
                  <p>Fait à Kinshasa le {lastPaymentDetails.date}</p>
                </div>
                <div className="border-4 border-emerald-600/35 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-black tracking-widest text-[9px] transform rotate-3 select-none">
                  CAISSE CONCE VALIDÉ
                </div>
              </div>
            </div>

            {/* Actions (Invisible on print) */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 print:hidden">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Imprimer / Exporter le Reçu
              </button>
              <button
                onClick={() => setLastPaymentDetails(null)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 font-bold text-xs transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic PDF Report Bulletin Simulator Modal */}
      {bulletinStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 uppercase-none print:p-0 print:shadow-none print:border-none">
            
            {/* Bulletin Controls (Invisible on print) */}
            <div className="bg-slate-800 text-white p-4 flex items-center justify-between gap-4 print:hidden">
              <span className="font-bold text-xs tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Démonstrateur de Bulletin de Notes Automatique (Format Officiel)
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handleTriggerPrintSimulate}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer
                </button>
                <button 
                  onClick={() => handleGeneratePDF(bulletinStudent)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> Générer PDF
                </button>
                <button 
                  onClick={() => setBulletinStudent(null)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* Simulated Official Bulletin Sheet */}
            <div id="bulletin-official-sheet" className="p-8 md:p-12 space-y-6 text-slate-800 font-sans print:p-0">
              
              {/* Institutional Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b-2 border-slate-900 pb-4 gap-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-900 text-white font-black text-lg flex items-center justify-center rounded-xl shadow shrink-0">
                    CSJ
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black tracking-widest text-indigo-900">COLLÈGE SAINT JOSIAS</h4>
                    <p className="text-[9px] text-slate-500 max-w-xs">{initialConfig.slogan}<br />Kinshasa Gombe, République Démocratique du Congo<br />Tél: +243 89 123 4567 • RGC Kinshasa</p>
                  </div>
                </div>
                <div className="sm:text-right space-y-0.5 flex flex-col items-center sm:items-end">
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900">BULLETIN OFFICIEL DE NOTES</h2>
                  <p className="text-xs font-bold text-slate-500">Année Académique: <span className="text-indigo-900">{initialConfig.academicYear}</span></p>
                  <span className="inline-block px-3 py-0.5 bg-emerald-600 text-white text-[9px] uppercase tracking-wider font-extrabold rounded-full w-max">
                    Scolarité Validée (EPST)
                  </span>
                </div>
              </div>

              {/* Patient/Student Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-gradient-to-br from-slate-50 to-indigo-50/10 border border-slate-200 rounded-2xl relative overflow-hidden shadow-sm">
                
                {/* Visual Watermark */}
                <div className="absolute right-0 top-0 text-[60px] font-black text-slate-100/30 select-none pointer-events-none transform translate-x-4 -translate-y-4 font-mono">
                  CSJ
                </div>

                <div className="space-y-1.5 text-xs z-10">
                  <h5 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1 font-mono">Identité Scolaire</h5>
                  <p><span className="text-slate-400">Élève :</span> <strong className="text-slate-950 font-bold text-sm">{bulletinStudent.firstName} {bulletinStudent.lastName}</strong></p>
                  <p><span className="text-slate-400">Matricule :</span> <code className="font-mono font-bold bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">{bulletinStudent.registrationNumber}</code></p>
                  <p><span className="text-slate-400">Date de naissance :</span> {bulletinStudent.birthDate}</p>
                  <p><span className="text-slate-400">Niveau d'étude :</span> {bulletinStudent.level} ({bulletinStudent.className})</p>
                </div>

                <div className="space-y-1.5 text-xs md:border-l md:pl-5 border-slate-200 z-10">
                  <h5 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1 font-mono">Administration & Tutelle</h5>
                  <p><span className="text-slate-400">Tuteur Légal / Parent :</span> <strong>{bulletinStudent.parentName}</strong></p>
                  <p><span className="text-slate-400">Téléphone Parent :</span> {bulletinStudent.parentPhone}</p>
                  <p><span className="text-slate-400">Date d'inscription :</span> {bulletinStudent.dateEnrolled}</p>
                  <p><span className="text-slate-400">Statut Financier :</span> <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">À jour (CSJ-VALIDE)</span></p>
                </div>

                {/* Audit & QR Verification Panel in Pro Max styling */}
                <div className="space-y-1.5 text-xs md:border-l md:pl-5 border-slate-200 z-10 flex flex-col items-center md:items-start justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <h5 className="text-[9px] font-extrabold text-indigo-950 uppercase tracking-widest font-mono">AUTHENTIFICATION AUDIT PRO MAX</h5>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full">
                    {/* QR Code Graphic Frame */}
                    <div className="relative p-1.5 bg-white border border-indigo-950 rounded-xl shadow-sm shrink-0 group hover:scale-[1.02] transition-transform duration-300 print:shadow-none print:border-indigo-950">
                      {/* Corner crop marks for high-tech aesthetic */}
                      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-indigo-600 -translate-x-0.5 -translate-y-0.5"></span>
                      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-indigo-600 translate-x-0.5 -translate-y-0.5"></span>
                      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-indigo-600 -translate-x-0.5 translate-y-0.5"></span>
                      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-indigo-600 translate-x-0.5 translate-y-0.5"></span>
                      
                      <QRCodeSVG 
                        value={`CSJ-VERIFY-${bulletinStudent.registrationNumber}-${bulletinStudent.id}`}
                        size={64}
                        level="Q"
                        fgColor="#1e1b4b"
                        includeMargin={false}
                        className="w-16 h-16 object-contain block"
                      />
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-800 tracking-wide font-mono select-all">REF: CSJ-{bulletinStudent.registrationNumber}</p>
                      <p className="text-[7.5px] text-slate-400 leading-normal max-w-[150px]">
                        Scannez pour valider l'assiduité, les notes et le relevé d'écolage auprès de la cellule Vitech Africa (vab&idriss).
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto border border-slate-900 rounded-lg">
                <table className="w-full min-w-[650px] sm:min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white divide-x divide-slate-700">
                      <th className="py-2 px-3 font-bold">Matière</th>
                      <th className="py-2 px-3 text-center font-bold font-mono">Coeff.</th>
                      <th className="py-2 px-3 text-center font-bold">Trimestre 1</th>
                      <th className="py-2 px-3 text-center font-bold">Trimestre 2</th>
                      <th className="py-2 px-3 text-center font-bold">Trimestre 3</th>
                      <th className="py-2 px-3 text-center font-bold">Moyenne Annuelle</th>
                      <th className="py-2 px-3 min-w-36 font-semibold">Appréciations & Décision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {mockSubjects
                      .filter(sub => sub.level === bulletinStudent.level)
                      .map(sub => {
                        const gradeObj = bulletinStudent.grades.find(g => g.subjectId === sub.id);
                        const avg1 = gradeObj ? calculateSubjectAvg(gradeObj.term1) : 10;
                        const avg2 = gradeObj ? calculateSubjectAvg(gradeObj.term2) : 10;
                        const avg3 = gradeObj ? calculateSubjectAvg(gradeObj.term3) : 10;
                        const yearlyAvg = Math.round(((avg1 + avg2 + avg3) / 3) * 100) / 100;

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50 divide-x divide-slate-200">
                            <td className="py-2 px-3 font-extrabold text-slate-900">{sub.name}</td>
                            <td className="py-2 px-3 text-center font-mono font-semibold">{sub.coefficient}</td>
                            <td className="py-2 px-3 text-center text-slate-600">{avg1}</td>
                            <td className="py-2 px-3 text-center text-slate-600">{avg2}</td>
                            <td className="py-2 px-3 text-center text-indigo-700 font-bold">{avg3}</td>
                            <td className="py-2 px-3 text-center font-black bg-indigo-50/55">{yearlyAvg} / 20</td>
                            <td className="py-2 px-3 text-[10px] text-slate-500 italic">
                              {yearlyAvg >= 16 ? "Excellent travail, élève modèle." : 
                               yearlyAvg >= 13 ? "Bon trimestre, continuez ainsi." :
                               yearlyAvg >= 10 ? "Passable, redoublez d'efforts." : "Insuffisant, travail à revoir."}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* FACTURATION ET REÇUS SCOLARIRES (La Facture officielle) */}
              <div className="border border-slate-900 rounded-lg p-4 bg-slate-50/50 text-left">
                <h4 className="font-extrabold text-xs text-slate-950 uppercase border-b border-slate-900 pb-1.5 mb-2.5 flex justify-between">
                  <span>Reçu de Facturation Scolaire</span>
                  <span className="text-indigo-905 text-indigo-900 font-mono text-[10px]">N° FAC-{bulletinStudent.registrationNumber}</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Scolarité Annuelle:</span>
                    <strong className="text-slate-900">{formatByCurrency(bulletinStudent.totalFees, currency, conversionRate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Montant Réglé:</span>
                    <strong className="text-emerald-700">{formatByCurrency(bulletinStudent.paidFees, currency, conversionRate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Reste à Solder:</span>
                    <strong className="text-rose-700">{formatByCurrency(bulletinStudent.totalFees - bulletinStudent.paidFees, currency, conversionRate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Statut Règlement:</span>
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                      bulletinStudent.totalFees - bulletinStudent.paidFees <= 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {bulletinStudent.totalFees - bulletinStudent.paidFees <= 0 ? "Totalement Soldé" : "Reste à payer"}
                    </span>
                  </div>
                </div>
              </div>

              {/* REMARQUES DE CONCE ET GESTION SCOLAIRE */}
              <div className="border border-slate-900 rounded-lg p-4 text-left">
                <h4 className="font-extrabold text-xs text-slate-950 uppercase border-b border-slate-900 pb-1.5 mb-2">
                  Extraits de Gestion Disciplinaire & Conduite (Conce)
                </h4>
                <div className="space-y-1 text-xs">
                  {(bulletinStudent.behavioralLogs && bulletinStudent.behavioralLogs.length > 0) ? (
                    bulletinStudent.behavioralLogs.map((log) => (
                      <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-dashed border-slate-200 py-2 last:border-none">
                        <span className="break-words min-w-0 pr-2">
                          <strong className="text-indigo-950">[{log.category}]</strong> {log.comment}
                        </span>
                        <span className="text-slate-400 italic text-[10px] shrink-0">
                          Par {log.author} le {log.date}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-dashed border-slate-200 py-2 last:border-none">
                      <span>
                        <strong className="text-emerald-700">[Comportement]</strong> Aucun incident signalé. Élève calme, respectueux et assidu dans ses études.
                      </span>
                      <span className="text-slate-400 italic text-[10px] shrink-0">
                        Par Direction le {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Summary Scores, Signatures & Decision */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                
                {/* Synthetic Moyenne Card */}
                <div className="p-4 rounded-xl border-2 border-slate-900 flex flex-col justify-between space-y-2 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-indigo-700" /> Bilan Général
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-indigo-950">{calculateOverallMoyenne(bulletinStudent)} / 20</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Moyenne Générale Pondérée</p>
                  </div>
                  <div className="text-[10px] font-bold text-slate-700 bg-emerald-50 text-emerald-700 py-1 px-2.5 rounded w-max">
                    Statut: ADMIS AU NIVEAU SUPÉRIEUR
                  </div>
                </div>

                {/* Absences count */}
                <div className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2 text-left bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                     Absidités & Présences
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {bulletinStudent.attendance.filter(a => a.status === "Absent").length} heures
                    </h3>
                    <p className="text-[10px] text-slate-500">Total absences comptabilisées</p>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-semibold">Mention: Très bonne conduite générale</p>
                </div>

                {/* Official Certification signatures */}
                <div className="p-4 rounded-xl border border-dotted border-slate-400 bg-slate-50/40 text-[10px] space-y-4">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-center">Fait à Kinshasa Gombe, le {new Date().toLocaleDateString()}</p>
                  <div className="flex justify-between items-end h-16">
                    <div className="text-center font-bold">
                      <span className="underline block text-slate-600">Le Directeur</span>
                      <p className="mt-4 font-mono text-slate-400 text-[8px]">[Cachet Signature]</p>
                    </div>
                    <div className="text-center font-bold">
                      <span className="underline block text-slate-600">Prof. Principal</span>
                      <p className="mt-4 font-mono text-slate-400 text-[8px]">[Lu et approuvé]</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main UI Body Layout */}
      {isAddingUser ? (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              Inscrire un Nouvel Élève
            </h2>
            <button 
              onClick={() => setIsAddingUser(false)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded text-slate-600 cursor-pointer"
            >
              Annuler
            </button>
          </div>

          <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Nom de famille <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  value={formLastName} 
                  onChange={e => setFormLastName(e.target.value)}
                  placeholder="Ex: YAO"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Prénoms <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  value={formFirstName} 
                  onChange={e => setFormFirstName(e.target.value)}
                  placeholder="Ex: Koffi Marc"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Date de naissance</label>
                <input 
                  type="date" 
                  className="w-full p-2.5 border rounded-lg text-slate-850"
                  value={formBirthDate} 
                  onChange={e => setFormBirthDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Niveau Scolaire</label>
                <select 
                  className="w-full p-2.5 border rounded-lg text-slate-800"
                  value={formLevel}
                  onChange={e => setFormLevel(e.target.value as SchoolLevel)}
                >
                  <option value={SchoolLevel.MATERNEL}>Maternel</option>
                  <option value={SchoolLevel.PRIMAIRE}>Primaire</option>
                  <option value={SchoolLevel.SECONDAIRE}>Secondaire</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Classe Affectée</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg text-slate-800"
                  value={formClass} 
                  onChange={e => setFormClass(e.target.value)}
                  placeholder="Ex: CE2 (P3)"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-700">Responsable / Tuteur Légal</h3>
              
              <div className="space-y-2">
                <label className="font-semibold text-slate-600 block">Nom Complet du Parent <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg text-slate-800 bg-white"
                  value={formParentName} 
                  onChange={e => setFormParentName(e.target.value)}
                  placeholder="Ex: Jean Yao"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Téléphone Parent <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white"
                    value={formParentPhone} 
                    onChange={e => setFormParentPhone(e.target.value)}
                    placeholder="Ex: +225 05..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">E-mail Parent</label>
                  <input 
                    type="email" 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white"
                    value={formParentEmail} 
                    onChange={e => setFormParentEmail(e.target.value)}
                    placeholder="parent@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Frais Scolaires Totaux Annuels ($ / Dollar)</label>
              <input 
                type="number" 
                className="w-full p-2.5 border rounded-lg text-slate-800"
                value={formTotalFees} 
                onChange={e => setFormTotalFees(Number(e.target.value))}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button 
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
              >
                Valider l'inscription
              </button>
            </div>
          </form>
        </div>
      ) : activeStudent ? (
        <div className="student-detail-view space-y-6">
          {/* Back button */}
          <button 
            onClick={onClearSelection}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 cursor-pointer p-1"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à la liste d'élèves
          </button>

          {/* Student Profile Card Header */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
              {activeStudent.photoUrl ? (
                <img 
                  src={activeStudent.photoUrl} 
                  alt={activeStudent.firstName} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl rounded-full shrink-0">
                  {activeStudent.firstName[0]}{activeStudent.lastName[0]}
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-slate-800">{activeStudent.firstName} {activeStudent.lastName}</h1>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activeStudent.status === "Actif" ? "bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse" : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}>
                    {activeStudent.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">Classe : <strong className="text-slate-800 font-bold">{activeStudent.className}</strong> ({activeStudent.level}) • Matricule: {activeStudent.registrationNumber}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {activeStudent.parentPhone}</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Parent: {activeStudent.parentName}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex justify-center sm:justify-end gap-2 text-xs w-full sm:w-auto">
              <button 
                id="btn-generate-pdf"
                onClick={() => handleGeneratePDF(activeStudent)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-lg font-black transition cursor-pointer shadow-sm active:scale-95 duration-100"
              >
                <FileText className="w-4 h-4" /> Générer PDF
              </button>
            </div>
          </div>

          {/* Profile Content navigation tabs for academic vs disciplinary records (Conce) */}
          <div className="flex border-b border-slate-200 gap-4 mt-2 overflow-x-auto scrollbar-none whitespace-nowrap min-w-full">
            <button
              onClick={() => setActiveProfileTab("academic")}
              className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeProfileTab === "academic"
                  ? "border-indigo-600 text-indigo-700 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Suivi Académique & Scolarité
            </button>
            <button
              onClick={() => setActiveProfileTab("gestion")}
              className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeProfileTab === "gestion"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              Gestion Scolaire & Conduite (Conce)
            </button>
          </div>

          {activeProfileTab === "academic" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              
              {/* Academic Section */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Grading Input Panel */}
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-indigo-50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-500" />
                      Saisie des Notes de Contrôles
                    </h3>
                    <button 
                      onClick={() => setEditingNotes(!editingNotes)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {editingNotes ? "Annuler" : "Modifier"}
                    </button>
                  </div>

                  {editingNotes ? (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl text-xs">
                      <p className="text-slate-500 mb-2">Configurez ou ajoutez de nouvelles notes pour le 3ème Trimestre :</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Matière</label>
                          <select 
                            className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                            value={selectedSubjectId}
                            onChange={e => setSelectedSubjectId(e.target.value)}
                          >
                            <option value="">-- Choisir Matière --</option>
                            {mockSubjects
                              .filter(sub => sub.level === activeStudent.level)
                              .map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))
                            }
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Notes T3 (séparer par des virgules)</label>
                          <input 
                            type="text" 
                            className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                            value={tempTermNotes} 
                            onChange={e => setTempTermNotes(e.target.value)}
                            placeholder="Ex: 14, 15, 12, 18"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={handleUpdateNotes}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Enregistrer les modifications
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mockSubjects
                        .filter(sub => sub.level === activeStudent.level)
                        .map(sub => {
                          const scoreObj = activeStudent.grades.find(g => g.subjectId === sub.id);
                          const t1Avg = scoreObj ? calculateSubjectAvg(scoreObj.term1) : 10;
                          const t2Avg = scoreObj ? calculateSubjectAvg(scoreObj.term2) : 10;
                          const t3Avg = scoreObj ? calculateSubjectAvg(scoreObj.term3) : 10;

                          return (
                            <div key={sub.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-100">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{sub.name}</p>
                                <p className="text-[10px] text-slate-400">Coeff: {sub.coefficient}</p>
                              </div>
                              <div className="text-right space-y-0.5">
                                <p className="text-xs font-black text-slate-700">Moyenne: {Math.round(((t1Avg + t2Avg + t3Avg) / 3) * 100) / 100} / 20</p>
                                <p className="text-[9px] text-slate-400">T1: {t1Avg} | T2: {t2Avg} | T3: {t3Avg}</p>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>

                {/* Attendance Tracker */}
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    Suivi Journalier d'Assiduité
                  </h3>

                  <div className="space-y-2 text-xs">
                    {activeStudent.attendance.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600">{att.date}</span>
                          {att.reason && <span className="text-slate-400">({att.reason})</span>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === "Présent" ? "bg-emerald-50 text-emerald-600" :
                          att.status === "Absent" ? "bg-rose-50 text-rose-600" :
                          att.status === "Retard" ? "bg-amber-50 text-amber-600" : "bg-cyan-50 text-cyan-600"
                        }`}>
                          {att.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Financial Status & Bio Details Widget */}
              <div className="space-y-6">
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-indigo-50 pb-[2px]">Scolarité, Facture & Écolage</h3>
                  <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400">Reste à solder</p>
                    <h2 className="text-sm font-black text-rose-600">
                      {formatByCurrency(activeStudent.totalFees - activeStudent.paidFees, currency, conversionRate)}
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1">sur {formatByCurrency(activeStudent.totalFees, currency, conversionRate)} exigibles</p>
                  </div>
  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Montant payé</span>
                      <span className="font-bold text-emerald-600">{formatByCurrency(activeStudent.paidFees, currency, conversionRate)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${(activeStudent.paidFees / activeStudent.totalFees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Bio Details */}
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">Informations Générales</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Date de Naissance</span>
                      <span className="font-semibold text-slate-850">{activeStudent.birthDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Parent Tuteur</span>
                      <span className="font-semibold text-slate-800">{activeStudent.parentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">E-mail Parent</span>
                      <span className="font-semibold text-slate-800">{activeStudent.parentEmail || "Non renseigné"}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              
              {/* Left Column: Admin Notes & Behavioral logs */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Administrative Notes Field */}
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-50">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Notes Administratives de Direction
                    </h3>
                    {adminNotesSaved ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold animate-bounce">
                        ✓ Enregistré avec succès !
                      </span>
                    ) : activeStudent.administrativeNotes ? (
                      <span className="text-[9px] bg-emerald-55 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded font-black">Enregistré</span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Saisissez des remarques de direction à long terme (prises en charge particulières, antécédents médicaux d'importance, suivi exceptionnel).
                  </p>
                  <textarea
                    rows={4}
                    className="w-full p-3 border rounded-lg bg-slate-50 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={adminNotesText}
                    onChange={e => setAdminNotesText(e.target.value)}
                    placeholder="Saisissez vos notes administratives ici..."
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveAdminNotes}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase rounded-lg shadow transition active:scale-95 duration-100 cursor-pointer"
                    >
                      {adminNotesSaved ? "Notes Sauvegardées !" : "Enregistrer les Notes Administratives"}
                    </button>
                  </div>
                </div>

                {/* Behavioral & Incident logs timeline */}
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-indigo-50 pb-2">
                    <GraduationCap className="w-4 h-4 text-cyan-500" />
                    Registre Général Disciplinaire & Conduite (Conce)
                  </h3>

                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                    {(activeStudent.behavioralLogs && activeStudent.behavioralLogs.length > 0) ? (
                      activeStudent.behavioralLogs.map((log) => (
                        <div key={log.id} className="p-4 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-xl border border-slate-100 relative group">
                          {/* Delete button, absolutely positioned and styled beautifully */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBehavioralLog(log.id)}
                            className="absolute top-3.5 right-3.5 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition duration-150 cursor-pointer"
                            title="Supprimer cette observation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center justify-between mb-2 pr-6">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              log.category === "Comportement" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                              log.category === "Sanction" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                              log.category === "Absence" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            }`}>
                              {log.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 bg-slate-200/50 px-2 py-0.5 rounded-full font-bold">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              {log.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-semibold">{log.comment}</p>
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                            <span>Par : <strong>{log.author}</strong></span>
                            <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] font-bold">DIRECTION SÉCURISÉE</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 inline-block w-full">
                        <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs">Aucune note disciplinaire ou administrative enregistrée pour cet élève.</p>
                        <p className="text-[10px] text-slate-400 mt-1">Utilisez le formulaire à droite pour ajouter un événement de conduite.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive forms for logs and internal status comments */}
              <div className="space-y-6">
                
                {/* Form to log entries */}
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-indigo-50 flex items-center gap-1.5 mb-2.5">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    Enregistrer un Événement Disciplinaire
                  </h3>

                  <form onSubmit={handleAddBehavioralLog} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Rubrique Disciplinaire</label>
                      <select
                        className="w-full p-2.5 border rounded-lg bg-white text-slate-805 text-slate-800"
                        value={formLogCategory}
                        onChange={e => setFormLogCategory(e.target.value as any)}
                      >
                        <option value="Comportement">Comportement & Conduite</option>
                        <option value="Note Administrative">Remarque Administrative</option>
                        <option value="Absence">Absence / Retard</option>
                        <option value="Sanction">Sanction / Mesure</option>
                        <option value="Autre">Autre dossier</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Auteur de l'observation</label>
                      <input
                        type="text"
                        className="w-full p-2.5 border rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formLogAuthor}
                        onChange={e => setFormLogAuthor(e.target.value)}
                        placeholder="Ex: Prof. Principal, Jean Yao"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Date & Heure de l'observation</label>
                      <input
                        type="datetime-local"
                        className="w-full p-2.5 border rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-[11px]"
                        value={formLogDate}
                        onChange={e => setFormLogDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Observation détaillée</label>
                      <textarea
                        rows={4}
                        className="w-full p-2.5 border rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formLogComment}
                        onChange={e => setFormLogComment(e.target.value)}
                        placeholder="Inscrivez ici le comportement, la mention ou l'observation administrative..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-lg text-xs leading-none transition shadow duration-100 cursor-pointer active:scale-95"
                    >
                      Enregistrer la mention
                    </button>
                  </form>
                </div>

                {/* ERP SCHOOL INVOICES & DONATION MANAGER FOR ACCOUNTING DEPT (Don à la comptabilité) */}
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-50">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-emerald-500" />
                      💰 Comptabilité, Facture & Don
                    </h3>
                    {paymentSuccess && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black animate-bounce">
                        Nouveau versement comptabilisé !
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Paiements écolage à enregistrer. La validation mettra à jour instantanément la comptabilité générale de l'établissement.
                    </p>
                    <div className="grid grid-cols-3 gap-2 py-2 text-center text-[10px] font-semibold">
                      <div className="p-2 bg-slate-50 border rounded-lg">
                        <span className="text-slate-400 block text-[8px]">Exigible</span>
                        <strong className="text-slate-800">{formatByCurrency(activeStudent.totalFees, currency, conversionRate)}</strong>
                      </div>
                      <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                        <span className="text-emerald-600 block text-[8px]">Réglé</span>
                        <strong className="text-emerald-700">{formatByCurrency(activeStudent.paidFees, currency, conversionRate)}</strong>
                      </div>
                      <div className="p-2 bg-rose-50/50 border border-rose-100 rounded-lg">
                        <span className="text-rose-600 block text-[8px]">Reste</span>
                        <strong className="text-rose-700">{formatByCurrency(activeStudent.totalFees - activeStudent.paidFees, currency, conversionRate)}</strong>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleAddPaymentDon} className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Montant du versement (USD / CDF équiv.)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2.5 border rounded-lg bg-white text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        placeholder="Ex: 100"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Libellé / Titre de la transaction / Don</label>
                      <input
                        type="text"
                        className="w-full p-2.5 border rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={paymentTitle}
                        onChange={e => setPaymentTitle(e.target.value)}
                        placeholder="Ex: Frais Scolaires - Trimestre 3"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Mode de paiement / Canal de règlement</label>
                      <select
                        className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                      >
                        <option value="Mobile Money">Mobile Money (M-Pesa, Orange, Airtel)</option>
                        <option value="Espèces">Espèces (Versement physique à la caisse)</option>
                        <option value="Banque">Virement Bancaire (Rawbank, TMB)</option>
                        <option value="Don & Subvention">Donation / Prise en charge extérieure</option>
                      </select>
                    </div>

                    <div className="pt-1 flex items-start gap-2 text-[10px] text-slate-500">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 shrink-0"
                      />
                      <span>Générer automatiquement le reçu officiel et transmettre l'écriture comptable à la Caisse Centrale.</span>
                    </div>

                    <div className="flex gap-2 pt-1 font-extrabold uppercase text-[10px]">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow-sm active:scale-95 duration-100 cursor-pointer text-center"
                      >
                        Enregistrer & Transmettre
                      </button>
                      
                      {lastPaymentDetails && (
                        <button
                          type="button"
                          onClick={() => setLastPaymentDetails({...lastPaymentDetails})} // reopen
                          className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border rounded-lg transition cursor-pointer"
                          title="Ré-ouvrir la dernière facture émise"
                        >
                          🎫 Reçu
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Internal Comment on Student Status */}
                <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-indigo-50 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-500" />
                    Commentaire Interne sur le Statut
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-slate-400">
                      Mention interne liée à l'évolution du statut de l'élève au sein de l'établissement.
                    </p>
                    {statusCommentsSaved && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold animate-pulse">
                        Sauvé
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={statusCommentsText}
                    onChange={e => setStatusCommentsText(e.target.value)}
                    placeholder="Ex: Dossier d'inscription complet..."
                  />
                  <button
                    onClick={handleSaveStatusComments}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase rounded-lg shadow-sm transition active:scale-95 duration-100 cursor-pointer"
                  >
                    {statusCommentsSaved ? "Statut Mis à Jour !" : "Mettre à jour le Commentaire de Statut"}
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Action and search panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-lg border border-slate-150">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher par nom, matricule, classe..." 
                className="bg-transparent border-none text-xs text-slate-800 w-full outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select 
                className="p-2 border rounded-lg text-xs text-slate-700 bg-white"
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
              >
                <option value="All">Tous Niveaux</option>
                <option value="Maternel">Maternel</option>
                <option value="Primaire">Primaire</option>
                <option value="Secondaire">Secondaire</option>
              </select>

              <select 
                className="p-2 border rounded-lg text-xs text-slate-700 bg-white"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">Tous les Statuts</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
              </select>

              <button 
                onClick={() => setIsAddingUser(true)}
                className="flex items-center gap-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Inscrire
              </button>
            </div>
          </div>

          {/* Student Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div 
                key={student.id}
                className="p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div className="flex gap-3">
                  {student.photoUrl ? (
                    <img 
                      src={student.photoUrl} 
                      alt={student.firstName} 
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm rounded-full">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                  )}

                  <div className="space-y-0.5 text-xs min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{student.firstName} {student.lastName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{student.className} • {student.registrationNumber}</p>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                      student.status === "Actif" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px]">
                  <p className="text-slate-400">Reste dû: <span className="font-bold text-slate-800">{formatCurrencyCompact(student.totalFees - student.paidFees)}</span></p>
                  <button 
                    onClick={() => {
                      if (onSelectStudent) {
                        onSelectStudent(student.id);
                      } else {
                        onUpdateStudent(student);
                      }
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    Fiche Élève <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
