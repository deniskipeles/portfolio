import { pb, type Project, getFileUrl } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

// Define allowed sort fields for security/simplicity
const allowedSortFields = ['created', '-created', 'title', '-title', 'order', '-order'];

export const load: PageServerLoad = async ({ url }) => {
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = 9; // Number of projects per page
    const sortParam = url.searchParams.get('sort') || '-created'; // Default sort
    const filterTech = url.searchParams.get('tech') || ''; // Filter by technology

    // Validate sort parameter
    const sort = allowedSortFields.includes(sortParam) ? sortParam : '-created';

    // Build filter string
    let filter = '';
    if (filterTech) {
         // Using PocketBase filter syntax: field ~ 'value' (contains) for text fields
         // IMPORTANT: For production, properly sanitize or use PocketBase parameter binding
         // filter = `technologies ~ '${filterTech.replace(/'/g, "''")}'`; // Basic sanitization
         // Safer using parameters:
         filter = pb.filter('technologies ~ {:tech}', { tech: filterTech });
    }

     // --- Fetch Unique Technologies (Option 1: Fetch all and process) ---
     // This can be inefficient for many projects. A dedicated `technologies` collection is better.
     let uniqueTechnologies: string[] = [];
     try {
         const allProjects = await pb.collection('projects').getFullList<Project>({
             fields: 'technologies' // Only fetch the necessary field
         });
         const techSet = new Set<string>();
         allProjects.forEach(p => {
             if (p.technologies) {
                 p.technologies.split(',').map(t => t.trim()).filter(Boolean).forEach(t => techSet.add(t));
             }
         });
         uniqueTechnologies = Array.from(techSet).sort();
     } catch (err) {
         console.error("Error fetching technologies:", err);
         // Handle error - maybe log it, don't crash the page
     }
     // --- End Fetch Unique Technologies ---


    try {
        const resultList = await pb.collection('projects').getList<Project>(page, perPage, {
            sort: sort,
            filter: filter,
            // You might need other options like expand if using relations
        });

        // Map results to plain objects and add cover image URLs
        const projects = resultList.items.map(record => {
            const project: Partial<Project> & { coverImageUrl?: string } = { ...record };
            if (project.coverImage) {
                // Use a smaller thumb for list view
                project.coverImageUrl = getFileUrl(record, project.coverImage, 'thumb=400x300');
            } 
            return project;
        });

        return {
            projects: projects,
            currentPage: resultList.page,
            totalPages: resultList.totalPages,
            totalItems: resultList.totalItems,
            currentSort: sort,
            currentTechFilter: filterTech,
            availableTechnologies: uniqueTechnologies, // Pass to frontend
        };
    } catch (error) {
         console.error("Error loading projects:", error);
         // Provide fallback values
         return {
             projects: [],
             currentPage: 1,
             totalPages: 1,
             totalItems: 0,
             currentSort: sort,
             currentTechFilter: filterTech,
             availableTechnologies: uniqueTechnologies,
             error: 'Failed to load projects'
         };
    }
};