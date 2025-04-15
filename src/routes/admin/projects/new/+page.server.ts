import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase'; // Import error type

// Reusable validation/save logic (could be moved to a lib file)
async function saveProject(formData: FormData, pb: PocketBase) {
     // Set null for empty optional fields PocketBase expects null for empty optional fields
    formData.set('projectUrl', formData.get('projectUrl') || '');
    formData.set('repoUrl', formData.get('repoUrl') || '');
    formData.set('order', formData.get('order') || ''); // Pocketbase handles empty string for number as null

     // Handle boolean checkbox (only sends value if checked)
     formData.set('featured', formData.get('featured') === 'on' ? 'true' : 'false');

     // Handle file deletions based on checkboxes
     if (formData.get('removeCoverImage') === 'true') formData.set('coverImage', ''); // Send empty string to potentially clear
     if (formData.get('removeExistingGallery') === 'true') formData.set('gallery', ''); // Clear existing gallery

    const id = formData.get('id') as string | null; // Check if we are updating

    try {
        let record;
        if (id) {
            // Update: PocketBase automatically merges FormData with existing data
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

        // Handle PocketBase validation errors
        if (err instanceof ClientResponseError && err.status === 400 && err.data?.data) {
            const fieldErrors: Record<string, string> = {};
            for (const key in err.data.data) {
                fieldErrors[key] = err.data.data[key].message;
            }
            // Return original form data along with errors
             const returnData = Object.fromEntries(formData.entries());
            return { error: 'Validation failed.', fieldErrors, data: returnData };
        }

        // Generic error
         const returnData = Object.fromEntries(formData.entries());
        return { error: `Failed to save project: ${err.message}`, data: returnData };
    }
}


export const actions: Actions = {
    save: async ({ request, locals }) => {
        const formData = await request.formData();
        const result = await saveProject(formData, locals.pb);

        if (result.success && result.id) {
            // Redirect to the project list or the edited project page on success
            throw redirect(303, '/admin/projects');
        } else {
            // Return failure with errors and original data
            // Need to manually reconstruct data from FormData for repopulation if error occurred
            const data = Object.fromEntries(formData.entries());
            // Convert checkbox values back correctly for form state
            data.featured = data.featured === 'on';
             // Remove file inputs from data to avoid issues, keep URLs if available
             delete data.coverImage;
             delete data.gallery;

            return fail(400, { // Use 400 for validation errors, 500 for others
                error: result.error,
                fieldErrors: result.fieldErrors,
                data: data // Send back processed form data
            });
        }
    }
};