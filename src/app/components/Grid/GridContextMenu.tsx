import { Task } from "@/app/lib/types";
import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from "../ui/context-menu";
import TaskDelete from "./GridContextActions/TaskDelete";
import TaskEdit from "./GridContextActions/TaskEdit";
import { useTasks } from "@/app/functions/task";
import { useUserStore } from "@/app/store/userStore";

type Props = {
    task: Task | undefined;
    col: string | number; 
    row: number
}


const GridContextMenu = ({ task, col, row }: Props) => {
    const { createTask } = useTasks()
    const { currentUser } = useUserStore();
    
    const handleCreateTask = async (col: string | number, row: number) => {
        const newTask = {
            title: "New Task",
            state: "new",
            col_id: typeof col === 'string' ? col : undefined, 
            row: row,
        };
        await createTask(newTask);
    }

    if (!currentUser) return <>Log in again please</>;
    const isAdmin = currentUser.admin || false;

    return <>
        <ContextMenuContent className="w-56">
            {task ? (
                <>
                    <TaskEdit task={task} />
                    {isAdmin &&  <>
                        <ContextMenuSeparator />
                        <TaskDelete task={task} />
                    </>}
                </>
            ) : (
                <>
                {isAdmin && 
                    <ContextMenuItem onSelect={() => handleCreateTask(col, row)}>
                        Create New Task Here
                    </ContextMenuItem>}
                </>
            )}
        </ContextMenuContent>
    </>
}

export default GridContextMenu