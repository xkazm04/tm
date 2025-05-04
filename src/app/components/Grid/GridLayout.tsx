'use client';
import { useState, lazy, Suspense } from 'react';
import type { User, Column } from '../../lib/types';
import { TooltipProvider } from '../ui/tooltip';
import GridColHeader from './GridColHeader';
import { Skeleton } from '../ui/skeleton';
import { useTasks } from '@/app/functions/task';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Lazy load GridCell component
const GridCell = lazy(() => import('./GridCell').then(module => ({ 
  default: module.GridCell 
})));

// Cell loading fallback with motion animation
const CellSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.7 }}
    className="h-20"
  >
    <Skeleton className="h-full w-full" />
  </motion.div>
);

interface TaskGridProps {
  initialColumns: Column[];
  users: User[];
  currentUser: User;
}

export function TaskGrid({ initialColumns, users, currentUser }: TaskGridProps) {
  const { tasks, isLoading, isError, error } = useTasks();
  const [columns, setColumns] = useState(initialColumns);
  

  const handleColumnTitleChange = (columnId: string, newTitle: string) => {
    if (newTitle.length > 0 && newTitle.length <= 30) {
      setColumns(currentColumns =>
        currentColumns.map(col =>
          col.id === columnId ? { ...col, title: newTitle } : col
        )
      );
    } else {
      toast("Column title must be between 1 and 30 characters.");
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

          <div className="grid grid-cols-[repeat(20,minmax(150px,1fr))] gap-1">
            {Array.from({ length: 10 }).map((_, row) =>
              columns.map((column, colIndex) => {
                const task = tasks.find(t => t.col === colIndex && t.row === row);
                const itemIndex = row * columns.length + colIndex;

                return (
                  <Suspense key={`${column.id}-${row}-suspense`} fallback={<CellSkeleton />}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: itemIndex * 0.02 }}
                    >
                      <GridCell
                        key={`${column.id}-${row}`}
                        task={task}
                        column={colIndex}
                        row={row}
                        itemIndex={itemIndex}
                        currentUser={currentUser}
                        users={users}
                      />
                    </motion.div>
                  </Suspense>
                );
              })
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
