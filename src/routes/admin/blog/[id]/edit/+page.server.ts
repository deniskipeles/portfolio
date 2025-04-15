import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getFileUrl, type BlogPost } from '$lib/pocketbase';
import { ClientResponseError, type PocketBase } from 'pocketbase';

// --- Reusable Save Logic (Copy from new/+page.server.ts) ---
async function saveBlogPost(formData: FormData, pb: PocketBase) {
    // ... (Identical saveBlogPost function as above) ...
    formData.set('isPublished', formData.get('isPublished') === 'on' ? 'true' : 'false');
    if (formData.get('removeCoverImage') === 'true') formData.set('coverImage', null);
    const id = formData.get('id') as string | null;
    try { /* ... create/update logic ... */
        let record;
        if (id) record = await pb.collection('blog_posts').update(id, formData);
        else record = await pb.collection('blog_posts').create(formData);
        return { success: true, id: record.id };
    } catch (err: any) { /* ... error handling ... */
        const returnData = Object.fromEntries(formData.entries());
        returnData.isPublished = returnData.isPublished === 'on';
        delete returnData.coverImage;
         if (err instanceof ClientResponseError && err.status === 400 && err.data?.data) {
            const fieldErrors: Record<string, string> = {};
            for (const key in err.data.data) { fieldErrors[key] = err.data.data[key].message; }
            return { error: 'Validation failed.', fieldErrors, data: returnData };
        }
        return { error: `Failed to save post: ${err.message}`, data: returnData };
    }
}
// --- End Save Logic ---

export const load: PageServerLoad = async ({ locals, params }) => {
    try {
        const post = await locals.pb.collection('blog_posts').getOne<BlogPost>(params.id);

        // Prepare data for the form, including current image URL
        const postData = structuredClone(post);
        postData.currentCoverUrl = post.coverImage ? getFileUrl(post, post.coverImage, 'thumb=200xauto') : null;

        return {
            post: postData
        };
    } catch (err: any) {
        console.error('Error loading post for edit:', err);
        if (err instanceof ClientResponseError && err.status === 404) {
            throw error(404, 'Blog post not found');
        }
        throw error(err.status || 500, 'Failed to load blog post');
    }
};

export const actions: Actions = {
    save: async ({ request, locals, params }) => {
        const formData = await request.formData();
        formData.set('id', params.id); // Ensure ID is included for update

        const result = await saveBlogPost(formData, locals.pb);

        if (result.success) {
            throw redirect(303, '/admin/blog'); // Redirect on success
        } else {
            // Need to fetch existing image URL again to send back with the error data
            let currentCoverUrl = null;
            try {
                 const existingPost = await locals.pb.collection('blog_posts').getOne(params.id, { fields: 'collectionId,id,coverImage'});
                 currentCoverUrl = existingPost.coverImage ? getFileUrl(existingPost, existingPost.coverImage, 'thumb=200xauto') : null;
            } catch (_) { /* Ignore error here */ }

            // Merge result data (form values) with image URL
            const returnData = { ...result.data, currentCoverUrl };

            return fail(400, {
                error: result.error,
                fieldErrors: result.fieldErrors,
                data: returnData
            });
        }
    }
};