import { useTasks } from "@/app/functions/task";
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "../../ui/context-menu";
import { Task } from "@/app/lib/types";
import { toast } from "sonner";

type Props = {
  task: Task;
}

const TaskEdit = ({ task }: Props) => {
  const { updateTask } = useTasks()

  const handleTaskUpdate = async (name: string, value: string) => {
    try {
      const filledName = name
      const filledValue = value

      await updateTask({
        id: task.id,
        data: { filledName, filledValue },
      });

      toast("The task has been successfully updated.");
    } catch (err) {
      console.error("Error updating task:", err);
      toast("There was a problem updating the task. Please try again.");
    }
  };

  return <>
    <ContextMenuItem
      onSelect={() => {
        const content = window.prompt('Edit task content:', task.title);
        if (content !== null) handleTaskUpdate('title', content);
      }}
    >
      Edit Content
    </ContextMenuItem>

    <ContextMenuItem
      onSelect={() => task.reference_url && window.open(task.reference_url, '_blank')}
      disabled={!task.reference_url}
    >
      Open Link
    </ContextMenuItem>
    <ContextMenuItem onSelect={
      () => {
        const url = window.prompt('Edit task link:', task.reference_url || '');
        if (url !== null) handleTaskUpdate('url', url);
      }}>
      Set/Edit Link
    </ContextMenuItem>

    <ContextMenuSeparator />

    {/* State Transitions */}
    {task.state === 'new' && (
      <ContextMenuItem onSelect={() => handleTaskUpdate('state', 'assign')}>
        Assign to me
      </ContextMenuItem>
    )}
    {task.state === 'assigned' && task.assigned_to_id === currentUser.id && (
      <>
        <ContextMenuItem onSelect={() => handleTaskUpdate('state', 'complete')}>
          Mark as Completed
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => handleTaskUpdate('state', 'unassign')}>
          Unassign from me
        </ContextMenuItem>
      </>
    )}
    {/* Admin/Owner can unassign */}
    {task.state === 'assigned' && task.assigned_to_id !== currentUser.id && (
      <ContextMenuItem onSelect={() => handleTaskUpdate('state', 'unassign')}>
        Unassign User (Admin)
      </ContextMenuItem>
    )}
    {task.state === 'completed' && (
      <ContextMenuItem onSelect={() => handleTaskUpdate('state', 'review')}>
        Mark as Reviewed
      </ContextMenuItem>
    )}


    <ContextMenuSeparator />

    {/* Submenus for Tech & Points */}


    {currentUser.isAdmin && (
      <ContextMenuSub>
        <ContextMenuSubTrigger>Set Story Points</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {[1, 2, 3, 5, 8, 13].map(points => (
            <ContextMenuItem key={points} onSelect={() => handleTaskUpdate('points', points)}>
              {points} points
            </ContextMenuItem>
          ))}
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => handleTaskUpdate('points', '0')}>Clear Points</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    )}
    <ContextMenuSub>
      <ContextMenuSubTrigger disabled={!currentUser.isAdmin}>Set Technology</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem onSelect={() => handleTaskUpdate('technology', 'frontend')}>Frontend</ContextMenuItem>
        <ContextMenuItem onSelect={() => handleTaskUpdate('technology', 'backend')}>Backend</ContextMenuItem>
        <ContextMenuItem onSelect={() => handleTaskUpdate('technology', 'llm')}>LLM</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => handleTaskUpdate('technology', '')}>Clear Technology</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </>
}

export default TaskEdit;