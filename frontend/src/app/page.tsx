"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Send, 
  Calendar, 
  Mail, 
  BrainCircuit,
  LogOut,
  CheckCircle2,
  Zap,
  Clock
} from 'lucide-react';

// --- CONFIG ---
const BACKEND_URL = "https://personal-ai-backend-qws2.onrender.com"; // Your Render URL

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check auth on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/");
      setIsAuthenticated(true);
    } else if (localStorage.getItem("token")) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <main className="min-h-screen relative font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {isAuthenticated ? (
        <ChatInterface onLogout={() => {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }} />
      ) : (
        <LandingPage />
      )}
    </main>
  );
}

// --- 1. LANDING PAGE (Aesthetic: "Light & Glowy") ---
function LandingPage() {
  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/login`;
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col">
      
      {/* BACKGROUND GLOW BLOBS */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
         <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
         <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-[30%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* GLASS NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/50 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg">
            <BrainCircuit size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">Sentient.</span>
        </div>
        <button 
          onClick={handleLogin}
          className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-white/50 rounded-full transition-all"
        >
          Sign In
        </button>
      </nav>

      {/* HERO SECTION */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-32 pb-20">
        
        {/* PILL BADGE */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 shadow-sm rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">System Online v1.0</span>
        </motion.div>

        {/* MAIN HEADING */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-900 mb-6 leading-[0.95]"
        >
          Your Second Brain.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient">
            Powered by Logic.
          </span>
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-500 max-w-2xl mb-12 leading-relaxed"
        >
          Stop managing your calendar and inbox manually. 
          Let <span className="text-slate-900 font-semibold">Sentient</span> handle the boring work so you can focus on building.
        </motion.p>

        {/* CTA BUTTON */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={handleLogin}
            className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-500/20"
          >
            <span>Initialize Agent</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* BENTO GRID FEATURES */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl w-full text-left"
        >
          <BentoCard 
            icon={<Mail className="text-blue-600" />}
            title="Inbox Zero"
            desc="Reads, summarizes, and drafts replies. It knows your writing style."
            delay={0}
          />
          <BentoCard 
            icon={<Calendar className="text-orange-500" />}
            title="Time Keeper"
            desc="Manages schedule conflicts and creates events across timezones."
            delay={0.1}
          />
          <BentoCard 
            icon={<BrainCircuit className="text-purple-600" />}
            title="Active Memory"
            desc="Remembers your projects, preferences, and constraints forever."
            delay={0.2}
          />
        </motion.div>
      </div>

      <div className="py-6 text-center text-slate-400 text-sm">
        <p>Built for the Future Hackathon 2026</p>
      </div>
    </div>
  );
}

function BentoCard({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + delay }}
      className="bg-white/70 backdrop-blur-md border border-white/50 p-8 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
    >
      <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}

// --- 2. CHAT INTERFACE (Clean & Modern) ---
function ChatInterface({ onLogout }: { onLogout: () => void }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "System Online. I'm connected to your Gmail and Calendar. What's the plan for today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error connecting to neural core. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-slate-900 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <BrainCircuit size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Sentient.</span>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Quick Actions</p>
            <div className="space-y-2">
              <ActionButton icon={<Mail size={16}/>} label="Summarize Inbox" onClick={() => setInput("Summarize my latest emails")} />
              <ActionButton icon={<Calendar size={16}/>} label="Check Schedule" onClick={() => setInput("What's on my calendar today?")} />
              <ActionButton icon={<Zap size={16}/>} label="Draft Update" onClick={() => setInput("Draft a project update email")} />
            </div>
          </div>
          
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">System Status</p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Gmail Connected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Calendar Connected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Memory Active</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={18} /> Disconnect
        </button>
      </aside>

      {/* CHAT AREA */}
      <main className="flex-1 flex flex-col relative bg-[#F8FAFC]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
           <span className="font-bold text-lg">Sentient.</span>
           <button onClick={onLogout}><LogOut size={20} className="text-slate-500"/></button>
        </div>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8">
          {messages.map((msg, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 mt-1 shadow-sm">
                  <Sparkles size={14} className="text-indigo-500" />
                </div>
              )}
              
              <div 
                className={`max-w-[85%] md:max-w-2xl p-5 md:p-6 rounded-3xl text-[15px] md:text-base leading-7 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-br-none shadow-indigo-500/10' 
                    : 'bg-white border border-slate-200/60 text-slate-700 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start ml-11">
               <div className="bg-white border border-slate-200 px-5 py-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-30 transition duration-500 blur-md"></div>
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-2 border border-slate-100">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask Sentient to draft an email or check your calendar..."
                className="w-full p-4 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
              <button 
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:scale-95 flex-shrink-0"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <p className="text-center text-xs font-medium text-slate-400 mt-4">
            Press Enter to send. AI handles data with strict privacy.
          </p>
        </div>
      </main>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}