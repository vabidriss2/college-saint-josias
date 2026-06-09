/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileText, 
  User, 
  CreditCard, 
  Calendar, 
  PlusCircle, 
  Scale, 
  Percent, 
  Coins,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp as TrendIcon,
  BarChart2
} from "lucide-react";
import { FinancialTransaction, Student } from "../types";
import { formatCurrency, formatCurrencyCompact, formatByCurrency } from "../utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface FinanceModuleProps {
  transactions: FinancialTransaction[];
  students: Student[];
  onAddTransaction: (newTx: Omit<FinancialTransaction, "id">) => void;
  onReceiveStudentFee: (studentId: string, amount: number) => void;
  currency: "USD" | "CDF";
  onToggleCurrency: () => void;
  conversionRate: number;
}

export default function FinanceModule({
  transactions,
  students,
  onAddTransaction,
  onReceiveStudentFee,
  currency,
  onToggleCurrency,
  conversionRate,
}: FinanceModuleProps) {
  // Navigation & States
  const [filterType, setFilterType] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [isReceivingFee, setIsReceivingFee] = useState(false);

  // Form states - General Income/Expense
  const [txType, setTxType] = useState<"Recette" | "Dépense">("Recette");
  const [txCat, setTxCat] = useState<any>("Scolarité");
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState(150);
  const [txMethod, setTxMethod] = useState<any>("Espèces");

  // Form states - Student Fee Payment
  const [selStudentId, setSelStudentId] = useState("");
  const [feeAmount, setFeeAmount] = useState(150);
  const [feeMethod, setFeeMethod] = useState<any>("Mobile Money");

  // Calculation formulas
  const totalInflow = transactions
    .filter(t => t.type === "Recette")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOutflow = transactions
    .filter(t => t.type === "Dépense")
    .reduce((acc, t) => acc + t.amount, 0);

  const margin = totalInflow - totalOutflow;

  // Filter lists
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === "All" || t.type === filterType;
    const matchesCat = filterCategory === "All" || t.category === filterCategory;
    return matchesType && matchesCat;
  });

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || txAmount <= 0) {
      alert("Champs invalides.");
      return;
    }

    const newTx: Omit<FinancialTransaction, "id"> = {
      date: new Date().toISOString().split('T')[0],
      type: txType,
      category: txCat,
      description: txDesc,
      amount: Number(txAmount),
      paymentMethod: txMethod
    };

    onAddTransaction(newTx);
    setIsAddingTx(false);
    setTxDesc("");
    setTxAmount(150);
  };

  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selStudentId || feeAmount <= 0) {
      alert("Sélectionnez l'élève et le montant.");
      return;
    }

    const targetStudent = students.find(s => s.id === selStudentId);
    if (!targetStudent) return;

    // Trigger update on parent layout state
    onReceiveStudentFee(selStudentId, Number(feeAmount));

    // Also register receipt into global transaction ledger
    const ledgerTx: Omit<FinancialTransaction, "id"> = {
      date: new Date().toISOString().split('T')[0],
      type: "Recette",
      category: "Scolarité",
      description: `Réglement Frais Scolarité par ${targetStudent.firstName} ${targetStudent.lastName}`,
      amount: Number(feeAmount),
      paymentMethod: feeMethod,
      referenceUser: selStudentId
    };
    onAddTransaction(ledgerTx);

    setIsReceivingFee(false);
    setSelStudentId("");
    setFeeAmount(150);
  };

  return (
    <div className="finance-module space-y-6">
      
      {/* Devise configuration panel with interactive currency toggle button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-3">
        <div>
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Console & Configuration de Trésorerie</h3>
          <p className="text-[10.5px] text-slate-400 font-medium">Taux de conversion fixe configuré dans le système : <span className="text-indigo-600 font-extrabold">1 USD = {conversionRate} FC</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Devise active courante:</span>
          <button
            onClick={onToggleCurrency}
            className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 font-black text-white rounded-lg text-xs tracking-wide transition shadow-sm cursor-pointer flex items-center gap-1.5 duration-100 active:scale-95"
          >
            {currency === "USD" ? "Dollar ($ / USD)" : "Franc Congolais (FC / CDF)"}
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-bold">Changer</span>
          </button>
        </div>
      </div>

      {/* Financial Health / Top Bar Widget Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Total Recettes Brut</span>
            <TrendingUp className="w-5 h-5 text-emerald-200" />
          </div>
          <h2 className="text-lg font-black mt-2">{formatByCurrency(totalInflow, currency, conversionRate)}</h2>
          <p className="text-[10px] text-emerald-100 mt-1">Scolarités, inscriptions et d'autres entrées cash</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-100">Total Charges & Salaires</span>
            <TrendingDown className="w-5 h-5 text-rose-200" />
          </div>
          <h2 className="text-lg font-black mt-2">{formatByCurrency(totalOutflow, currency, conversionRate)}</h2>
          <p className="text-[10px] text-rose-100 mt-1">Fournisseurs, matériels, charges fixes salariales</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Bénéfice Net Scolaire</span>
            <Scale className="w-5 h-5 text-indigo-300" />
          </div>
          <h2 className={`text-sm font-black mt-2 ${margin >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {formatByCurrency(margin, currency, conversionRate)}
          </h2>
          <p className="text-[10px] text-indigo-200 mt-1">Marge nette de rentabilité après consolidation</p>
        </div>

      </div>

      {/* Dashboard analytique de Santé Financière avec Recharts */}
      <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              Évolution Mensuelle & Santé Financière des Revenus
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Analyse comparative des recettes scolaires consolidées en <span className="font-extrabold text-indigo-600">{currency}</span></p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View type selects */}
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Affichage :</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
              <button
                onClick={() => setFilterType("All")}
                className={`px-3 py-1 rounded-md font-bold transition duration-150 cursor-pointer ${
                  filterType === "All" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Vue Globale
              </button>
              <button
                onClick={() => setFilterType("Recette")}
                className={`px-3 py-1 rounded-md font-bold transition duration-150 cursor-pointer ${
                  filterType === "Recette" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Recettes
              </button>
              <button
                onClick={() => setFilterType("Dépense")}
                className={`px-3 py-1 rounded-md font-bold transition duration-150 cursor-pointer ${
                  filterType === "Dépense" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Charges
              </button>
            </div>
          </div>
        </div>

        {/* Generate Monthly Metrics mapping based on state currency */}
        {(() => {
          const monthsMap: { [key: string]: { monthName: string; recettes: number; depenses: number } } = {
            "2026-01": { monthName: "Janvier", recettes: 1250, depenses: 900 },
            "2026-02": { monthName: "Février", recettes: 1600, depenses: 1050 },
            "2026-03": { monthName: "Mars", recettes: 1450, depenses: 1100 },
            "2026-04": { monthName: "Avril", recettes: 2100, depenses: 1250 },
            "2026-05": { monthName: "Mai", recettes: 0, depenses: 0 },
            "2026-06": { monthName: "Juin", recettes: 0, depenses: 0 }
          };

          // Aggregate actual ledgers onto specific months dynamically
          transactions.forEach(tx => {
            const match = tx.date.match(/^(\d{4}-\d{2})/);
            if (match) {
              const yearMonth = match[1];
              if (!monthsMap[yearMonth]) {
                const monthNum = yearMonth.split("-")[1];
                const monthNames: { [key: string]: string } = {
                  "01": "Janvier", "02": "Février", "03": "Mars", "04": "Avril",
                  "05": "Mai", "06": "Juin", "07": "Juillet", "08": "Août",
                  "09": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Décembre"
                };
                monthsMap[yearMonth] = {
                  monthName: monthNames[monthNum] ? `${monthNames[monthNum]}` : `Mois ${monthNum}`,
                  recettes: 0,
                  depenses: 0
                };
              }

              if (tx.type === "Recette") {
                monthsMap[yearMonth].recettes += tx.amount;
              } else {
                monthsMap[yearMonth].depenses += tx.amount;
              }
            }
          });

          // Convert final values based on current active currency and conversionRate
          const multiplier = currency === "USD" ? 1 : conversionRate;
          const chartData = Object.keys(monthsMap).sort().map(key => {
            const rawRec = monthsMap[key].recettes;
            const rawDep = monthsMap[key].depenses;
            return {
              rawKey: key,
              month: monthsMap[key].monthName,
              "Recettes (Entrées)": Math.round(rawRec * multiplier),
              "Charges (Dépenses)": Math.round(rawDep * multiplier),
              "Marge Nette": Math.round((rawRec - rawDep) * multiplier)
            };
          });

          // Metrics computations
          const activeCurrencySymbol = currency === "USD" ? "$" : "FC";
          const totalRecVal = chartData.reduce((acc, d) => acc + d["Recettes (Entrées)"], 0);
          const totalDepVal = chartData.reduce((acc, d) => acc + d["Charges (Dépenses)"], 0);
          const averageRecVal = Math.round(totalRecVal / chartData.length);

          const CustomTooltip = ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg shadow-xl font-mono text-[11px] space-y-1">
                  <p className="font-extrabold border-b border-slate-800 pb-1 text-slate-300">{label}</p>
                  {payload.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 justify-between">
                      <span className="flex items-center gap-1.5 font-bold" style={{ color: entry.stroke || entry.fill }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
                        {entry.name}:
                      </span>
                      <span className="font-black text-white">{entry.value.toLocaleString("fr-FR")} {activeCurrencySymbol}</span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          };

          return (
            <div className="space-y-4">
              {/* Actual Recharts Component Stage */}
              <div className="w-full h-80 min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMarge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      dy={8}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value.toLocaleString("fr-FR")} ${activeCurrencySymbol}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={40} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    
                    {/* Selectively render fields based on active filters */}
                    {(filterType === "All" || filterType === "Recette") && (
                      <Area 
                        type="monotone" 
                        dataKey="Recettes (Entrées)" 
                        stroke="#10b981" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorRecettes)" 
                      />
                    )}
                    
                    {(filterType === "All" || filterType === "Dépense") && (
                      <Area 
                        type="monotone" 
                        dataKey="Charges (Dépenses)" 
                        stroke="#f43f5e" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorDepenses)" 
                      />
                    )}

                    {filterType === "All" && (
                      <Area 
                        type="monotone" 
                        dataKey="Marge Nette" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={0.5} 
                        fill="url(#colorMarge)" 
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Financial Health Analysis Footer Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 space-y-1 text-xs">
                  <span className="text-slate-400 font-extrabold uppercase text-[9px] block">Moyenne Mensuelle</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-[15px] text-slate-800">{averageRecVal.toLocaleString("fr-FR")} {activeCurrencySymbol}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Total recettes divisé par le nombre de mois modélisés</p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-1 text-xs">
                  <span className="text-emerald-700 font-extrabold uppercase text-[9px] block">Pic Historique Recettes</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-[15px] text-emerald-800">
                      {Math.max(...chartData.map(d => d["Recettes (Entrées)"])).toLocaleString("fr-FR")} {activeCurrencySymbol}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-600/80">Revenu mensuel maximum enregistré sur la période</p>
                </div>

                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 space-y-1 text-xs">
                  <span className="text-indigo-700 font-extrabold uppercase text-[9px] block">Consolidation de Trésorerie</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-extrabold text-[15px] ${totalRecVal >= totalDepVal ? "text-indigo-800" : "text-rose-800"}`}>
                      {totalRecVal >= totalDepVal ? "SOLVABLE & SAIN" : "SOLDE DÉFICITAIRE"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-505 text-indigo-600/80">Ratio charges / encaissements global sur l'exercice</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Main ledger controls and forms */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ledger Transactions Logs Panel */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Grand Livre de Comptabilité</h3>
                <p className="text-[10px] text-slate-400">Journal d'Inscriptions Comptables pour l'établissement</p>
              </div>

              <div className="flex gap-2">
                <select 
                  className="p-1.5 border rounded-lg text-xs bg-white text-slate-700"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="All">Tout type</option>
                  <option value="Recette">Recette</option>
                  <option value="Dépense">Dépense</option>
                </select>

                <select 
                  className="p-1.5 border rounded-lg text-xs bg-white text-slate-700"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                >
                  <option value="All">Toutes catégories</option>
                  <option value="Scolarité">Scolarité</option>
                  <option value="Salaire">Salaire</option>
                  <option value="Matériel">Matériel</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-4 max-h-96 overflow-y-auto">
              {filteredTransactions.map(t => (
                <div key={t.id} className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between hover:bg-slate-100 transition duration-150">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        t.type === "Recette" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {t.category}
                      </span>
                      <strong className="text-slate-800">{t.description}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400">Date de saisie: {t.date} • Mode de réglement: {t.paymentMethod}</p>
                  </div>
                  <strong className={`font-extrabold text-xs whitespace-nowrap ${
                    t.type === "Recette" ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {t.type === "Recette" ? "+" : "-"}{formatByCurrency(t.amount, currency, conversionRate)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Payment & Expense Entry Panel */}
        <div className="space-y-6">
          
          {/* Action Module: Receive Student Fees */}
          <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-500" />
              Percevoir Frais de Logistique & Scolarité
            </h4>

            {isReceivingFee ? (
              <form onSubmit={handleFeeSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Sélectionner l'Élève</label>
                  <select 
                    className="w-full p-2 border rounded-lg text-slate-800"
                    value={selStudentId}
                    onChange={e => setSelStudentId(e.target.value)}
                  >
                    <option value="">-- Choisir Élève --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.lastName} {s.firstName} ({s.className})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Montant ($ / USD)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded" 
                      value={feeAmount} 
                      onChange={e => setFeeAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Canal</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={feeMethod}
                      onChange={e => setFeeMethod(e.target.value as any)}
                    >
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Espèces">Espèces (Guichet)</option>
                      <option value="Virement">Virement bancaire</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded cursor-pointer"
                  >
                    Valider Paiement
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsReceivingFee(false)}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-center">
                <p className="text-xs text-slate-500">Enregistrer un versement reçu par un élève pour son solde scolaire.</p>
                <button 
                  onClick={() => setIsReceivingFee(true)}
                  className="flex items-center justify-center gap-1 w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded transition cursor-pointer hover:bg-indigo-500"
                >
                  <PlusCircle className="w-4 h-4" /> Enregistrer un versement élève
                </button>
              </div>
            )}
          </div>

          {/* Action Module: Register General Expenses */}
          <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-500" />
              Saisir Écriture Comptable
            </h4>

            {isAddingTx ? (
              <form onSubmit={handleTxSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Sens</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={txType}
                      onChange={e => {
                        setTxType(e.target.value as any);
                        setTxCat(e.target.value === "Recette" ? "Autre Recette" : "Matériel");
                      }}
                    >
                      <option value="Recette">Recette (Inflow)</option>
                      <option value="Dépense">Dépense (Outflow)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Rubrique</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={txCat}
                      onChange={e => setTxCat(e.target.value as any)}
                    >
                      {txType === "Recette" ? (
                        <>
                          <option value="Scolarité">Frais Scolarité (T3)</option>
                          <option value="Autre Recette">Vente Accessoires / Uniformes</option>
                        </>
                      ) : (
                        <>
                          <option value="Salaire">Versement Salaires Staff</option>
                          <option value="Matériel">Fournitures & Matériel classe</option>
                          <option value="Maintenance">Maintenance & Bâtiments</option>
                          <option value="Événement">Frais Khermesse / Scolaire</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Libellé / Désignation</label>
                  <input 
                    type="text" 
                    value={txDesc} 
                    onChange={e => setTxDesc(e.target.value)}
                    className="w-full p-2 border rounded" 
                    placeholder="Ex: Achat craies et stylos"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Prix HT ($ / USD)</label>
                    <input 
                      type="number" 
                      value={txAmount} 
                      onChange={e => setTxAmount(Number(e.target.value))}
                      className="w-full p-2 border rounded" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Mode de paiement</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={txMethod}
                      onChange={e => setTxMethod(e.target.value as any)}
                    >
                      <option value="Espèces">Espèces</option>
                      <option value="Chèque">Chèque d'établissement</option>
                      <option value="Virement">Virement bancaire</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="flex-1 py-1.5 bg-rose-650 text-white bg-rose-600 hover:bg-rose-500 font-bold rounded cursor-pointer"
                  >
                    Saisir l'écriture
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingTx(false)}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 text-center rounded-xl space-y-3">
                <p className="text-xs text-slate-500">Ajouter une opération financière (charges d'entretien, de salaires, matériels).</p>
                <button 
                  onClick={() => setIsAddingTx(true)}
                  className="flex items-center justify-center gap-1 w-full py-2 bg-slate-900 text-white font-bold text-xs rounded transition hover:bg-slate-800 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Nouvelle écriture de caisse
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
