import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

interface ClickUpErrorResponse {
  err?: string;
  ECODE?: string;
}

async function clickupApiHandler(req: NextRequest) {
  const apiKey = process.env.CLICKUP_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'ClickUp API key not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  
  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json'
  };

  try {
    if (req.method === 'GET') {
      if (action === 'getTasks') {
        const listId = url.searchParams.get('listId');
        if (!listId) {
          return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
        }
        
        let clickupUrl = `${CLICKUP_API_BASE}/list/${listId}/task`;
        
        // Handle custom fields filtering if present
        const customFields = url.searchParams.get('custom_fields');
        if (customFields) {
          clickupUrl += `?custom_fields=${customFields}`;
        }
        
        const response = await fetch(clickupUrl, { headers });
        const data = await response.json();
        
        // Check for business errors in the response
        if (isClickUpErrorResponse(data)) {
          return handleClickUpBusinessError(data);
        }
        
        return NextResponse.json(data);
      }
    } 
    else if (req.method === 'POST') {
      const body = await req.json();
      
      if (action === 'createTask') {
        const { listId, taskData } = body;
        if (!listId || !taskData) {
          return NextResponse.json({ error: 'List ID and task data are required' }, { status: 400 });
        }

        const response = await fetch(
          `${CLICKUP_API_BASE}/list/${listId}/task`, 
          {
            method: 'POST',
            headers,
            body: JSON.stringify(taskData)
          }
        );
        
        const data = await response.json();
        
        // Check for business errors in the response
        if (isClickUpErrorResponse(data)) {
          return handleClickUpBusinessError(data);
        }
        
        return NextResponse.json(data);
      } 
      else if (action === 'updateTaskCustomField') {
        const { taskId, fieldId, value } = body;
        if (!taskId || !fieldId) {
          return NextResponse.json({ error: 'Task ID and field ID are required' }, { status: 400 });
        }
        
        const response = await fetch(
          `${CLICKUP_API_BASE}/task/${taskId}/field/${fieldId}`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ value })
          }
        );
        
        const data = await response.json();
        
        // Check for business errors in the response
        if (isClickUpErrorResponse(data)) {
          return handleClickUpBusinessError(data);
        }
        
        return NextResponse.json(data);
      }
    }
    
    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    //eslint-disable-next-line
  } catch (error: any) {
    console.error('ClickUp API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Error connecting to ClickUp API' 
    }, { status: 500 });
  }
}

// Helper function to check if the response is a ClickUp error
//eslint-disable-next-line
function isClickUpErrorResponse(data: any): data is ClickUpErrorResponse {
  return data && 
         (typeof data.err === 'string' || typeof data.ECODE === 'string');
}

// Helper function to handle ClickUp business errors
function handleClickUpBusinessError(errorData: ClickUpErrorResponse) {
  console.error('ClickUp business error:', errorData);
  
  // Map common ClickUp error codes to more descriptive messages
  const errorMessages: Record<string, string> = {
    'ITEM_227': 'The Sprint Points ClickApp is not enabled.',
    // Add more mappings as you encounter them
  };
  
  const errorMessage = errorData.err || 
                       (errorData.ECODE && errorMessages[errorData.ECODE]) || 
                       'Unknown ClickUp error';
  
  return NextResponse.json(
    { 
      error: errorMessage, 
      code: errorData.ECODE || 'UNKNOWN',
      details: errorData 
    }, 
    { status: 422 } // Using 422 Unprocessable Entity for business logic errors
  );
}

// Export handlers that use the dedicated clickupApiHandler
export async function GET(req: NextRequest) {
  return clickupApiHandler(req);
}

export async function POST(req: NextRequest) {
  return clickupApiHandler(req);
}