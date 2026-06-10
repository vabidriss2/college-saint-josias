import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";

export default function ChatbotModule() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 z-50 animate-bounce"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
          <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-300" /> Assistant IA Scolaire</h3>
            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[300px]">
             {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-indigo-100 text-indigo-900 ml-auto max-w-[80%]' : 'bg-slate-100 text-slate-800 mr-auto max-w-[80%]'}`}>
                   {m.text}
                </div>
             ))}
             {loading && <div className="text-xs text-slate-400 italic">L'assistant analyse...</div>}
          </div>
          <div className="p-4 border-t border-slate-100 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border rounded-lg text-sm"
              placeholder="Posez votre question sur les données..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="p-2 bg-indigo-600 text-white rounded-lg"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      )}
    </>
  );
}
