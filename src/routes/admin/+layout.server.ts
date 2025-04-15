import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // The hook already redirects if not logged in.
    // We just need to pass the user info down.
    return {
        user: locals.user // Already a plain object from the hook
    };
};