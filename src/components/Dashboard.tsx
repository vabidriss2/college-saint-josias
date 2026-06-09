/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  UserSquare2, 
  School, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Bell, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";
import { Student, Teacher, ClassRoom, FinancialTransaction, AuditLog } from "../types";
import { formatCurrency, formatCurrencyCompact } from "../utils";

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  transactions: FinancialTransaction[];
  logs: AuditLog[];
  onNavigate: (tab: string) => void;
  onSelectStudent: (id: string) => void;
}

export default function Dashboard({
  students,
  teachers,
  classes,
  transactions,
  logs,
  onNavigate,
  onSelectStudent
}: DashboardProps) {
  const [hoveredTx, setHoveredTx] = useState<string | null>(null);

  // Math Calculations
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === "Actif").length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  // Revenue logic
  const totalRevenue = transactions
    .filter(t => t.type === "Recette")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "Dépense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalRevenue - totalExpenses;

  // Attendance metrics
  let totalAttendanceChecked = 0;
  let presentCount = 0;
  students.forEach(s => {
    s.attendance.forEach(a => {
      totalAttendanceChecked++;
      if (a.status === "Présent" || a.status === "Retard") {
        presentCount++;
      }
    });
  });
  const presenceRate = totalAttendanceChecked > 0 
    ? Math.round((presentCount / totalAttendanceChecked) * 100) 
    : 95;

  // Level Distribution
  const levelCounts = {
    Maternel: students.filter(s => s.level === "Maternel").length,
    Primaire: students.filter(s => s.level === "Primaire").length,
    Secondaire: students.filter(s => s.level === "Secondaire").length,
  };

  // Recent transactions
  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Recent logs
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  // Alerts
  const delinquentStudents = students.filter(s => (s.totalFees - s.paidFees) > 300);
  const urgentAbsents = students.filter(s => {
    const recentAtt = s.attendance[s.attendance.length - 1];
    return recentAtt && recentAtt.status === "Absent" && !recentAtt.reason;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 to-indigo-850 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold w-max mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Pilotage Éducatif Intelligent v2.0
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bonjour, Administrateur Principal !</h1>
            <p className="text-indigo-200 mt-1 max-w-xl text-sm md:text-base">
              Bienvenue sur le tableau de bord Saint Josias Smart School. Le système est au garde-à-vous, toutes les données comptables et scolaires sont consolidées.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl">
            <div className="p-3 bg-indigo-500 rounded-lg text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Année Académique</p>
              <p className="text-lg font-bold">2025-2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Students */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition duration-300">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Effectif Global</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{totalStudents}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded">
                {activeStudents} actifs
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-2 flex gap-2">
              <span>{levelCounts.Maternel} Mat.</span>
              <span>•</span>
              <span>{levelCounts.Primaire} Prim.</span>
              <span>•</span>
              <span>{levelCounts.Secondaire} Sec.</span>
            </div>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Teachers */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition duration-300">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Enseignants</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{totalTeachers}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                100% Qualifiés
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Répartis sur {totalClasses} classes actives</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserSquare2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Attendance */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition duration-300">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Présence Globale</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{presenceRate}%</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                Trimestre 3
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Aujourd'hui: {presenceRate >= 90 ? "Excellent" : "À surveiller"}</p>
          </div>
          <div className="p-4 bg-cyan-50 text-cyan-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Financial Balance */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition duration-300">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Trésorerie Net</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-sm font-black ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatCurrency(balance)}
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded">
                Solde
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex gap-2">
              <span className="text-emerald-600 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+{formatCurrencyCompact(totalRevenue)}</span>
              <span className="text-slate-300">|</span>
              <span className="text-rose-600 flex items-center gap-0.5">-{formatCurrencyCompact(totalExpenses)}</span>
            </div>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts & Level Distribution Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Charts Card (Pure SVG for responsive full-fidelity beauty) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Analyse de Trésorerie Mensuelle</h2>
              <p className="text-xs text-slate-400">Recettes vs Dépenses comptables (Mai/Juin 2026)</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Comptabilité consolidée
            </span>
          </div>

          {/* Pure Responsive Custom SVG Line & Bar Composite Chart */}
          <div className="w-full h-64 relative bg-slate-50 rounded-xl p-4 flex items-end justify-between overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-x-0 top-1/4 h-px bg-slate-200"></div>
            <div className="absolute inset-x-0 top-2/4 h-px bg-slate-200"></div>
            <div className="absolute inset-x-0 top-3/4 h-px bg-slate-200"></div>
            
            {/* Bars for Financial categories */}
            <div className="relative z-10 w-full h-full flex items-end justify-around pt-6">
              
              {/* Column 1: Scolarité */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-12 bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all duration-300" style={{ height: "130px" }}></div>
                <span className="text-[10px] font-bold text-slate-500">Scolarités</span>
                <span className="text-[10px] text-indigo-600 font-extrabold hidden group-hover:block absolute bottom-16 bg-white px-2 py-1 shadow rounded border">{formatCurrencyCompact(1900)}</span>
              </div>

              {/* Column 2: Salaires */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-12 bg-rose-400 hover:bg-rose-500 rounded-t-md transition-all duration-300" style={{ height: "180px" }}></div>
                <span className="text-[10px] font-bold text-slate-500">Salaires</span>
                <span className="text-[10px] text-rose-600 font-extrabold hidden group-hover:block absolute bottom-16 bg-white px-2 py-1 shadow rounded border">{formatCurrencyCompact(4650)}</span>
              </div>

              {/* Column 3: Autre Recettes */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-12 bg-emerald-400 hover:bg-emerald-500 rounded-t-md transition-all duration-300" style={{ height: "85px" }}></div>
                <span className="text-[10px] font-bold text-slate-500">Inscriptions</span>
                <span className="text-[10px] text-emerald-600 font-extrabold hidden group-hover:block absolute bottom-16 bg-white px-2 py-1 shadow rounded border">{formatCurrencyCompact(1230)}</span>
              </div>

              {/* Column 4: Maintenance */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-12 bg-amber-400 hover:bg-amber-500 rounded-t-md transition-all duration-300" style={{ height: "50px" }}></div>
                <span className="text-[10px] font-bold text-slate-500">Matériel</span>
                <span className="text-[10px] text-amber-600 font-extrabold hidden group-hover:block absolute bottom-16 bg-white px-2 py-1 shadow rounded border">{formatCurrencyCompact(690)}</span>
              </div>

            </div>

            <div className="absolute left-3 top-3 bg-white/80 backdrop-blur px-2.5 py-1.5 rounded border border-slate-100 text-[10px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block"></span> Recettes scolaires</div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-400 rounded-full inline-block"></span> Dépenses et Salaires</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium">Tx de Recouvrement</p>
              <p className="text-base font-bold text-indigo-600">76 %</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Dépenses Fixes</p>
              <p className="text-sm font-bold text-rose-500">{formatCurrencyCompact(4650)} / m</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Seuil de Rentabilité</p>
              <p className="text-sm font-bold text-slate-700">{formatCurrencyCompact(6000)}</p>
            </div>
          </div>
        </div>

        {/* Level Distribution Widget & Quick Enroll Shortcut */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Répartition par Niveau</h2>
            <p className="text-xs text-slate-400 mb-4">Structure d'élèves de l'établissement</p>
            
            <div className="space-y-4">
              {/* Maternel */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full"></span>Maternel</span>
                  <span className="text-slate-500 font-bold">{levelCounts.Maternel} ({Math.round(levelCounts.Maternel / totalStudents * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${(levelCounts.Maternel / totalStudents) * 100}%` }}></div>
                </div>
              </div>

              {/* Primaire */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>Primaire</span>
                  <span className="text-slate-500 font-bold">{levelCounts.Primaire} ({Math.round(levelCounts.Primaire / totalStudents * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(levelCounts.Primaire / totalStudents) * 100}%` }}></div>
                </div>
              </div>

              {/* Secondaire */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>Secondaire</span>
                  <span className="text-slate-500 font-bold">{levelCounts.Secondaire} ({Math.round(levelCounts.Secondaire / totalStudents * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(levelCounts.Secondaire / totalStudents) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50">
            <button 
              onClick={() => onNavigate("students")}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-xs font-semibold text-slate-600 transition duration-250 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Recherche intelligente d'élèves
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Widgets Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Registered Students */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Nouveaux Inscrits
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded">
              Dossiers récents
            </span>
          </div>
          
          <div className="space-y-3.5 flex-1">
            {students.slice(0, 4).map((student) => (
              <div 
                key={student.id} 
                onClick={() => onSelectStudent(student.id)}
                className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition duration-200 border border-transparent hover:border-slate-100"
              >
                {student.photoUrl ? (
                  <img 
                    src={student.photoUrl} 
                    alt={student.firstName} 
                    className="w-9 h-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm uppercase rounded-full">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{student.className} • Inscription le {student.dateEnrolled}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    student.status === "Actif" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Critical Payments */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Alertes scolaires & Frais
            </h3>
            <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded">
              Action requise
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {delinquentStudents.slice(0, 2).map(s => (
              <div key={s.id} className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg flex gap-2">
                <div className="p-1 text-amber-600"><AlertTriangle className="w-4 h-4" /></div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-800">Scolarité en retard : {s.firstName} {s.lastName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Reste dû : <span className="font-semibold text-amber-700">{formatCurrencyCompact(s.totalFees - s.paidFees)}</span> sur {s.totalFees} $</p>
                </div>
              </div>
            ))}

            {urgentAbsents.length > 0 ? (
              urgentAbsents.slice(0, 2).map(s => (
                <div key={s.id} className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg flex gap-2">
                  <div className="p-1 text-rose-600"><Bell className="w-4 h-4" /></div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-800">Absence non justifiée</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.firstName} {s.lastName} ({s.className}) était absent le 03 Juin.</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg flex gap-2 items-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-slate-700">Toutes les absences récentes ont été dument justifiées.</p>
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail Logging Widget */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              Journal de sécurité
            </h3>
            <span className="text-[10px] bg-cyan-50 text-cyan-600 font-bold px-2 py-0.5 rounded">
              Audit Temps Réel
            </span>
          </div>

          <div className="space-y-3 flex-1 font-mono text-[11px]">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-2 bg-slate-50 hover:bg-slate-100 rounded leading-tight border border-slate-100 flex items-start gap-2">
                <span className="text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1 rounded">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 font-semibold truncate">{log.action}</p>
                  <p className="text-[9px] text-slate-400 truncate">Par {log.userName} ({log.userRole}) • {log.ipAddress}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
