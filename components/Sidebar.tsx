import React from 'react';
import { GUIDE_CONTENT } from '../constants';

interface SidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, isOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onCloseMobile}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800 
          overflow-y-auto z-50 transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
               </svg>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Cyan Builder</h1>
          </div>

          <nav className="space-y-1">
            {GUIDE_CONTENT.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => {
                    onNavigate(section.id);
                    onCloseMobile();
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeSection === section.id 
                      ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                  `}
                >
                  {section.title}
                </button>
                
                {/* Render subsections in nav if active or parent is active (optional, kept simple here) */}
                {section.subSections && (
                  <div className="ml-4 mt-1 border-l border-slate-800 pl-2 space-y-1">
                    {section.subSections.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          onNavigate(sub.id);
                          onCloseMobile();
                        }}
                        className={`
                          w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors
                          ${activeSection === sub.id
                            ? 'text-cyan-400 font-semibold'
                            : 'text-slate-500 hover:text-slate-300'}
                        `}
                      >
                         {sub.title.replace(/^\d+\.\s*/, '')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-slate-900 to-transparent">
          <p className="text-xs text-slate-600">
            v1.0.0 &bull; ChromiumOS Overlay
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;