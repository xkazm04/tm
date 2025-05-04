// Keep backend-compatible types separate if needed in the future
// export type TaskStateBackend = 'new' | 'assigned' | 'completed' | 'reviewed';
// export type TechnologyBackend = 'frontend' | 'backend' | 'llm';

// Frontend types used by components like TaskGrid
export type TaskState = 'new' | 'assigned' | 'completed' | 'reviewed';
export type Technology = 'frontend' | 'backend' | 'llm';

export interface User {
  id: string; 
  external_id?: string; 
  name: string;
  avatar?: string; 
  isAdmin?: boolean; 
  points: number; 
  role?: string; 
}

export interface Task {
  id: string;
  title: string; 
  state: string;
  assigned_to_id?: string;
  col: number;
  row: number;
  reference_url?: string;
  technology?: Technology;
  points?: number;
}

export interface Column {
  id: string; 
  title: string; 
}

export interface Column {
  id: string;
  title: string;
  locked: boolean; 
}
