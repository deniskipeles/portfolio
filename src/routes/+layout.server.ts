import { pb, type SiteSettings, getFileUrl } from '$lib/pocketbase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
    try {
        // Fetch the single record from site_settings
        // Note: PocketBase SDK doesn't have a direct 'get single' for singleton yet,
        // so we list with max 1 item. A specific record ID could also be hardcoded if known.
        const settingsRecord = await pb.collection('site_settings').getFirstListItem('', {
           // You might need to adjust filter if you didn't use Singleton option
           // filter: 'someUniqueField = "value"'
        });

        // Make a plain object to avoid serialization issues
        const settings: SiteSettings = { ...settingsRecord };

         // Add profile picture URL if it exists
         if (settings.profilePicture) {
            settings.profilePictureUrl = getFileUrl(settingsRecord, settings.profilePicture, 'thumb=100x100');
         }
         // Add resume URL if it exists
         if (settings.resume) {
            settings.resumeUrl = getFileUrl(settingsRecord, settings.resume);
         }


        return {
            siteSettings: settings
        };
    } catch (error) {
        console.error("Error loading site settings:", error);
        // Provide default settings or handle error appropriately
        return {
           siteSettings: { siteTitle: 'My Portfolio', socialLinks: {} } as Partial<SiteSettings>
        };
    }
};