import React, { useState } from "react";
import { 
  School, 
  Sparkles, 
  KeyRound, 
  User, 
  ShieldCheck, 
  GraduationCap, 
  UserSquare2, 
  Users2, 
  Lock,
  ArrowRight
} from "lucide-react";
import { UserRole } from "../types";

interface LoginPageProps {
  onLogin: (role: UserRole, username: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.SUPER_ADMIN);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Veuillez saisir votre identifiant et votre mot de passe.");
      return;
    }

    // Direct mock validation for a real login experience
    if (username === "superadmin" && password === "admin123") {
      onLogin(UserRole.SUPER_ADMIN, "Admin Principal");
    } else if (username === "teacher" && password === "teacher123") {
      onLogin(UserRole.TEACHER, "Directeur des Études");
    } else if (username === "student" && password === "student123") {
      onLogin(UserRole.STUDENT, "Ariel Yao");
    } else if (username === "parent" && password === "parent123") {
      onLogin(UserRole.PARENT, "Parent Ariel Yao");
    } else {
      setErrorMessage("Identifiant ou mot de passe incorrect. (Démos autorisées: superadmin / admin123 ou teacher / teacher123)");
    }
  };

  const handleShortcutLogin = (role: UserRole, displayName: string) => {
    onLogin(role, displayName);
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
        <p className="text-xs text-slate-400 font-mono tracking-wider">PORTAIL SCOLAIRE INTÉGRÉ • SYSTEME PRO MAX v4.2</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl z-10 relative">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
          <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">Connexion Sécurisée</h2>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-500/20 text-red-200 rounded-lg text-xs leading-relaxed">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identifiant</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="Ex: superadmin, teacher..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="Saisissez votre mot de passe..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition active:scale-[98%] shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" /> S'authentifier
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-850 text-[10px] text-slate-400 text-center">
          Identifiants démo autorisés : <code className="text-indigo-400">superadmin / admin123</code> ou <code className="text-indigo-400">teacher / teacher123</code>
        </div>
      </div>

    </div>
  );
}
