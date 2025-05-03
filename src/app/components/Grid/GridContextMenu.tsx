import { Task, User } from "@/app/lib/types";
import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
} from "../ui/context-menu";
import { useTasks } from "@/app/functions/task";
import { toast } from "sonner";
import TaskDelete from "./GridContextActions/TaskDelete";
import TaskEdit from "./GridContextActions/TaskEdit";

type Props = {
    task: Task | null;
    onTaskContentChange: (taskId: string, content: string) => void;
    onSetUrl: (taskId: string, url: string | null) => void;
    currentUser: User;
    onTaskAction: (task: Task, action: 'assign' | 'unassign' | 'complete' | 'review') => void;
    onSetStoryPoints: (taskId: string, points: number | null) => void;
    onCreateTask: (columnId: string, rowId: string) => void;
    column: number;
    row: number
}


const GridContextMenu = ({ task, onTaskContentChange, onSetUrl, currentUser, onTaskAction,
    onSetStoryPoints, onCreateTask, column, row }: Props) => {

    const handleEditContent = () => {
        if (task) {
            const content = window.prompt('Edit task content:', task.title);
            if (content !== null) onTaskContentChange(task.id, content);
        }
    };

    const handleEditUrl = () => {
        if (task) {
            const url = window.prompt('Enter URL (or leave blank to remove):', task.url || '');
            if (url !== null) { // Handle cancel vs empty string
                onSetUrl(task.id, url.trim() === '' ? null : url.trim());
            }
        }
    }


    return <>
        <ContextMenuContent className="w-56">
            {task ? (
                <>
                    {/* Task Specific Actions */}
                    <ContextMenuItem
                        onSelect={handleEditContent}
                        disabled={!currentUser.isAdmin}
                    >
                        Edit Content
                    </ContextMenuItem>

                    <ContextMenuItem
                        onSelect={() => task.url && window.open(task.url, '_blank')}
                        disabled={!task.url}
                    >
                        Open Link
                    </ContextMenuItem>

                    <ContextMenuItem
                        onSelect={handleEditUrl}
                        disabled={!currentUser.isAdmin}
                    >
                        Set/Edit Link
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    {/* State Transitions */}
                    {task.state === 'new' && (
                        <ContextMenuItem onSelect={() => onTaskAction(task, 'assign')} disabled={task.locked}>
                            Assign to me
                        </ContextMenuItem>
                    )}
                    {task.state === 'assigned' && task.assignedTo?.id === currentUser.id && (
                        <>
                            <ContextMenuItem onSelect={() => onTaskAction(task, 'complete')} disabled={task.locked}>
                                Mark as Completed
                            </ContextMenuItem>
                            <ContextMenuItem onSelect={() => onTaskAction(task, 'unassign')} disabled={task.locked}>
                                Unassign from me
                            </ContextMenuItem>
                        </>
                    )}
                    {/* Admin/Owner can unassign */}
                    {task.state === 'assigned' && currentUser.isAdmin && task.assignedTo?.id !== currentUser.id && (
                        <ContextMenuItem onSelect={() => onTaskAction(task, 'unassign')} disabled={task.locked}>
                            Unassign User (Admin)
                        </ContextMenuItem>
                    )}
                    {currentUser.isAdmin && task.state === 'completed' && (
                        <ContextMenuItem onSelect={() => onTaskAction(task, 'review')} disabled={task.locked}>
                            Mark as Reviewed
                        </ContextMenuItem>
                    )}


                    <ContextMenuSeparator />

                    {/* Submenus for Tech & Points */}


                    {currentUser.isAdmin && (
                        <ContextMenuSub>
                            <ContextMenuSubTrigger disabled={task.locked}>Set Story Points</ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                {[1, 2, 3, 5, 8, 13].map(points => (
                                    <ContextMenuItem key={points} onSelect={() => onSetStoryPoints(task.id, points)}>
                                        {points} points
                                    </ContextMenuItem>
                                ))}
                                <ContextMenuSeparator />
                                <ContextMenuItem onSelect={() => onSetStoryPoints(task.id, null)}>Clear Points</ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                    )}
                    <TaskEdit task={task} />
                    <ContextMenuSeparator />
                    <TaskDelete task={task} />
                </>
            ) : (
                // Actions for Empty Cell
                <ContextMenuItem onSelect={() => onCreateTask(col, row)}>
                    Create New Task Here
                </ContextMenuItem>
            )}
        </ContextMenuContent>
    </>
}

export default GridContextMenu