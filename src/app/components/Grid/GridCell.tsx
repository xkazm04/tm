'use client';

import type { User, Task } from '../../lib/types';
import { cn } from '../..//lib/utils';
import { Star, Plus, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  ContextMenu,
  ContextMenuTrigger,
} from "../ui/context-menu";
import GridContextMenu from './GridContextMenu';
import { getTaskBackground, getTaskBorder, getTechnologyIcon } from '@/app/helpers/gridVariables';

interface GridCellProps {
  task: Task | undefined;
  column: number;
  row: number;
  itemIndex: number; 
  currentUser: User;
  users: User[]; 
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ 
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.02,
      duration: 0.3,
      ease: "easeOut"
    },
  }),
};


export function GridCell({
  task,
  column,
  row,
  itemIndex,
  currentUser,
  users, 
}: GridCellProps) {

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={itemIndex} 
      className="contents" 
    >
      <ContextMenu>
        <ContextMenuTrigger
          className={cn(
              "h-20 p-1.5 border rounded-md relative group cursor-pointer transition-colors duration-150 flex flex-col justify-between outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", 
              task ? getTaskBackground(task) : "bg-background hover:bg-muted/30 focus-within:bg-muted/40", 
              task ? getTaskBorder(task) : 'border-dashed border-border/50 focus-within:border-ring/40' 
            )}
        >
          {task ? (
              <>
              <div className="text-sm font-medium text-foreground flex-grow overflow-hidden break-words px-1 pt-1">
                  {task.title}
              </div>
              <div className="flex justify-between items-center h-6 px-1 pb-0.5">
                  <div className="flex gap-1.5 items-center">
                      {task.technology && (
                          <Tooltip>
                              <TooltipTrigger>{getTechnologyIcon(task.technology)}</TooltipTrigger>
                              <TooltipContent><p>{task.technology}</p></TooltipContent>
                          </Tooltip>
                      )}
                      {task.reference_url && (
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <a href={task.reference_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="focus:outline-none focus:ring-1 focus:ring-ring rounded">
                                      <LinkIcon className="w-3.5 h-3.5 text-blue-400 hover:text-blue-300" />
                                  </a>
                              </TooltipTrigger>
                              <TooltipContent><p>{task.reference_url}</p></TooltipContent>
                          </Tooltip>
                      )}
                  </div>

                  {/* Story points */}
                  <div className="flex gap-1.5 items-center">
                      {task.points !== undefined && task.points !== null && (
                          <Tooltip>
                              <TooltipTrigger>
                                  <span className="text-xs text-yellow-400 flex items-center">
                                  <Star className="w-3 h-3 mr-0.5 fill-current" />
                                  {task.points}
                                  </span>
                              </TooltipTrigger>
                              <TooltipContent><p>{task.points} Story Point{task.points !== 1 ? 's' : ''}</p></TooltipContent>
                          </Tooltip>
                      )}
                  </div>
              </div>
              </>
            ) : (
              // Placeholder for empty cell
              <div className="h-full flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <Plus className="w-5 h-5" />
              </div>
            )}
        </ContextMenuTrigger>

        {/* Context Menu Content */}
        <GridContextMenu 
          task={task}
          currentUser={currentUser}
          users={users}
          column={column}
          row={row}
          />

      </ContextMenu>
    </motion.div>
  );
}
