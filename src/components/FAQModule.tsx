import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Calendar, DollarSign, FileText } from "lucide-react";

export default function FAQModule() {
  const faqs = [
    {
      category: "Calendrier scolaire",
      icon: Calendar,
      questions: [
        { q: "Quelles sont les dates des congés trimestriels ?", a: "Les dates exactes sont publiées dans le calendrier scolaire officiel disponible dans la section Structure ou transmis via communication interne." },
        { q: "Comment voir les dates d'examens ?", a: "Les dates d'examens sont affichées dans votre espace élève/parent sous le module évalutions." }
      ]
    },
    {
      category: "Paiement des frais",
      icon: DollarSign,
      questions: [
        { q: "Quelles sont les méthodes de paiement acceptées ?", a: "Nous acceptons les virements bancaires, Mobile Money et les paiements directs au guichet de l'école." },
        { q: "Comment obtenir un reçu ?", a: "Un reçu numérique est généré automatiquement dans l'application après chaque versement enregistré par la comptabilité." }
      ]
    },
    {
      category: "Bulletins",
      icon: FileText,
      questions: [
        { q: "Comment récupérer mon bulletin ?", a: "Les bulletins sont accessibles dans votre profil élève au format PDF une fois validés par la direction." },
        { q: "Que faire en cas d'erreur sur le bulletin ?", a: "Veuillez contacter le secrétariat scolaire ou le titulaire de votre classe pour demander une rectification." }
      ]
    }
  ];

  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-indigo-500" />
        Foire aux Questions (FAQ)
      </h2>
      
      <div className="space-y-4">
        {faqs.map((cat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <cat.icon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-700">{cat.category}</h3>
            </div>
            <div className="space-y-2">
              {cat.questions.map((faq, qIdx) => (
                <div key={qIdx} className="border-t border-slate-100 pt-2">
                  <button
                    onClick={() => setOpenQuestion(openQuestion === faq.q ? null : faq.q)}
                    className="flex justify-between items-center w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
                  >
                    {faq.q}
                    {openQuestion === faq.q ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openQuestion === faq.q && (
                    <p className="text-xs text-slate-500 pb-2 pl-2">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
