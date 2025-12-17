import React, { useState, useRef, useEffect } from 'react';
import { sendMessageStreamToGemini } from '../services/geminiService';
import { ChatMessage, LoadingState } from '../types';

const GeminiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your Chromium OS build assistant. Ask me anything about building for the Acer R11 (Cyan).' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || loadingState !== 'idle') return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoadingState('loading');

    // Create a placeholder for the model response
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const stream = sendMessageStreamToGemini(userMsg);
      setLoadingState('streaming');
      
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.text = fullText;
          }
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'model') {
            lastMsg.text = "Error: Could not connect to Gemini API. Please check your network or API key.";
            lastMsg.isError = true;
        }
        return newMessages;
      });
    } finally {
      setLoadingState('idle');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`
          bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-80 md:w-96 mb-4 overflow-hidden
          transition-all duration-300 origin-bottom-right pointer-events-auto
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 hidden'}
        `}
        style={{ maxHeight: '600px', height: '70vh' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold">Build Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 h-[calc(100%-130px)]">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : msg.isError 
                        ? 'bg-red-900/50 text-red-200 border border-red-800 rounded-tl-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}
                `}
              >
                {msg.text || (loadingState === 'streaming' && idx === messages.length - 1 ? <span className="animate-pulse">...</span> : '')}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 absolute bottom-0 w-full">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the build..."
              disabled={loadingState !== 'idle'}
              className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || loadingState !== 'idle'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-cyan-500 hover:bg-cyan-400 text-white rounded-full p-4 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-110 active:scale-95 group"
        aria-label="Toggle AI Assistant"
      >
        <span className="absolute -top-2 -right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
        </span>
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default GeminiChat;