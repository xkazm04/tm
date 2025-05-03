// These types mirror the Pydantic schemas defined in backend/schemas.py
// They are useful for type safety when making API calls from the frontend.

import type { TaskState, Technology } from './types'; // Import enums/types if needed

// --- User Schemas ---

export interface UserBase {
  external_id: string;
  name?: string | null;
  role?: string | null;
  admin?: boolean;
  points?: number;
}

export interface UserCreate extends UserBase {
  // No additional fields for creation in the backend schema
}

export interface UserUpdate {
  external_id?: string | null;
  name?: string | null;
  role?: string | null;
  admin?: boolean | null;
  points?: number | null;
}

// Represents the full User object returned by the API (matches backend User schema)
export interface User extends UserBase {
  id: string; // UUID as string
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

export interface TaskCreate extends TaskBase {
   // No additional fields for creation in the backend schema
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
