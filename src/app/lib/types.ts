
export type TaskState = 'new' | 'assigned' | 'in_review' | 'reviewed' | 'completed';
export type Technology = 'frontend' | 'backend' | 'llm';

export interface User {
  id: string; 
  external_id?: string; 
  name: string;
  avatar?: string; 
  admin?: boolean; 
  points: number; 
  role?: string; 
}

export interface Task {
  id?: string;
  title: string; 
  state: string;
  assigned_to_id?: string;
  col?: number;
  row: number;
  reference_url?: string;
  technology?: Technology;
  points?: number;
  col_id?: string;
  serial_number?: number;
  serial_id?: string;
}

export interface Column {
  id: string; 
  title: string
  order?: number;
}
