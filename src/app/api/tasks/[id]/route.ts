import { createApiHandler, HttpMethod } from '@/app/helpers/createApiHandler';
import { supaUrl } from '@/app/constants/urls';

const SUPABASE_URL = `${supaUrl}/functions/v1/task-crud`;

export const GET = createApiHandler(SUPABASE_URL, HttpMethod.GET);
export const PUT = createApiHandler(SUPABASE_URL, HttpMethod.PUT);
export const DELETE = createApiHandler(SUPABASE_URL, HttpMethod.DELETE);