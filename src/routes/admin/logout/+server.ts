import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
    locals.pb.authStore.clear(); // Clear the auth store
    locals.user = undefined;     // Clear the user in locals

    // Redirect to login page. The hook will handle removing the cookie.
    throw redirect(303, '/admin/login');
};