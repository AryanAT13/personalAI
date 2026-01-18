"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Send,
  Calendar,
  Mail,
  Aperture,
  BrainCircuit,
  LogOut,
  CheckCircle2,
  Zap,
  Clock
} from 'lucide-react';

const BACKEND_URL = "https://personal-ai-backend-qws2.onrender.com";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

function LandingPage() {
  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/login`;
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col">

      {/* GLASS NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/50 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg">
            <Aperture size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">Sentient</span>
        </div>
        <button
          onClick={handleLogin}
          className="px-5 py-2 cursor-pointer text-sm font-medium text-slate-700 hover:text-black hover:bg-white/50 rounded-full transition-all"
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

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-900 mb-6 leading-[0.95] py-4"
        >
          Your Second Brain.<br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 pr-2">
            Powered by Logic.
          </span>
        </motion.h1>

        {/* SUBTEXT - Fixed Alignment */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 max-w-2xl mb-12 leading-relaxed"
        >
          Stop managing your calendar and inbox manually.
          Let <span className="inline-block font-extrabold text-slate-900 border-b-4 border-indigo-200 px-1 mx-1">Sentient</span> handle the boring work so you can focus on building.
        </motion.p>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleLogin}
            className="group relative cursor-pointer inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-500/20"
          >
            <span>Initialize Agent</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* BENTO GRID FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl w-full text-left">
          <BentoCard
            icon={<Mail className="text-blue-600" />}
            title="Inbox Intelligence"
            desc="Autonomously drafts replies and surfaces what actually matters."
            delay={0}
          />
          <BentoCard
            icon={<Calendar className="text-orange-500" />}
            title="Time Sovereignty"
            desc="Protects your deep work hours and resolves scheduling conflicts."
            delay={0.1}
          />
          <BentoCard
            icon={<BrainCircuit className="text-purple-600" />}
            title="Infinite Context"
            desc="A memory that never fades. It recalls every detail, project, and preference."
            delay={0.2}
          />
        </div>
      </div>

      <div className="py-6 text-center text-slate-400 text-sm">
        <p>Built for Sentellent Hiring Challenge.</p>
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
      className="group relative bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden"
    >
      {/* Subtle Hover Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="font-bold text-xl mb-3 text-slate-900 tracking-tight">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </motion.div>
  );
}

// --- 2. CHAT INTERFACE (Clean & Modern) ---
function ChatInterface({ onLogout }: { onLogout: () => void }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey I’m Sentient, I’ve synced your Email and Calendar. What's the plan for today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [events, setEvents] = useState<any[]>([]);

  const fetchNextEvent = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/next-event`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Failed to fetch events");
    }
  };

  // Initial load
  useEffect(() => {
    fetchNextEvent();
  }, []);

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
      fetchNextEvent();
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-slate-900 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Aperture size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Sentient</span>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Quick Actions</p>
            <div className="space-y-2">
              <ActionButton icon={<Mail size={16} />} label="Summarize Inbox" onClick={() => setInput("Summarize my latest emails")} />
              <ActionButton icon={<Calendar size={16} />} label="Check Schedule" onClick={() => setInput("What's on my calendar today?")} />
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


        {/* UPCOMING EVENTS DASHBOARD (Fills remaining space) */}
        <div className="flex-1 mt-6 mb-6 bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden flex flex-col min-h-0">

          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <Clock size={12} className="text-indigo-500" />
              <span>Timeline</span>
            </div>
          </div>

          {/* Scrollable List */}
          <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar flex-1">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No upcoming events
              </div>
            ) : (
              events.map((evt, i) => (
                <div key={i} className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                  {/* Time Badge */}
                  <div className="flex-shrink-0 bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-2 rounded-lg min-w-[60px] text-center">
                    {evt.time}
                  </div>

                  {/* Event Details */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate leading-tight">
                      {evt.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      Google Calendar
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Decorative Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center cursor-pointer gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={18} /> Disconnect
        </button>
      </aside>

      {/* CHAT AREA */}
      <main className="flex-1 flex flex-col relative bg-[#F8FAFC]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <span className="font-bold text-lg">Sentient</span>
          <button onClick={onLogout}><LogOut size={20} className="text-slate-500" /></button>
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
                className={`max-w-[85%] md:max-w-2xl p-5 md:p-6 rounded-3xl text-[15px] md:text-base leading-7 shadow-sm ${msg.role === 'user'
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
            <div className="relative flex items-end bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-2 border border-slate-100">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Tell Sentient what you want handled, It'll take care of the rest...."
                className="w-full p-4 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 resize-none max-h-32 min-h-[60px]"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:scale-95 flex-shrink-0 mb-1 mr-1"
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
      className="w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}