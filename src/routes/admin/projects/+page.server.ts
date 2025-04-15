import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getFileUrl } from '$lib/pocketbase'; // Assuming Project type is defined here

export const load: PageServerLoad = async ({ locals }) => {
    try {
        const resultList = await locals.pb.collection('projects').getList(1, 50, { // Add pagination later
            sort: '-created',
            // No 'isPublished' filter needed for admin view
        });

         // Add thumbnail URLs directly for admin display convenience
        const projects = resultList.items.map(p => ({
            ...p,
            coverImageUrl: p.coverImage ? getFileUrl(p, p.coverImage, 'thumb=100x80') : null
        }));


        return {
            projects: structuredClone(projects) // Return plain objects
        };
    } catch (err: any) {
        console.error('Error loading admin projects:', err);
        throw error(err.status || 500, 'Failed to load projects');
    }
};

 // Optional: Delete Action directly on this page's server
export const actions: Actions = {
    deleteProject: async ({ request, locals }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) return fail(400, { error: 'Project ID missing' });

        try {
            await locals.pb.collection('projects').delete(id);
            return { success: true, message: `Project ${id} deleted.` };
        } catch (err: any) {
            console.error('Error deleting project:', err);
            return fail(err.status || 500, { error: `Failed to delete project: ${err.message}` });
        }
    }
};