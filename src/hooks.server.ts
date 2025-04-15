import { pb } from '$lib/pocketbase';
import { redirect, type Handle, error } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // --- PocketBase Instantiation and Auth Loading ---
    // Create a new PocketBase instance *per request*
    event.locals.pb = pb//new PocketBase(PUBLIC_POCKETBASE_URL); // Ensure PUBLIC_POCKETBASE_URL is set in .env

    // Load the auth store data from the request cookie
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
         // Verify authentication state if the token looks valid
        if (event.locals.pb.authStore.isValid) {
            await event.locals.pb.collection('users').authRefresh();
            event.locals.user = structuredClone(event.locals.pb.authStore.model); // Make plain object
        }
    } catch (_) {
        // Clear the auth store if refresh fails (token expired or invalid)
        event.locals.pb.authStore.clear();
        event.locals.user = undefined;
    }
    // --- End PocketBase Setup ---


    // --- Admin Route Protection ---
    if (event.url.pathname.startsWith('/admin')) {
        // Allow access to the login page itself without being logged in
        if (event.url.pathname !== '/admin/login') {
            if (!event.locals.user) {
                // If not logged in, redirect to the login page
                console.log('User not authenticated, redirecting to login');
                throw redirect(303, '/admin/login');
            }
            // Optional: Add role-based checks here if needed
            // if (event.locals.user.role !== 'admin') {
            //    throw error(403, 'Forbidden');
            // }
        } else if (event.locals.user) {
             // If already logged in and trying to access login page, redirect to dashboard
             console.log('User already authenticated, redirecting from login to dashboard');
             throw redirect(303, '/admin/projects'); // Or your preferred admin home
        }
    }
    // --- End Admin Route Protection ---

    const response = await resolve(event);

     // --- PocketBase Auth Cookie Handling ---
     // Set the cookie back on the response if it changed (login, logout, refresh)
     // Secure; HttpOnly; Path=/; SameSite=Strict are recommended security settings
    response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({ secure: true, httpOnly: true, path: '/', sameSite: 'strict' }));
    // --- End Cookie Handling ---

    return response;
};