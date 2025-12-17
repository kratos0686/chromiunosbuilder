import React, { useState } from 'react';
import { CodeBlockData } from '../types';

interface CodeBlockProps {
  data: CodeBlockData;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
          {data.description || data.language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white transition-colors focus:outline-none"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          <code>{data.code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;