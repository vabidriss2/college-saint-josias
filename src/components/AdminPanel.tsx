/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  AppWindow
} from "lucide-react";
import { SchoolConfig, AuditLog, User, UserRole } from "../types";

interface AdminPanelProps {
  config: SchoolConfig;
  onUpdateConfig: (newConfig: SchoolConfig) => void;
  logs: AuditLog[];
  onClearLogs: () => void;
}

export default function AdminPanel({
  config,
  onUpdateConfig,
  logs,
  onClearLogs,
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

            <div className="grid grid-cols-2 gap-4">
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
                <label className="font-bold text-slate-600 block">Thème de Couleur d'Accentuation</label>
                <select 
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-800"
                  value={formColor}
                  onChange={e => setFormColor(e.target.value)}
                >
                  <option value="indigo">Bleu Impérial (Indigo)</option>
                  <option value="emerald">Vert Émeraude (Scolaire)</option>
                  <option value="amber">Ambre Scolaire (Chaud)</option>
                  <option value="rose">Bordeaux Chic (Rose)</option>
                </select>
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

        {/* Audit Database Logs Scroll */}
        <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-mono text-cyan-400 font-bold text-xs flex items-center gap-2">
              <Activity className="w-4 h-4" />
              SYSTEM SHIELD SECURITY logs
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Consignation sécurisée en temps réel de l'audit système</p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96 pr-1 font-mono text-[10px]">
            {logs.map(log => (
              <div key={log.id} className="p-2.5 bg-slate-950/70 rounded border border-slate-850 space-y-1">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-cyan-400 font-semibold">{log.userName} ({log.userRole})</span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-200">Action: <span className="text-slate-350">{log.action}</span></p>
                <p className="text-slate-500 text-[9px]">ID Connexion: {log.ipAddress}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={onClearLogs}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-705 text-cyan-400 font-mono text-[10px] rounded transition cursor-pointer"
          >
            Vider le journal d'audit de sécurité
          </button>
        </div>

      </div>

      {/* User Accounts Management Simulation */}
      <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <ShieldAlert className="w-5 h-5 text-indigo-505" />
          Contrôle d'Accès Multi-Rôles Sécurisé (RBAC Status)
        </h3>

        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left divide-y">
            <thead className="bg-slate-50 text-slate-450 font-bold">
              <tr>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">E-mail institutionnel</th>
                <th className="p-3">Rôle système</th>
                <th className="p-3 text-center">Statut d'accès</th>
                <th className="p-3 text-center">Bannir / Autoriser</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-800 font-medium">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold">{u.name}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{u.role}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-black ${
                      u.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      {u.status === "Active" ? "Autorisé" : "Banni"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => toggleUserStatus(u.id)}
                      className="inline-block p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                    >
                      {u.status === "Active" ? (
                        <ToggleRight className="w-7 h-7 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-300" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
