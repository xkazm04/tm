
import type { Column, Task, User, TaskState, Technology } from '../lib/types';
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomOptionalElement = <T,>(arr: T[]): T | undefined => Math.random() > 0.5 ? getRandomElement(arr) : undefined;

export const users: User[] = [
  { id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', name: 'Alice Chen', avatar: 'https://picsum.photos/seed/alice/40/40', isAdmin: true, points: 120 },
  { id: '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', name: 'Bob Smith', avatar: 'https://picsum.photos/seed/bob/40/40', isAdmin: false, points: 85 },
  { id: '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c', name: 'Carol Davis', avatar: 'https://picsum.photos/seed/carol/40/40', isAdmin: false, points: 95 },
  { id: '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d', name: 'David Lee', avatar: 'https://picsum.photos/seed/david/40/40', isAdmin: false, points: 50 },
  { id: '5e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e', name: 'Eve Martinez', avatar: 'https://picsum.photos/seed/eve/40/40', isAdmin: false, points: 70 },
];

const NUM_COLUMNS = 10;
const NUM_ROWS = 10; 
const NUM_TASKS = 50; 

export const initialColumns: Column[] = Array.from({ length: NUM_COLUMNS }, (_, i) => ({
  // id: uuidv4(), // Use UUID if needed, simple string sufficient for demo
  id: `col-${i}`,
  title: `Feature ${i + 1}`,
  locked: Math.random() > 0.8, // Randomly lock some columns
}));

const possibleStates: TaskState[] = ['new', 'assigned', 'completed', 'reviewed'];
const possibleTech: Technology[] = ['frontend', 'backend', 'llm'];
const possibleStoryPoints: number[] = [1, 2, 3, 5, 8, 13];

export const initialTasks: Task[] = Array.from({ length: NUM_TASKS }, (_, i) => {
  const state = getRandomElement(possibleStates);
  const assignedUser = (state === 'assigned' || state === 'completed' || state === 'reviewed') ? getRandomElement(users) : undefined;
  const points = (state === 'reviewed' && assignedUser) ? getRandomElement(possibleStoryPoints) : getRandomOptionalElement(possibleStoryPoints);

  // Ensure tasks don't overlap initially
  const col = i % NUM_COLUMNS;
  const row = Math.floor(i / NUM_COLUMNS);

  return {
    // id: uuidv4(), // Use UUID if needed
    id: `task-${i}`,
    content: `Implement Task ${i + 1}`,
    state: state,
    locked: Math.random() > 0.9, // Randomly lock some tasks (less frequent)
    assignedTo: assignedUser,
    column: col,
    row: row,
    url: Math.random() > 0.7 ? `https://example.com/task/${i}` : undefined,
    technology: getRandomOptionalElement(possibleTech),
    storyPoints: points,
  };
});
