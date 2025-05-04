import { Task, Technology } from "../lib/types";
import {Code2, Database, Brain, Gavel } from 'lucide-react';

export const getTechnologyIcon = (technology?: Technology) => {
  switch (technology) {
    case 'frontend': return <Code2 className="w-4 h-4 text-blue-400" aria-label="Frontend" />;
    case 'backend': return <Database className="w-4 h-4 text-green-400" aria-label="Backend" />;
    case 'fullstack': return <Gavel className="w-4 h-4 text-orange-400" aria-label="Fullstack" />;
    case 'llm': return <Brain className="w-4 h-4 text-purple-400" aria-label="LLM" />;
    default: return null;
  }
};

export const getTaskBackground = (task: Task) => {
  switch (task.state) {
    case 'assigned': return 'bg-secondary/80 hover:bg-secondary/90 focus-within:bg-secondary/95';
    case 'completed': return 'bg-muted/60 hover:bg-muted/70 focus-within:bg-muted/75';
    case 'reviewed': return 'bg-muted/40 hover:bg-muted/50 focus-within:bg-muted/55';
    case 'new':
    default: return 'bg-card hover:bg-secondary/60 focus-within:bg-secondary/70';
  }
};

export const getTaskBorder = (task: Task) => {
   switch (task.state) {
    case 'assigned': return 'border-blue-500/60 focus-within:border-blue-500/80';
    case 'completed': return 'border-gray-600/60 focus-within:border-gray-600/80';
    case 'reviewed': return 'border-gray-700/60 focus-within:border-gray-700/80';
    case 'new':
    default: return 'border-border focus-within:border-ring/50';
  }
};
