import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getFileUrl, type BlogPost } from '$lib/pocketbase'; // Assumes BlogPost type defined
import { ClientResponseError } from 'pocketbase';

export const load: PageServerLoad = async ({ locals }) => {
    try {
        const resultList = await locals.pb.collection('blog_posts').getList<BlogPost>(1, 50, { // Add pagination later
            sort: '-publishedDate',
            fields: 'id,collectionId,title,slug,publishedDate,isPublished,created' // Fetch only needed fields
        });

        // Return plain objects
        return {
            posts: structuredClone(resultList.items)
        };
    } catch (err: any) {
        console.error('Error loading admin blog posts:', err);
        throw error(err.status || 500, 'Failed to load blog posts');
    }
};

export const actions: Actions = {
    deleteBlogPost: async ({ request, locals }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) return fail(400, { deleteError: 'Post ID missing' });

        try {
            await locals.pb.collection('blog_posts').delete(id);
            return { deleteSuccess: true, message: `Post ${id} deleted.` };
        } catch (err: any) {
            console.error('Error deleting post:', err);
             if (err instanceof ClientResponseError) {
                return fail(err.status, { deleteError: `Failed to delete post: ${err.data.message || err.message}` });
             }
            return fail(500, { deleteError: `Failed to delete post: ${err.message}` });
        }
    }
};