import { clickupService } from "@/app/functions/clickup";
import { useCols } from "@/app/functions/columns";
import { useTasks } from "@/app/functions/task";
import { useUsers } from "@/app/functions/user";
import { Column, Task } from "@/app/lib/types";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";

const CopilotComponent = () => {
    const { tasks, updateTask } = useTasks();
    const { cols } = useCols();
    const { users } = useUsers();

    const getListId = async (colId: string) => {
        // If cols already loaded, use them directly
        if (cols && cols.length > 0) {
            const column = cols.find(col => col.id === colId);
            return column?.clickup_list_id || null;
        }

        // Otherwise fetch columns from API directly
        try {
            const response = await fetch('/api/columns');
            if (!response.ok) {
                throw new Error('Failed to fetch columns');
            }
            const allColumns = await response.json();
            const column = allColumns.find((col: Column) => col.id === colId);
            return column?.clickup_list_id || null;
        } catch (error) {
            console.error('Error fetching columns:', error);
            return null;
        }
    }

    const handleCreateTask = async (task: Task, taskDescription?: string) => {
        if (task.clickup_sync) {
            console.log("Task already synced with ClickUp");
            return;
        }

        if (!task.col_id) {
            console.log("Cannot sync task - no column ID found");
            return;
        }
        const listId = await getListId(task.col_id);

        if (!listId) {
            console.log("Cannot sync task - no ClickUp list ID found for this column");
            return;
        }

        if (!process.env.NEXT_PUBLIC_CLERK_CUSTOM_ID) {
            console.log("Cannot sync task - no custom field ID found");
            return;
        }
        await clickupService.clickupTask(listId, {
            name: task.title,
            tags: [task.technology || "fullstack"],
            description: taskDescription || "",
            priority: task.priority && 1 || 3,
            custom_fields: [
                {
                    id: process.env.NEXT_PUBLIC_CLERK_CUSTOM_ID, value: task.serial_id || ""
                },
            ],
        })

        const data: Partial<Task> = {
            'clickup_sync': true
        };

        await updateTask({
            id: task.id,
            data: data,
        });
    }

    useCopilotChatSuggestions({
        maxSuggestions: 2,
        minSuggestions: 1,
        instructions: `Give the user 3 options at the start of the conversation: 
    'List unassigned frontend tasks', 
    'How many users are in the project?'. 
    Only show these initial options. Refer to 'serial_id' as 'ID' and 'clickup_sync' as 'synced with ClickUp'.`,
    })

    useCopilotChatSuggestions({
        maxSuggestions: 1,
        minSuggestions: 1,
        instructions: `
    ONLY IF the user has just been shown the list of tasks OR asks about syncing a task:
    1. Suggest 'Sync a task with ClickUp'.
    2. If the user confirms they want to sync, THEN ask them to provide the 'serial_id' or 'title' of the task from the list.
    3. Once the user provides the ID, the 'syncClickupTask' action should be called.
    Do NOT suggest syncing otherwise.
    `,
    })

    useCopilotAction({
        name: "getTaskDetailFromClickup",
        description: "Fetches task details from ClickUp based on the provided task ID.",
    })


    useCopilotReadable({
        description: "List of project tasks",
        value: tasks,
    })

    useCopilotReadable({
        description: "List of project users",
        value: users,
    })

    useCopilotAction({
        name: "syncClickupTask",
        description: "Syncs a specific task from the application list with ClickUp based on its ID.", // Updated description
        parameters: [
            {
                name: "taskId",
                type: "string",
                description: "The unique serial_id of the task to sync with ClickUp. This should only be requested AFTER the user confirms they want to sync a task.", // Updated description
                required: true,
            },
            {
                name: "taskDescription",
                type: "string",
                description: "Optional description to generate basic template for the task.",
                required: false,
            }
        ],
        handler: async ({ taskId }) => {
            console.log("Syncing task with ClickUp, Task ID:", taskId);
            const taskToSync = tasks.find(task => task.serial_id === taskId);

            if (taskToSync) {
                if (taskToSync.clickup_sync) {
                    console.log(`Task "${taskToSync.title}" (ID: ${taskId}) is already synced.`);
                    return `Task "${taskToSync.title}" (ID: ${taskId}) is already synced with ClickUp.`;
                }
                await handleCreateTask(taskToSync);
                return `Task "${taskToSync.title}" (ID: ${taskId}) has been successfully synced with ClickUp.`;
            } else {
                console.error("Task with ID not found:", taskId);
                return `Error: Task with ID ${taskId} not found. Please provide a valid ID from the task list.`;
            }
        }
    });

    return <main style={
        {
            "--copilot-kit-primary-color": "var(--primary)",
            "--copilot-kit-contrast-color": "var(--primary-foreground)",
            "--copilot-kit-background-color": "var(--sidebar)",
            "--copilot-kit-input-background-color": "var(--input)",
            "--copilot-kit-secondary-color": "var(--sidebar-accent)",
            "--copilot-kit-secondary-contrast-color": "var(--sidebar-accent-foreground)",
            "--copilot-kit-separator-color": "var(--sidebar-border)",
            "--copilot-kit-muted-color": "var(--muted-foreground)",
            "--copilot-kit-shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            "--copilot-kit-shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            "--copilot-kit-shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            "--copilot-kit-dev-console-bg": "var(--card)",
            "--copilot-kit-dev-console-text": "var(--card-foreground)"
        } as CopilotKitCSSProperties
    }>
        <CopilotSidebar
            clickOutsideToClose={false}
            defaultOpen={true}
            labels={{
                title: "AI Assistant",
                initial: 'Hi, welcome to the TaskMajster AI. How can I help you today?',
                stopGenerating: "Stop",
            }}
        />
    </main>
}

export default CopilotComponent;