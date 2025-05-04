import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  PUT = 'PUT'
}

type ApiHandlerOptions = {
  requireAuth?: boolean;
  unwrapData?: boolean; 
};

interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

/**
 * Universal API handler that wraps common functionality for all API routes
 * 
 * @param baseUrl The base Supabase function URL
 * @param method HTTP method to use
 * @param options Configuration options
 * @returns Handler function for Next.js API route
 */
export function createApiHandler(
  baseUrl: string,
  method: HttpMethod,
  options: ApiHandlerOptions = { requireAuth: true, unwrapData: true }
) {
  //eslint-disable-next-line
  return async function handler(req: NextRequest, ...args: any[]) {
    // Await the params object first
    const params = args[0]?.params ? await args[0].params : {};
    
    if (options.requireAuth) {
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 401 }
        );
      }

      try {
        // Now it's safe to access params.id
        const resourceId = params?.id as string | undefined;
        
        let url = baseUrl;
        if (resourceId) {
          url = `${url}/${resourceId}`;
        }
        
        if (method === HttpMethod.GET) {
          const reqUrl = new URL(req.url);
          const searchParams = reqUrl.searchParams.toString();
          if (searchParams) {
            url = `${url}?${searchParams}`;
          }
        }

        const token = process.env.SERVICE_ROLE;
        console.log('Service token available:', !!token);

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const fetchOptions: RequestInit = {
          method,
          headers,
        };

        if (method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
          try {
            const contentLength = req.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 0) {
              const body = await req.json();
              fetchOptions.body = JSON.stringify(body);
            } else {
              fetchOptions.body = JSON.stringify({});
            }
          } catch (err) {
            console.error('Failed to parse request body as JSON:', err);
            return NextResponse.json(
              { error: 'Invalid JSON in request body' },
              { status: 400 }
            );
          }
        }
        
        console.log(`Requesting: ${method} ${url}`);

        const response = await fetch(url, fetchOptions);
        console.log(`Response status: ${response.status}`);
        
        // Handle non-JSON responses gracefully
        let supabaseResponse: SupabaseResponse;
        try {
          supabaseResponse = await response.json();
        } catch (err) {
          console.error('Failed to parse response as JSON:', err);
          const responseText = await response.text();
          return NextResponse.json(
            { error: `Failed to parse response: ${responseText}` },
            { status: response.status }
          );
        }
      
        // Check if there's an error in the Supabase response
        if (supabaseResponse.error) {
          console.error('Supabase returned an error:', supabaseResponse.error);
          return NextResponse.json(
            { error: supabaseResponse.error }, 
            { status: response.status !== 200 ? response.status : 400 }
          );
        }
        
        // If unwrapData option is true, return just the data
        if (options.unwrapData) {
          try {            
            let safeData;
            // Handle the case where data is explicitly null/undefined
            if (supabaseResponse.data === undefined || supabaseResponse.data === null) {
              console.warn('Supabase response data was null or undefined, returning empty object');
              safeData = {};
            } else {
              safeData = supabaseResponse.data;
            }            
            return NextResponse.json(safeData, { status: 200 });
          } catch (err) {
            console.error('Data is not JSON serializable:', err);
            // Include error details but not the actual data which might be too large
            return NextResponse.json(
              { error: 'Response contained non-serializable data', details: String(err) },
              { status: 500 }
            );
          }
        } else {
          try {
            // Test if the entire response is JSON serializable
            JSON.stringify(supabaseResponse);
            return NextResponse.json(supabaseResponse, { status: 200 });
          } catch (err) {
            console.error('Response is not JSON serializable:', err);
            return NextResponse.json(
              { error: 'Response contained non-serializable data' },
              { status: 500 }
            );
          }
        }
      } catch (error: unknown) {
        console.error(`Error in ${method} ${baseUrl}${params?.id ? '/' + params.id : ''}:`, error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : String(error) }, 
          { status: 500 }
        );
      }
    } else {
      // Handle non-authenticated routes if needed
      return NextResponse.json(
        { error: 'Not implemented' }, 
        { status: 501 }
      );
    }
  };
}