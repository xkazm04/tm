'use client';

import { useEffect, useState } from "react";
import { useUser, useUsers } from "../functions/user";
import { useTask, useTasks } from "../functions/task";
import { Task } from "../lib/types";



// Users list component
export function UsersList() {
  const { users, isLoading, isError, error } = useUsers();

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name || user.external_id}</li>
      ))}
    </ul>
  );
}

// Single user component
export function UserDetail({ id }: { id: string }) {
  const { data: user, isLoading, isError, error } = useUser(id);

  if (isLoading) return <div>Loading user...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>Role: {user?.role}</p>
      <p>Points: {user?.points}</p>
    </div>
  );
}

// Tasks list with filtering
export function TasksList() {
  const [filters, setFilters] = useState({ state: 'new' });
  const { tasks, isLoading, isError, error } = useTasks(filters);
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <>
      <div className="filters">
        <button onClick={() => handleFilterChange({ state: 'new' })}>New</button>
        <button onClick={() => handleFilterChange({ state: 'assigned' })}>Assigned</button>
        <button onClick={() => handleFilterChange({ state: 'completed' })}>Completed</button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.content} - {task.state}
            {task.assignedTo && ` (Assigned to: ${task.assignedTo.name})`}
          </li>
        ))}
      </ul>
    </>
  );
}

// Create/Edit Task Form
export function TaskForm({ taskId }: { taskId?: string }) {
  const { createTask, updateTask } = useTasks();
  const { data: existingTask } = useTask(taskId || '');
  
  const [formData, setFormData] = useState<Task>({
    content: '',
    col: 0,
    row: 0,
    state: 'new',
  });
  
  // Populate form when editing existing task
  useEffect(() => {
    if (existingTask) {
      setFormData(existingTask);
    }
  }, [existingTask]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (taskId) {
      updateTask({ id: taskId, data: formData });
    } else {
      createTask(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}