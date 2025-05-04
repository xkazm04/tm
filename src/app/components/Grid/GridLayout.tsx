'use client';
import { lazy, Suspense, useMemo } from 'react';
import { TooltipProvider } from '../ui/tooltip';
import GridColHeader from './GridColHeader';
import { Skeleton } from '../ui/skeleton';
import { useTasks } from '@/app/functions/task';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useCols } from '@/app/functions/columns';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useUserStore } from '@/app/store/userStore';
import { TaskState } from '@/app/lib/types';

const GridCell = lazy(() => import('./GridCell').then(module => ({ 
  default: module.GridCell 
})));

const CellSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.7 }}
    className="h-20"
  >
    <Skeleton className="h-full w-full" />
  </motion.div>
);

export function TaskGrid() {
  const { filters } = useUserStore();
  const { tasks, isLoading: tasksLoading, isError: tasksError, error: tasksErrorMsg } = useTasks();
  const { 
    cols, 
    isLoading: colsLoading, 
    isError: colsError, 
    error: colsErrorMsg, 
    updateCol,
    createCol
  } = useCols();

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // Filter by search text
      const matchesSearch = !filters.search || 
        task.title?.toLowerCase().includes(filters.search.toLowerCase()) 

      const matchesUser = !filters.userId || task.assigned_to_id === filters.userId;
      const matchesState = filters.states.includes(task.state as TaskState);
      
      return matchesSearch && matchesUser && matchesState;
    });
  }, [tasks, filters]);
  
  // Sort columns by order property
  const sortedColumns = useMemo(() => {
    if (!cols) return [];
    
    return [...cols].sort((a, b) => {
      // Handle undefined order values (place at the end)
      if (a.order === undefined) return 1;
      if (b.order === undefined) return -1;
      
      // Sort by order (ascending - lowest first)
      return a.order - b.order;
    });
  }, [cols]);

  const handleColumnTitleChange = (columnId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error('Column title cannot be empty');
      return;
    }
    
    updateCol({ 
      id: columnId, 
      data: { title: newTitle }
    }, {
      onSuccess: () => {
        toast.success('Column title updated');
      },
      onError: (error) => {
        console.error('Failed to update column title:', error);
        toast.error(`Failed to update column title: ${error.message}`);
      }
    });
  };

  const handleAddColumn = () => {
    // Calculate the next order value (max order + 1)
    const nextOrder = sortedColumns.length > 0 
      ? Math.max(...sortedColumns.map(col => col.order || 0)) + 1 
      : 0;

    createCol(`New column ${nextOrder}`, {
      onSuccess: () => {
        toast.success('New column added');
      },
      onError: (error) => {
        console.error('Failed to add column:', error);
        toast.error(`Failed to add column: ${error.message}`);
      }
    });
  };

  // Combined loading state
  if (tasksLoading || colsLoading) {
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
  if (tasksError || colsError) {
    const errorMessage = (tasksError ? (tasksErrorMsg as Error).message : '') || 
                         (colsError ? (colsErrorMsg as Error).message : '');
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading data: {errorMessage}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  // Set min-width based on available columns
  const gridMinWidth = `${sortedColumns.length * 180 + 60}px`; // Added extra space for the "Add column" button

  return (
    <div className="w-full overflow-x-auto relative">
      <TooltipProvider>
        <div style={{ minWidth: gridMinWidth }}>
          {/* Column Headers Row */}
          <div className="flex gap-1 sticky top-0 z-10 bg-background pb-1">
            {sortedColumns.map((column) => (
              <div key={column.id} className="w-[180px] min-w-[180px]">
                <GridColHeader
                  column={column}
                  onTitleChange={handleColumnTitleChange}
                />
              </div>
            ))}
            {/* Add Column Button */}
            <Button 
              variant="ghost" 
              className="h-10 w-10 rounded-full p-0 ml-2 mt-2"
              onClick={handleAddColumn}
              title="Add new column"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Grid Body - Each column is a vertical arrangement of cells */}
          <div className="flex gap-1">
            {sortedColumns.map((column, colIndex) => (
              <div key={`col-${column.id}`} className="flex flex-col gap-1 w-[180px] min-w-[180px]">
                {Array.from({ length: 10 }).map((_, row) => {
                  // Find task that matches this column and row using the new col_id field
                  // with fallback to the legacy col field for backwards compatibility
                  const task = filteredTasks.find(t => 
                    // First try to match by col_id (new approach)
                    (t.col_id === column.id || 
                    // Then fall back to the old approach (numeric position)
                    (t.col_id === undefined)) && 
                    t.row === row
                  );
                  
                  const itemIndex = row * sortedColumns.length + colIndex;

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
                          column={column.id}
                          row={row}
                          itemIndex={itemIndex}
                        />
                      </motion.div>
                    </Suspense>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
