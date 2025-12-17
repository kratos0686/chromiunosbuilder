import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CodeBlock from './components/CodeBlock';
import GeminiChat from './components/GeminiChat';
import { GUIDE_CONTENT } from './constants';
import { Section } from './types';

function App() {
  const [activeSection, setActiveSection] = useState<string>(GUIDE_CONTENT[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigate = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Offset for sticky header if we had one, or general breathing room
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Setup intersection observer to update active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' } 
    );

    GUIDE_CONTENT.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
      section.subSections?.forEach(sub => {
        const subEl = document.getElementById(sub.id);
        if (subEl) observer.observe(subEl);
      })
    });

    return () => observer.disconnect();
  }, []);

  const renderSection = (section: Section, level: number = 1) => {
    const HeadingTag = level === 1 ? 'h2' : 'h3';
    
    return (
      <section 
        key={section.id} 
        id={section.id} 
        className={`scroll-mt-24 mb-16 ${level > 1 ? 'mt-8 border-l-2 border-slate-800 pl-6' : ''}`}
      >
        <HeadingTag className={`
          font-bold text-slate-100 mb-4 flex items-center gap-2
          ${level === 1 ? 'text-3xl border-b border-slate-800 pb-4' : 'text-xl text-cyan-100'}
        `}>
          {level === 1 && <span className="text-cyan-500">#</span>}
          {section.title}
        </HeadingTag>

        <div className="text-slate-300 leading-7 text-lg">
          {typeof section.content === 'string' ? <p>{section.content}</p> : section.content}
        </div>

        {section.codeBlocks?.map((block, idx) => (
          <CodeBlock key={idx} data={block} />
        ))}

        {section.subSections?.map(sub => renderSection(sub, level + 1))}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-slate-100">Cyan Builder Guide</span>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-300 hover:text-white"
        >
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
           </svg>
        </button>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 lg:px-16">
        {GUIDE_CONTENT.map(section => renderSection(section))}
        
        <div className="mt-20 pt-10 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>Generated for Acer Chromebook R11 (Cyan) Enthusiasts</p>
        </div>
      </main>

      <GeminiChat />
    </div>
  );
}

export default App;