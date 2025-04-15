import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public'; // Use environment variable

export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

// Optional: For type safety (generate types using tools or define manually)
// Example manual types:
export interface Project {
    id: string;
    collectionId: string;
    collectionName: string;
    created: string;
    updated: string;
    title: string;
    slug: string;
    excerpt: string;
    description: string;
    coverImage: string; // Filename
    gallery?: string[]; // Filenames
    technologies: string; // Or specific type if using relation
    projectUrl?: string;
    repoUrl?: string;
    order?: number;
    featured?: boolean;
}

export interface SiteSettings {
    id: string;
    collectionId: string;
    collectionName: string;
    created: string;
    updated: string;
    siteTitle: string;
    tagline: string;
    aboutMe: string;
    profilePicture: string; // Filename
    contactEmail: string;
    resume: string; // Filename
    socialLinks: { [key: string]: string }; // e.g., { github: '...', linkedin: '...' }
}

// Helper function to get file URL
export function getFileUrl(
    record: { collectionId: string; id: string },
    filename: string,
    queryParams: string = '' // e.g., 'thumb=100x100'
): string {
    if (!filename) return ''; // Handle case where file might not exist
    return `${pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${filename}${queryParams ? '?' + queryParams : ''}`;
}