import { pb, getFileUrl, type BlogPost } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const slug = params.slug;
        // Fetch published post by slug
        const record = await pb.collection('blog_posts').getFirstListItem<BlogPost>(`slug = "${slug}" && isPublished = true`);

        const post: Partial<BlogPost> & { coverImageUrl?: string } = { ...record };

        if (post.coverImage) {
            // Larger image for detail view
            post.coverImageUrl = getFileUrl(record, post.coverImage, 'thumb=1024xauto'); // Auto height
        }

        return {
            post: post
        };
    } catch (err: any) {
         console.error("Error loading post:", err);
         if (err.status === 404) {
            throw error(404, 'Blog post not found or not published');
         }
         throw error(500, 'Failed to load post');
    }
};