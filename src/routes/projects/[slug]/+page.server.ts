import { pb, type Project, getFileUrl } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const slug = params.slug;
        const record = await pb.collection('projects').getFirstListItem<Project>(`slug = "${slug}"`); // Filter by slug

        // Prepare project data
        const project: Partial<Project> & { coverImageUrl?: string, galleryUrls?: string[] } = { ...record };

        if (project.coverImage) {
            project.coverImageUrl = getFileUrl(record, project.coverImage); // Full size for detail page
        }
        if (project.gallery && project.gallery.length > 0) {
           project.galleryUrls = project.gallery.map(filename => getFileUrl(record, filename));
        }


        return {
            project: project
        };
    } catch (err: any) {
         console.error("Error loading project:", err);
         if (err.status === 404) {
            throw error(404, 'Project not found');
         }
         // It's good practice to check the error type from PocketBase SDK if possible
         throw error(500, 'Failed to load project');
    }
};