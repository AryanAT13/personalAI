"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, ShieldAlert, LogIn } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Get the Backend URL from the environment variable
  // If it's missing, fallback to localhost for safety
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Check if we are logged in (Google Auth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      setIsConnected(true);
      setMessages([{ role: "assistant", content: "Hello! I am connected to your Google Workspace. How can I help you today?" }]);
      
      // Clean the URL to look professional
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleLogin = () => {
    // --- FIX: USE DYNAMIC PRODUCTION URL ---
    window.location.href = `${API_URL}/auth/login`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // --- FIX: USE DYNAMIC PRODUCTION URL ---
      const res = await axios.post(`${API_URL}/chat`, {
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not reach the agent. Please check if the backend is awake." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-6 flex flex-col justify-between border-r border-gray-700">
        <div>
          <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Bot className="text-blue-400" /> ChiefAI
          </h1>
          <div className="space-y-4">
            <div className={`p-3 rounded-lg flex items-center gap-3 ${isConnected ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
              <ShieldAlert size={20} />
              <span className="text-sm font-medium">
                {isConnected ? "System Online" : "Disconnected"}
              </span>
            </div>
            
            {!isConnected && (
              <button
                onClick={handleLogin}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center justify-center gap-2 transition-all font-semibold"
              >
                <LogIn size={18} /> Connect Google
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Personal Agent v1.0<br/>Run on: Render/AWS
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <p>Ready to assist. Connect Google to start.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-2xl p-4 rounded-xl ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-gray-700 text-gray-200 rounded-bl-none border border-gray-600"
              }`}>
                <div className="flex items-center gap-2 mb-1 opacity-50 text-xs uppercase font-bold tracking-wider">
                  {msg.role === "user" ? <User size={12}/> : <Bot size={12}/>}
                  {msg.role}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 p-4 rounded-xl rounded-bl-none animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gray-800 border-t border-gray-700">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me to check emails, draft replies, or remember facts..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}