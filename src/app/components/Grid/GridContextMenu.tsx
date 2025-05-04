import { Task } from "@/app/lib/types";
import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from "../ui/context-menu";
import TaskDelete from "./GridContextActions/TaskDelete";
import TaskEdit from "./GridContextActions/TaskEdit";

type Props = {
    task: Task | null;
    onCreateTask: (columnId: number, rowId: number) => void;
    col: number;
    row: number
}


const GridContextMenu = ({ task, onCreateTask, col, row }: Props) => {
    return <>
        <ContextMenuContent className="w-56">
            {task ? (
                <>
                    <TaskEdit task={task} />
                    <ContextMenuSeparator />
                    <TaskDelete task={task} />
                </>
            ) : (
                <ContextMenuItem onSelect={() => onCreateTask(col, row)}>
                    Create New Task Here
                </ContextMenuItem>
            )}
        </ContextMenuContent>
    </>
}

export default GridContextMenu