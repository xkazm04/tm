//eslint-disable @typescript-eslint/no-empty-interface
import { User, TaskState, Technology } from './types';

// --- User Schemas ---

export interface UserCreate {
  external_id: string;
  name?: string | null;
  role?: string | null;
  admin?: boolean;
  points?: number;
}

// --- Task Schemas ---

export interface TaskBase {
  title: string;
  state?: TaskState;
  assigned_to_id?: string | null; // UUID as string
  column: number;
  row: number;
  reference_url?: string | null;
  technology?: Technology | null;
  points?: number | null;
}

export interface TaskUpdate {
  title?: string | null;
  state?: TaskState | null;
  assigned_to_id?: string | null;
  column?: number | null;
  row?: number | null;
  reference_url?: string | null;
  technology?: Technology | null;
  points?: number | null;
}

// Represents the full Task object returned by the API (matches backend Task schema)
export interface Task extends TaskBase {
  id: string; // UUID as string
  assigned_user?: User | null; // Nested User object
}
