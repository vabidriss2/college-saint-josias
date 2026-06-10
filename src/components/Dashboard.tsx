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
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import AttendanceChart from "./AttendanceChart";
import FinancialGauge from "./FinancialGauge";
import ChatbotModule from "./ChatbotModule";
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

  // Monthly Attendance Calculation
  const monthlyAttendanceData = React.useMemo(() => {
    const months = ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    const monthlyData: { [key: string]: { present: number, total: number } } = {};
    
    months.forEach(m => monthlyData[m] = { present: 0, total: 0 });

    students.forEach(s => {
      s.attendance.forEach(a => {
        const date = new Date(a.date);
        const monthIndex = date.getMonth(); 
        
        let monthKey = "";
        if (monthIndex === 8) monthKey = "Sept";
        else if (monthIndex === 9) monthKey = "Oct";
        else if (monthIndex === 10) monthKey = "Nov";
        else if (monthIndex === 11) monthKey = "Déc";
        else if (monthIndex === 0) monthKey = "Jan";
        else if (monthIndex === 1) monthKey = "Fév";
        else if (monthIndex === 2) monthKey = "Mar";
        else if (monthIndex === 3) monthKey = "Avr";
        else if (monthIndex === 4) monthKey = "Mai";
        else if (monthIndex === 5) monthKey = "Juin";

        if (monthKey && monthlyData[monthKey]) {
          monthlyData[monthKey].total++;
          if (a.status === "Présent" || a.status === "Retard") {
            monthlyData[monthKey].present++;
          }
        }
      });
    });

    return months.map(m => ({
      name: m,
      rate: monthlyData[m].total > 0 
        ? Math.round((monthlyData[m].present / monthlyData[m].total) * 100) 
        : 0
    }));
  }, [students]);
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

  const levelData = [
    { name: "Maternel", value: levelCounts.Maternel, color: "#818cf8" },
    { name: "Primaire", value: levelCounts.Primaire, color: "#34d399" },
    { name: "Secondaire", value: levelCounts.Secondaire, color: "#fbbf24" },
  ];

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
      <div className="p-4 md:p-6 bg-gradient-to-r from-indigo-900 to-indigo-850 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold w-max mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Pilotage Éducatif Intelligent v2.0
            </div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Bonjour, Administrateur Principal !</h1>
            <p className="text-indigo-200 mt-1 max-w-xl text-sm">
              Bienvenue sur le tableau de bord Saint Josias Smart School. Le système est au garde-à-vous, toutes les données comptables et scolaires sont consolidées.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-xl shrink-0">
            <div className="p-2 md:p-3 bg-indigo-500 rounded-lg text-white">
              <Calendar className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-indigo-200 uppercase tracking-wider font-semibold">Année Académique</p>
              <p className="md:text-lg font-bold">2025-2026</p>
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
              <h2 className="text-lg font-bold text-slate-800">Analyses Globales</h2>
              <p className="text-xs text-slate-400">Activités mensuelles : Trésorerie et Présence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl">
             <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Évolution mensuelle de la présence (%)</h4>
             <AttendanceChart students={students} />
           </div>

            <div className="p-4 bg-slate-50 rounded-xl relative overflow-hidden">
               <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Santé Financière</h4>
               <FinancialGauge revenue={totalRevenue} breakEven={6000} />
            </div>
           </div>
         </div>

        {/* Level Distribution Widget & Quick Enroll Shortcut */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Répartition par Niveau</h2>
            
            {/* Simple CSS-based Pie Chart representation */}
            <div className="flex justify-center my-6">
              <div className="relative w-32 h-32 rounded-full border-[10px] border-slate-100 flex items-center justify-center">
                 {levelData.map((d, i) => (
                    <div key={d.name} className="absolute w-full h-full rounded-full" style={{
                      clipPath: `polygon(50% 50%, ${i * 33}% 0, ${(i + 1) * 33}% 0)`,
                      backgroundColor: d.color
                    }}></div>
                 ))}
                 <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-slate-700">{totalStudents}</div>
              </div>
            </div>

            <div className="space-y-2">
              {levelData.map((d) => (
                <div key={d.name} className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}}></span>{d.name}</span>
                  <span className="text-slate-500 font-bold">{d.value} ({totalStudents > 0 ? Math.round(d.value / totalStudents * 100) : 0}%)</span>
                </div>
              ))}
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

        {/* Monitoring Widget & Alerts */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Monitoring d'Assiduité
            </h3>
            <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded animate-pulse">
              {students.filter(s => {
                const total = s.attendance.length;
                if (total === 0) return false;
                const present = s.attendance.filter(a => a.status === "Présent" || a.status === "Retard").length;
                return (present / total) * 100 < 70;
              }).length} À RISQUE
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {students.filter(s => {
              const total = s.attendance.length;
              if (total === 0) return false;
              const present = s.attendance.filter(a => a.status === "Présent" || a.status === "Retard").length;
              return (present / total) * 100 < 70;
            }).slice(0, 4).map(s => {
                const total = s.attendance.length;
                const present = s.attendance.filter(a => a.status === "Présent" || a.status === "Retard").length;
                const rate = Math.round((present / total) * 100);
                return (
                  <div key={s.id} className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-rose-600 p-2 bg-rose-100 rounded-full"><AlertTriangle className="w-4 h-4" /></div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{s.firstName} {s.lastName}</p>
                        <p className="text-[10px] text-rose-700 font-medium">Taux: {rate}%</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onSelectStudent(s.id)}
                      className="text-[10px] bg-rose-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-rose-700 transition"
                    >
                      Intervenir
                    </button>
                  </div>
                )
            })}

            {students.filter(s => {
              const total = s.attendance.length;
              if (total === 0) return false;
              const present = s.attendance.filter(a => a.status === "Présent" || a.status === "Retard").length;
              return (present / total) * 100 < 70;
            }).length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs">
                    <CheckCircle className="w-4 h-4" /> Aucun élève à risque identifié.
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
      <ChatbotModule />
    </div>
  );
}
