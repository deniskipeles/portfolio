import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from '../$types';

export const actions: Actions = {
    login: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return fail(400, { data: { email }, error: 'Email and password are required.' });
        }

        try {
            await locals.pb.collection('users').authWithPassword(email, password);
            // PocketBase auth state is now updated in locals.pb.authStore
            // The hook will handle setting the cookie on the response.

        } catch (err: any) {
            console.error('Login failed:', err);
             return fail(401, { data: { email }, error: 'Invalid email or password.' });
        }

        // Redirect to the admin dashboard on successful login
        throw redirect(303, '/admin/projects'); // Or '/admin'
    }
};