import { createApiHandler, HttpMethod } from '@/app/helpers/createApiHandler';
import { supaUrl } from '@/app/constants/urls';

const SUPABASE_URL = `${supaUrl}/functions/v1/user-crud`;

export const GET = createApiHandler(SUPABASE_URL, HttpMethod.GET, { requireAuth: true, unwrapData: true });
export const PUT = createApiHandler(SUPABASE_URL, HttpMethod.PUT, { requireAuth: true, unwrapData: true });
export const DELETE = createApiHandler(SUPABASE_URL, HttpMethod.DELETE, { requireAuth: true, unwrapData: true });