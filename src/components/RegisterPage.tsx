import React, { useState } from "react";
import { 
  School, 
  UserPlus, 
  User, 
  Lock, 
  Mail,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { UserRole } from "../types";

interface RegisterPageProps {
  onBack: () => void;
  onRegister: () => void;
}

export default function RegisterPage({ onBack, onRegister }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: UserRole.STUDENT,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration attempt:", formData);
    // In a real app, send to backend
    onRegister();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Background Decoratives */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>

      {/* Brand Header */}
      <div className="mb-8 text-center z-10 space-y-2">
        <div className="inline-flex p-3.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl mb-2 shadow-xl shadow-indigo-500/5">
          <School className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black tracking-tight uppercase">Collège Saint Josias</h1>
        <p className="text-xs text-slate-400 font-mono tracking-wider">CRÉATION DE COMPTE • SYSTÈME ERP PRO</p>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl z-10 relative">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">Nouvelle Inscription</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prénom</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adresse E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type de Compte</label>
            <select 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-indigo-500 transition"
            >
              <option value={UserRole.STUDENT}>Élève</option>
              <option value={UserRole.PARENT}>Parent</option>
              <option value={UserRole.TEACHER}>Professeur</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition active:scale-[98%] shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Créer mon compte
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-850 text-center">
          <button
            onClick={onBack}
            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
