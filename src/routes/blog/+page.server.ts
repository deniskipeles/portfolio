import { pb, getFileUrl, type BlogPost } from '$lib/pocketbase'; // Add BlogPost type
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = 10; // Or however many posts per page

    try {
        // Note the filter `isPublished = true` comes from API rule, but good to be explicit
        const resultList = await pb.collection('blog_posts').getList<BlogPost>(page, perPage, {
           filter: 'isPublished = true',
           sort: '-publishedDate', // Sort by newest first
           fields: 'id,collectionId,title,slug,excerpt,coverImage,publishedDate,tags', // Only fetch needed fields for list
        });

         const posts = resultList.items.map(record => {
            const post: Partial<BlogPost> & { coverImageUrl?: string } = { ...record };
            if (post.coverImage) {
                // Smaller thumb for list view
                post.coverImageUrl = getFileUrl(record, post.coverImage, 'thumb=400x240');
            }
            return post;
         });

         return {
            posts: posts,
            currentPage: resultList.page,
            totalPages: resultList.totalPages,
         };

    } catch (error) {
        console.error("Error loading blog posts:", error);
        return { posts: [], currentPage: 1, totalPages: 1, error: 'Failed to load posts'};
    }
};