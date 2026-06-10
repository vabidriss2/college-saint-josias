import React, { useState } from "react";
import { Send, Sparkles, User, Brain } from "lucide-react";

export default function AISidebarPanel() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Désolé, une erreur est survenue." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 p-4 text-white flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-yellow-300" />
        <div>
          <h3 className="font-bold">Assistant IA</h3>
          <p className="text-[10px] text-slate-400">Analyse contextuelle</p>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-10">
            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Posez une question sur les performances, la finance ou l'assiduité.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-indigo-100 text-indigo-900 ml-auto max-w-[80%]' : 'bg-slate-100 text-slate-800 mr-auto max-w-[80%]'}`}>
            {m.role === 'assistant' && <div className="text-[10px] font-bold text-slate-500 mb-1">IA Assistant</div>}
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400 italic">Analyse des données en cours...</div>}
      </div>
      <div className="p-4 border-t border-slate-100 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Ex: Quel est le taux de réussite..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
