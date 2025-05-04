import { useTasks } from "@/app/functions/task";
import { Task } from "@/app/lib/types";
import { toast } from "sonner";
import { ContextMenuItem } from "../../ui/context-menu";
import { useUserStore } from "@/app/store/userStore";

type Props = {
    task: Task;
}

const TaskDelete = ({task}: Props) => {
    const { deleteTask } = useTasks()
    const { currentUser } = useUserStore(); 

    const onDeleteTask = async (task: Task) => {
        if (!currentUser) return
        if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
            return;
        }
        if (!currentUser.admin) {
            toast("Only admins can delete tasks.");
            return;
        }
        try {
            if (!task.id) return
            await deleteTask(task.id);

            toast("The task has been successfully deleted.");
        } catch (err) {
            console.error("Error deleting task:", err);
            toast("Error deleting task. Please try again.");
        }
    };
    return <>
        <ContextMenuItem
            onSelect={() => onDeleteTask(task)}
            className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground" 
        >
            Delete Task
        </ContextMenuItem>
    </>
}

export default TaskDelete;