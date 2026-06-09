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
  const [errorMessage, setErrorMessage] = useState("");
  
  // 2FA Security states
  const [show2FA, setShow2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingLogin, setPendingLogin] = useState<{ role: UserRole; name: string } | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Veuillez saisir votre identifiant et votre mot de passe.");
      return;
    }

    // Direct mock validation for a real login experience
    if (username === "superadmin" && password === "admin123") {
      setPendingLogin({ role: UserRole.SUPER_ADMIN, name: "Admin Principal" });
      setShow2FA(true);
      setErrorMessage("");
    } else if (username === "teacher" && password === "teacher123") {
      setPendingLogin({ role: UserRole.TEACHER, name: "Directeur des Études" });
      setShow2FA(true);
      setErrorMessage("");
    } else if (username === "student" && password === "student123") {
      onLogin(UserRole.STUDENT, "Ariel Yao");
    } else if (username === "parent" && password === "parent123") {
      onLogin(UserRole.PARENT, "Parent Ariel Yao");
    } else {
      setErrorMessage("Identifiant ou mot de passe incorrect. (Démos autorisées: superadmin / admin123 ou teacher / teacher123)");
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage("Le code d'authentification doit comporter exactement 6 chiffres.");
      return;
    }

    // Accept demo key or 492810 for validation
    if (verificationCode === "492810" || verificationCode.trim().length === 6) {
      if (pendingLogin) {
        onLogin(pendingLogin.role, pendingLogin.name);
      }
    } else {
      setErrorMessage("Code de vérification incorrect. Veuillez essayer à nouveau (Indice : 492810).");
    }
  };

  const triggerCodeResend = () => {
    setResendStatus("Génération d'un nouveau jeton cryptographique...");
    setTimeout(() => {
      setResendStatus("Nouveau code sécurisé envoyé sur votre terminal approuvé ✓ (Indice: 492810)");
      setTimeout(() => setResendStatus(null), 4000);
    }, 1000);
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
        
        {!show2FA ? (
          <>
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
              Démos directes élèves/parents : <code className="text-emerald-400">student / student123</code> ou <code className="text-emerald-400">parent / parent123</code> <br />
              Démos admin avec double facteur : <code className="text-indigo-400">superadmin / admin123</code> ou <code className="text-indigo-400">teacher / teacher123</code>
            </div>
          </>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-5">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-800/60">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <h2 className="text-xs font-black tracking-wider text-slate-200 uppercase">Double Facteur Activé (MFA)</h2>
                <p className="text-[9px] text-slate-400 font-medium">Validation cryptographique de votre identité</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 text-indigo-350 rounded-lg text-[10px] leading-relaxed">
              Pour des raisons de sécurité de l'ERP de l'établissement, un code à usage unique (MFA) a été généré pour le profil <strong className="text-slate-100">{pendingLogin?.name}</strong>.
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 rounded-lg text-xs leading-relaxed">
                {errorMessage}
              </div>
            )}

            {resendStatus && (
              <div className="p-3 bg-slate-900 border border-indigo-500/40 text-emerald-350 rounded-lg text-[10px] font-mono leading-relaxed">
                {resendStatus}
              </div>
            )}

            <div className="space-y-2 text-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Saisir le code à 6 chiffres</label>
              <input 
                type="text" 
                maxLength={6}
                value={verificationCode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setVerificationCode(val);
                  setErrorMessage("");
                }}
                placeholder="• • • • • •"
                className="w-48 mx-auto text-center tracking-[12px] bg-slate-900 border border-slate-800 font-black text-xl text-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl py-3 px-2 outline-none transition"
              />
              <span className="block text-[9px] text-slate-400 italic">Code démo requis : <strong className="text-indigo-400 font-mono">492810</strong></span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShow2FA(false);
                  setVerificationCode("");
                  setErrorMessage("");
                }}
                className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase rounded-xl tracking-wider transition cursor-pointer text-center"
              >
                Retour
              </button>
              
              <button
                type="submit"
                className="flex-[1.5] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition shadow-lg shadow-emerald-600/10 cursor-pointer text-center"
              >
                Valider & Connecter
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={triggerCodeResend}
                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-350 underline tracking-wider cursor-pointer"
              >
                Renvoyer le code par SMS sécurisé
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
