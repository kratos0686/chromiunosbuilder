import React from 'react';

export interface CodeBlockData {
  language: string;
  code: string;
  description?: string;
}

export interface Section {
  id: string;
  title: string;
  content: string | React.ReactNode;
  codeBlocks?: CodeBlockData[];
  subSections?: Section[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'streaming';