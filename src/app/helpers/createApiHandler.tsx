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

interface RequestContext {
  params?: Record<string, string>;
}

interface SupabaseResponse<T = any> {
  data: T | null;
  error: any | null;
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
  return async function handler(
    req: NextRequest,
    context?: RequestContext
  ) {
    if (options.requireAuth) {
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 401 }
        );
      }

      try {
        const resourceId = context?.params?.id;
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

        const token = process.env.SERVICE_ROLE
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const fetchOptions: RequestInit = {
          method,
          headers,
        };

        if (method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
          const body = await req.json();
          fetchOptions.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, fetchOptions);
        
        // Parse the Supabase response, which should be in { data, error } format
        const supabaseResponse: SupabaseResponse = await response.json();
        
        // Check if there's an error in the Supabase response
        if (supabaseResponse.error) {
          console.error('Supabase returned an error:', supabaseResponse.error);
          return NextResponse.json(
            { error: supabaseResponse.error }, 
            { status: response.status !== 200 ? response.status : 400 }
          );
        }
        
        // If unwrapData option is true, return just the data
        // Otherwise return the whole Supabase response format
        if (options.unwrapData) {
          return NextResponse.json(supabaseResponse.data, { status: 200 });
        } else {
          return NextResponse.json(supabaseResponse, { status: 200 });
        }
      } catch (error: any) {
        console.error(`Error in ${method} ${baseUrl}${context?.params?.id ? '/' + context.params.id : ''}:`, error);
        return NextResponse.json(
          { error: error.message }, 
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