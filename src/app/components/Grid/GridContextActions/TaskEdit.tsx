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
import { useUserStore } from "@/app/store/userStore";

type Props = {
  task: Task;
}

type RowProps = {
  type: string;
  value: string | number;
  label: string;
}

const TaskEdit = ({ task }: Props) => {
  const { updateTask } = useTasks();
  const { currentUser } = useUserStore();

  const handleTaskUpdate = async (name: string, value: string | number) => {
    try {
      const data: Partial<Task> = {
        [name]: value
      };

      // For state transitions with assigned_to_id changes
      if (name === 'state') {
        if (value === 'assigned' && task.assigned_to_id === undefined) {
          data.assigned_to_id = currentUser?.id;
        } else if (value === 'new') {
          data.assigned_to_id = undefined;
        }
      }

      if (!task.id) return
      await updateTask({
        id: task.id,
        data: data,
      });

      toast.success(`Task updated successfully`);
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error(`Failed to update task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!currentUser) return <>Log in again please</>;
  const isAdmin = currentUser.admin || false;
  const isAssignedToMe = task.assigned_to_id === currentUser.id;

  const RowItem = ({ type, value, label }: RowProps) => {
    return <>
      {(isAssignedToMe || isAdmin) && (
        <ContextMenuItem onSelect={() => handleTaskUpdate(type, value)}>
          {label}
        </ContextMenuItem>
      )}
    </>
  }

  // Task state transitions UI based on current state
  const renderStateTransitionOptions = () => {
    switch (task.state) {
      case 'new':
        return (
          <ContextMenuItem onSelect={() => {
            handleTaskUpdate('state', 'assigned')
            handleTaskUpdate('assigned_to_id', currentUser.id);
          }}>
            Assign to me
          </ContextMenuItem>
        );

      case 'assigned':
        return (
          <>
            <RowItem type='state' value='in_review' label='Start Review (Create PR)' />
            <RowItem type='state' value='new' label='Unassign' />
          </>
        );

      case 'in_review':
        return (
          <>
            <RowItem type='state' value='assigned' label='Return to In Progress' />
            <RowItem type='state' value='reviewed' label='Mark as Reviewed' />
          </>
        );

      case 'reviewed':
        return (
          <>
            {isAdmin && (
              <ContextMenuItem onSelect={() => handleTaskUpdate('state', 'completed')}>
                Mark as Completed
              </ContextMenuItem>
            )}
            <RowItem type='state' value='in_review' label='Return to In Review' />
          </>
        );
      default:
        return null;
    }
  };

  return <>
    {isAdmin && <>
    <ContextMenuItem
      onSelect={() => {
        const content = window.prompt('Edit task title:', task.title);
        if (content !== null) handleTaskUpdate('title', content);
      }}
    >
      Edit Title
    </ContextMenuItem>

    <ContextMenuItem onSelect={
      () => {
        const url = window.prompt('Edit task link:', task.reference_url || '');
        if (url !== null) handleTaskUpdate('reference_url', url);
      }}>
      Edit Reference Link
    </ContextMenuItem>

    <ContextMenuSeparator />
    </>}

    {renderStateTransitionOptions()}

    

    {/* Admin/assigned user options */}
    {isAdmin && 
      <>
      <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Set Story Points</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {[1, 2, 3, 5, 8, 13].map(points => (
              <ContextMenuItem key={points} onSelect={() => handleTaskUpdate('points', points)}>
                {points} points
              </ContextMenuItem>
            ))}
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => handleTaskUpdate('points', '')}>Clear Points</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Set Technology</ContextMenuSubTrigger>
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
  </>
}

export default TaskEdit;