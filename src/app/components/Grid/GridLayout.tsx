'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User, Task, Column, TaskState, Technology } from '../../lib/types';
import { TooltipProvider } from '../ui/tooltip';
import { GridCell } from './GridCell';
import GridColHeader from './GridColHeader';
import { Skeleton } from '../ui/skeleton';
import { useTasks } from '@/app/functions/task';
import { toast } from 'sonner';

interface TaskGridProps {
  initialColumns: Column[];
  users: User[];
  currentUser: User;
  filters: {
    search: string;
    user: string; // User ID or name for filtering
    state: TaskState[]; // Array of task states to filter by
  };
}

// Helper function to convert API Task to UI Task
const mapApiTaskToUiTask = (apiTask: Task, users: User[]): Task => {
  const assignedUser = apiTask.assigned_to_id 
    ? users.find(u => u.id === apiTask.assigned_to_id)
    : undefined;

  return {
    id: apiTask.id!,
    title: apiTask.title,
    state: apiTask.state as TaskState || 'new',
    col: apiTask.col,
    row: apiTask.row,
    assigned_to_id: assignedUser,
    url: apiTask.url,
    technology: apiTask.technology as Technology | undefined,
    storyPoints: apiTask.storyPoints,
    locked: false // This could be controlled by business logic if needed
  };
};

export function TaskGrid({ initialColumns, filters, users, currentUser }: TaskGridProps) {
  // 1. Replace initialTasks with GET all route using useTasks hook
  const { 
    tasks: apiTasks, 
    isLoading, 
    isError, 
    error,
    updateTask: updateTaskApi,
    createTask: createTaskApi,
  } = useTasks({
    state: filters.state.length > 0 ? filters.state.join(',') : undefined,
    assigned_to: filters.user || undefined
  });

  // Internal state for UI updates before API calls
  const [columns, setColumns] = useState(initialColumns);
  
  // Convert API tasks to UI task format
  const tasks: Task[] = useMemo(() => {
    if (!Array.isArray(apiTasks)) return [];
    return apiTasks
      .map(apiTask => mapApiTaskToUiTask(apiTask, users))
      .filter(task => {
        // Apply search filter (other filters are applied at the API level)
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        return true;
      });
  }, [apiTasks, users, filters.search]);

  // --- Column Handlers ---
  const handleColumnTitleChange = (columnId: string, newTitle: string) => {
    // Basic validation
    if (newTitle.length > 0 && newTitle.length <= 30) {
      setColumns(currentColumns =>
        currentColumns.map(col =>
          col.id === columnId ? { ...col, title: newTitle } : col
        )
      );
      // Note: If you want to persist column changes to backend, add that here
    } else {
      toast("Column title must be between 1 and 30 characters.");
    }
  };

  // --- Task Handlers ---
  
  // 2. Unified task update handler that calls PUT/PATCH route
  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Convert UI task updates to API format
      const apiUpdates = mapUiUpdatesToApiUpdates(updates);
      
      // Call the API to update the task
      await updateTaskApi({
        id: taskId,
        data: apiUpdates
      });

      // Success toast notification
      toast("The task has been successfully updated.");
    } catch (err) {
      console.error("Error updating task:", err);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTaskContentChange = (taskId: string, newContent: string) => {
    // Basic validation
    if (newContent.length > 0 && newContent.length <= 50) {
      handleTaskUpdate(taskId, {title: newContent });
    } else {
      toast("Task content must be between 1 and 50 characters.");
    }
  };

  const handleTaskAction = async (task: Task, action: 'assign' | 'complete' | 'unassign' | 'review') => {
    let newState: TaskState = task.state;
    let newAssignedTo: User | undefined = task.assigned_to_id;

    switch (action) {
      case 'assign':
        if (task.state === 'new') {
          newState = 'assigned';
          newAssignedTo = currentUser;
        } else {
          toast("Task must be 'New' to be assigned.");
          return;
        }
        break;
      case 'complete':
        if (task.state === 'assigned' && task.assigned_to_id === currentUser.id) {
          newState = 'completed';
        } else {
          toast("Only the assigned user can complete the task.");
          return;
        }
        break;
      case 'unassign':
        // Allow admin or assigned user to unassign
        if (task.state === 'assigned' && (task.assignedTo?.id === currentUser.id || currentUser.isAdmin)) {
          newState = 'new';
          newAssignedTo = undefined;
        } else {
          toast("Only the assigned user or admin can unassign the task.");
          return;
        }
        break;
      case 'review':
        if (currentUser.isAdmin && task.state === 'completed') {
          newState = 'reviewed';
        } else {
          toast("Only admins can review completed tasks.");
          return;
        }
        break;
      default:
        return;
    }

    // Prepare updates for API
    await handleTaskUpdate(task.id, { 
      state: newState, 
      assigned_to_id: newAssignedTo 
    });
  };



  const handleSetStoryPoints = (taskId: string, points: number | null) => {
    if (currentUser.isAdmin) {
      handleTaskUpdate(taskId, { storyPoints: points ?? undefined });
    } else {
      toast("Only admins can set story points.");
    }
  };

  const handleSetUrl = (taskId: string, url: string | null) => {
    // Basic URL validation
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url; // Auto-prefix if needed
    }
    
    if (url && url.length > 2048) {
      toast("URL is too long. Maximum length is 2048 characters.");
      return;
    }

    handleTaskUpdate(taskId, { url: url ?? undefined });
  };

  // 3. HandleCreateTask will use POST route
  const handleCreateTask = async (column: number, row: number) => {
    const newTaskContent = window.prompt('Enter task content:');
    if (!newTaskContent || newTaskContent.trim().length === 0 || newTaskContent.length > 50) {
      toast("Task content must be between 1 and 50 characters.");
      return;
    }

    try {
      // Create the new task in the API
      await createTaskApi({
        title: newTaskContent.trim(),
        state: 'new',
        col: column,
        row: row
      });
      
      toast("The task has been successfully created.");
    } catch (err) {
      console.error("Error creating task:", err);
      toast("There was a problem creating the task. Please try again.")
    }
  };



  // Loading state
  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto relative">
        <div className="grid grid-cols-[repeat(20,minmax(150px,1fr))] gap-1">
          {Array.from({ length: 200 }).map((_, i) => (
            <Skeleton key={`task-skel-${i}`} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading tasks: {(error as Error).message}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  const gridMinWidth = `${columns.length * 180}px`;

  return (
    <div className="w-full overflow-x-auto relative">
      <TooltipProvider>
        <div style={{ minWidth: gridMinWidth }}>
          <div className="grid grid-cols-[repeat(20,minmax(150px,1fr))] gap-1 sticky top-0 z-10 bg-background pb-1">
            {columns.map((column) => (
              <GridColHeader
                key={column.id}
                column={column}
                currentUser={currentUser}
                onTitleChange={handleColumnTitleChange}
              />
            ))}
          </div>

          {/* Task Grid Area */}
          <div className="grid grid-cols-[repeat(20,minmax(150px,1fr))] gap-1">
            {Array.from({ length: 10 }).map((_, row) =>
              columns.map((column, colIndex) => {
                const task = tasks.find(t => t.col === colIndex && t.row === row);
                const itemIndex = row * columns.length + colIndex;

                return (
                  <GridCell
                    key={`${column.id}-${row}`}
                    task={task}
                    column={colIndex}
                    row={row}
                    itemIndex={itemIndex}
                    currentUser={currentUser}
                    users={users}
                    filters={filters}
                    onTaskAction={handleTaskAction}
                    onSetStoryPoints={handleSetStoryPoints}
                    onSetUrl={handleSetUrl}
                    onCreateTask={handleCreateTask}
                    onTaskContentChange={handleTaskContentChange}
                  />
                );
              })
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
