import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: any) => void;
  apiKey?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, onApply, apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
        // Safe access to process.env.API_KEY
        const key = typeof process !== 'undefined' && process.env && process.env.API_KEY ? process.env.API_KEY : '';
        const ai = new GoogleGenAI({ apiKey: key });
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an expert Excel assistant.
          Task: ${prompt}
          
          If the user asks for data (e.g. "create a table of 5 planets"), respond ONLY with a JSON array of arrays (rows).
          Example: [["Name", "Type"], ["Earth", "Planet"]]
          
          If the user asks for a formula (e.g. "sum of column A"), respond ONLY with the formula string.
          Example: =SUM(A:A)
          
          If the user asks a question, just answer text.
          
          Do not include markdown formatting (like \`\`\`json). Just raw content.`,
        });

        const text = response.text ? response.text.trim() : "";
        
        // Try to parse as JSON for data insertion
        let handled = false;
        try {
            const json = JSON.parse(text);
            if (Array.isArray(json)) {
                onApply({ type: 'data', data: json });
                setResult("Data generated and applied to the sheet.");
                handled = true;
            }
        } catch (e) {
            // Not JSON, continue
        }

        if (!handled) {
             // Check if it's a formula
            if (text.startsWith('=')) {
                onApply({ type: 'formula', formula: text });
                setResult(`Formula generated: ${text}`);
            } else {
                setResult(text);
            }
        }

    } catch (e: any) {
        console.error(e);
        setResult(`Error: ${e.message || "Failed to generate content"}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                <Sparkles size={18} />
                <span>AI Copilot</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X size={16} />
            </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto min-h-[120px]">
            {result ? (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                    {result}
                </div>
            ) : (
                <div className="text-center text-slate-400 py-8 text-sm">
                    <Sparkles size={32} className="mx-auto mb-3 opacity-20" />
                    <p>Ask me to generate tables, formulas, or explain data.</p>
                </div>
            )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100 bg-white">
            <div className="relative">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                    placeholder="e.g. Create a budget for a startup..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    autoFocus
                    disabled={loading}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;