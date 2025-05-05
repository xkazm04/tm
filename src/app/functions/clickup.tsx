export interface ClickUpTaskData {
  name: string;
  tags?: string[];
  points?: number;
  priority?: number;
  description?: string;
  custom_fields?: Array<{
    id: string;
    value: string | number | boolean;
  }>;
}

export const clickupService = {
  // Get all tasks from a specific list with optional custom field filtering
  getTasksFromList: async (listId: number, customFields?: Array<{field_id: string, operator: string, value: string}>) => {
    try {
      let url = `/api/clickup?action=getTasks&listId=${listId}`;
      
      // Add custom fields query if provided
      if (customFields && customFields.length > 0) {
        const customFieldsQuery = encodeURIComponent(JSON.stringify(customFields));
        url += `&custom_fields=${customFieldsQuery}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching ClickUp tasks:', error);
      throw error;
    }
  },

  // Create a new task in ClickUp with enhanced task data
  clickupTask: async (listId: number, taskData: ClickUpTaskData) => {
    try {
      const response = await fetch(`/api/clickup?action=createTask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, taskData })
      });
      if (!response.ok) throw new Error('Failed to create task');
      return await response.json();
    } catch (error) {
      console.error('Error creating ClickUp task:', error);
      throw error;
    }
  },

  // Update a task's custom field to store your app's task ID
  pairTaskWithAppId: async (clickupTaskId: string, customFieldId: string, appTaskId: string) => {
    try {
      const response = await fetch(`/api/clickup?action=updateTaskCustomField`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskId: clickupTaskId,
          fieldId: customFieldId,
          value: appTaskId
        })
      });
      if (!response.ok) throw new Error('Failed to update task custom field');
      return await response.json();
    } catch (error) {
      console.error('Error pairing task with app ID:', error);
      throw error;
    }
  }
};