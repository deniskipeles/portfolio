import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getFileUrl } from '$lib/pocketbase';
import { ClientResponseError } from 'pocketbase';
import type PocketBase from 'pocketbase'; // Import type

// --- Reusable Save Logic (same as in 'new') ---
async function saveProject(formData: FormData, pb: PocketBase) {
    // ... (Copy the exact same saveProject function from new/+page.server.ts) ...
     // Set null for empty optional fields PocketBase expects null for empty optional fields
    formData.set('projectUrl', formData.get('projectUrl') || '');
    formData.set('repoUrl', formData.get('repoUrl') || '');
    formData.set('order', formData.get('order') || ''); // Pocketbase handles empty string for number as null

     // Handle boolean checkbox (only sends value if checked)
     formData.set('featured', formData.get('featured') === 'on' ? 'true' : 'false');

     // Handle file deletions based on checkboxes
     if (formData.get('removeCoverImage') === 'true') formData.set('coverImage', null); // Send null to clear
     if (formData.get('removeExistingGallery') === 'true') formData.set('gallery', null); // Clear existing gallery by sending null

    const id = formData.get('id') as string | null; // Check if we are updating

    try {
        let record;
        if (id) {
             // Ensure files are handled correctly. If no new file is provided for coverImage/gallery,
             // but remove checkboxes aren't checked, PocketBase will keep the existing files when updating via FormData.
            // If remove checkboxes *are* checked, set the fields to null above.
            record = await pb.collection('projects').update(id, formData);
            console.log(`Project ${id} updated.`);
        } else {
            // Create: Pass the FormData directly
            record = await pb.collection('projects').create(formData);
            console.log(`Project ${record.id} created.`);
        }
         return { success: true, id: record.id }; // Return success and ID
    } catch (err: any) {
        console.error('Save Project Error:', err);

        if (err instanceof ClientResponseError && err.status === 400 && err.data?.data) {
            const fieldErrors: Record<string, string> = {};
            for (const key in err.data.data) {
                fieldErrors[key] = err.data.data[key].message;
            }
            const returnData = Object.fromEntries(formData.entries());
            // Process return data for form state
            returnData.featured = returnData.featured === 'on';
            delete returnData.coverImage;
            delete returnData.gallery;
            return { error: 'Validation failed.', fieldErrors, data: returnData };
        }

        const returnData = Object.fromEntries(formData.entries());
        // Process return data for form state
        returnData.featured = returnData.featured === 'on';
        delete returnData.coverImage;
        delete returnData.gallery;
        return { error: `Failed to save project: ${err.message}`, data: returnData };
    }
}
// --- End Save Logic ---


export const load: PageServerLoad = async ({ locals, params }) => {
    try {
        const project = await locals.pb.collection('projects').getOne(params.id);

         // Prepare data for the form, including current image URLs
         const projectData = structuredClone(project);
         projectData.currentCoverUrl = project.coverImage ? getFileUrl(project, project.coverImage, 'thumb=200xauto') : null;
         projectData.currentGalleryUrls = project.gallery?.map((g: string) => getFileUrl(project, g, 'thumb=100xauto')) ?? [];

        return {
            project: projectData
        };
    } catch (err: any) {
        console.error('Error loading project for edit:', err);
        if (err.status === 404) {
            throw error(404, 'Project not found');
        }
        throw error(err.status || 500, 'Failed to load project');
    }
};

export const actions: Actions = {
    save: async ({ request, locals, params }) => {
        const formData = await request.formData();
        formData.set('id', params.id); // Ensure ID is included for update

        const result = await saveProject(formData, locals.pb);

        if (result.success) {
            throw redirect(303, '/admin/projects'); // Redirect on success
        } else {
            // Need to fetch existing image URLs again to send back with the error data
            let currentCoverUrl = null;
            let currentGalleryUrls = [];
            try {
                 const existingProject = await locals.pb.collection('projects').getOne(params.id, { fields: 'collectionId,id,coverImage,gallery'});
                 currentCoverUrl = existingProject.coverImage ? getFileUrl(existingProject, existingProject.coverImage, 'thumb=200xauto') : null;
                 currentGalleryUrls = existingProject.gallery?.map((g: string) => getFileUrl(existingProject, g, 'thumb=100xauto')) ?? [];
            } catch (_) { /* Ignore error here, just won't have previews */ }

             // Merge result data (form values) with image URLs
             const returnData = {
                ...result.data,
                currentCoverUrl,
                currentGalleryUrls
             };

            return fail(400, {
                error: result.error,
                fieldErrors: result.fieldErrors,
                data: returnData
            });
        }
    }
};