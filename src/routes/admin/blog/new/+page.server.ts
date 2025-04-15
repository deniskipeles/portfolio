import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { ClientResponseError, type PocketBase } from 'pocketbase'; // Import types

// --- Reusable Save Logic ---
async function saveBlogPost(formData: FormData, pb: PocketBase) {
    // Convert checkbox value (only sent if 'on')
    formData.set('isPublished', formData.get('isPublished') === 'on' ? 'true' : 'false');
    // Handle file deletion
    if (formData.get('removeCoverImage') === 'true') formData.set('coverImage', null);

    const id = formData.get('id') as string | null;

    try {
        let record;
        const dataToSend = formData; // PB handles FormData directly for create/update

        if (id) { // Update
            record = await pb.collection('blog_posts').update(id, dataToSend);
            console.log(`Blog Post ${id} updated.`);
        } else { // Create
            record = await pb.collection('blog_posts').create(dataToSend);
            console.log(`Blog Post ${record.id} created.`);
        }
        return { success: true, id: record.id };
    } catch (err: any) {
        console.error('Save Blog Post Error:', err);

        // Basic data extraction for form repopulation
        const returnData = Object.fromEntries(formData.entries());
        returnData.isPublished = returnData.isPublished === 'on'; // Convert back for form state
        delete returnData.coverImage; // Don't send file back

         if (err instanceof ClientResponseError && err.status === 400 && err.data?.data) {
            const fieldErrors: Record<string, string> = {};
            for (const key in err.data.data) {
                fieldErrors[key] = err.data.data[key].message;
            }
             return { error: 'Validation failed.', fieldErrors, data: returnData };
        }
        return { error: `Failed to save post: ${err.message}`, data: returnData };
    }
}
// --- End Save Logic ---

export const actions: Actions = {
    save: async ({ request, locals }) => {
        const formData = await request.formData();
        const result = await saveBlogPost(formData, locals.pb);

        if (result.success && result.id) {
            throw redirect(303, '/admin/blog'); // Redirect on success
        } else {
             // Fetch existing image URLs if needed (relevant for edit errors)
             // For 'new', we don't have existing images
            return fail(400, { // Use 400 for validation errors
                error: result.error,
                fieldErrors: result.fieldErrors,
                data: result.data // Send back processed form data
            });
        }
    }
};