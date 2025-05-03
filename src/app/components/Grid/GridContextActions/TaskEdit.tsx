import { useTasks } from "@/app/functions/task";
import {
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
} from "../../ui/context-menu";
import { Task, Technology } from "@/app/lib/types";
import { toast } from "sonner";

type Props = {
    task: Task;
}

const TaskEdit = ({ task }: Props) => {
    const { updateTask } = useTasks()
      const handleTaskUpdate = async (taskId: string, value: string) => {
        try {
          // Convert UI task updates to API format
          const filedName = 'technology';
          const filedValue = value
          
          // Call the API to update the task
          await updateTask({
            id: taskId,
            // data: apiUpdates
          });
    
          // Success toast notification
          toast("The task has been successfully updated.");
        } catch (err) {
          console.error("Error updating task:", err);
          toast("There was a problem updating the task. Please try again.");
        }
      };

    return <>
        <ContextMenuSub>
            <ContextMenuSubTrigger disabled={!currentUser.isAdmin}>Set Technology</ContextMenuSubTrigger>
            <ContextMenuSubContent>
                <ContextMenuItem onSelect={() => handleTaskUpdate(task.id, 'frontend')}>Frontend</ContextMenuItem>
                <ContextMenuItem onSelect={() => handleTaskUpdate(task.id, 'backend')}>Backend</ContextMenuItem>
                <ContextMenuItem onSelect={() => handleTaskUpdate(task.id, 'llm')}>LLM</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onSelect={() => handleTaskUpdate(task.id, null)}>Clear Technology</ContextMenuItem>
            </ContextMenuSubContent>
        </ContextMenuSub>
    </>
}

export default TaskEdit;