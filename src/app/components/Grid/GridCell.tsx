'use client';

import { useEffect, useCallback, useState } from 'react';
import type { User, Task } from '../../lib/types';
import { cn } from '../..//lib/utils';
import { Star, Plus, Link as LinkIcon, Github, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useUsers } from '@/app/functions/user';
import { Avatar, AvatarFallback } from '../ui/avatar';
interface GridCellProps {
  task: Task | undefined;
  column: string | number; 
  row: number;
  itemIndex: number; 
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

// UserAvatar component that shows the first letter of the user's name
const UserAvatar = ({ userId }: { userId: string }) => {
  const { users } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    if (users && Array.isArray(users) && userId) {
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  }, [users, userId]);
  
  if (!user) return null;
  
  const initials = user.name ? user.name.charAt(0).toUpperCase() : '?';
  
  return (
    <Tooltip>
      <TooltipTrigger>
        <Avatar className="h-5 w-5 bg-primary/10 border border-primary/20">
          <AvatarFallback className="text-[10px] font-medium text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <p>Assigned to: {user.name}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export function GridCell({
  task,
  column,
  row,
  itemIndex,
}: GridCellProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate a task reference ID - either use serial_id if available or generate one from id
  const getTaskReference = useCallback(() => {
    if (!task) return '';
    if (task.serial_id) return task.serial_id;
    // If serial_id isn't available yet, create a reference from the UUID
    // Take first 8 characters from UUID
    return task.id ? `TM-${task.id.substring(0, 8)}` : '';
  }, [task]);
  
  // Copy task ID to clipboard
  const copyTaskIdToClipboard = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!task) return;
    
    const taskRef = getTaskReference();
    navigator.clipboard.writeText(taskRef).then(
      () => {
        setCopied(true);
        // Reset the copied state after 3 seconds
        setTimeout(() => setCopied(false), 3000);
      },
      () => console.error('Failed to copy task ID to clipboard')
    );
  }, [task, getTaskReference]);

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
              {/* User Avatar Overlay - Only for assigned tasks */}
              {task.state !== 'new' && task.assigned_to_id && (
                <div className="absolute z-10 -top-2 -right-2">
                  <UserAvatar userId={task.assigned_to_id} />
                </div>
              )}

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

                  {/* Task metrics and actions */}
                  <div className="flex gap-1.5 items-center">
                      {/* GitHub reference icon - only show for tasks with IDs */}
                      {task.id && (
                          <Tooltip>
                              <TooltipTrigger 
                                onClick={copyTaskIdToClipboard}
                                className="cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring rounded p-0.5"
                              >
                                <AnimatePresence mode="wait">
                                  {copied ? (
                                    <motion.div
                                      key="check"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="github"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Github className="w-3.5 h-3.5 text-gray-400 hover:text-gray-300" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{copied ? 'Copied!' : `Copy task ID: ${getTaskReference()}`}</p>
                              </TooltipContent>
                          </Tooltip>
                      )}

                      {/* Story points */}
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
          col={column}
          row={row}
          />

      </ContextMenu>
    </motion.div>
  );
}
