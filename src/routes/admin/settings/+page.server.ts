import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getFileUrl, type SiteSettings } from '$lib/pocketbase'; // Assumes SiteSettings type defined
import { ClientResponseError, type PocketBase } from 'pocketbase';

// --- Reusable Save Logic ---
async function saveSiteSettings(formData: FormData, pb: PocketBase, settingsId: string) {
    // Handle file deletions - send null to clear
    if (formData.get('removeProfilePicture') === 'true') formData.set('profilePicture', null);
    if (formData.get('removeResume') === 'true') formData.set('resume', null);

    // Handle JSON field (example: simple key-value pairs from form)
    const socialLinks: Record<string, string> = {};
    // Example: Extract known fields, sanitize/validate URLs if needed
    const github = formData.get('social_github') as string;
    const linkedin = formData.get('social_linkedin') as string;
    const artstation = formData.get('social_artstation') as string; // Add others as needed
    if (github) socialLinks.github = github;
    if (linkedin) socialLinks.linkedin = linkedin;
    if (artstation) socialLinks.artstation = artstation;
    formData.set('socialLinks', JSON.stringify(socialLinks));

    // Remove individual social fields from FormData before sending if they aren't actual collection fields
    formData.delete('social_github');
    formData.delete('social_linkedin');
    formData.delete('social_artstation');

    try {
        // Always update the single record
        const record = await pb.collection('site_settings').update(settingsId, formData);
        console.log(`Site Settings ${settingsId} updated.`);
        return { success: true, id: record.id };
    } catch (err: any) {
        console.error('Save Site Settings Error:', err);

        // Basic data extraction for form repopulation
        const returnData = Object.fromEntries(formData.entries());
        // Reconstruct social links for form state if needed
        returnData.social_github = socialLinks.github || '';
        returnData.social_linkedin = socialLinks.linkedin || '';
        returnData.social_artstation = socialLinks.artstation || '';
        // Remove file inputs, keep JSON representation for debugging/state
        delete returnData.profilePicture;
        delete returnData.resume;

        if (err instanceof ClientResponseError && err.status === 400 && err.data?.data) {
            const fieldErrors: Record<string, string> = {};
            for (const key in err.data.data) fieldErrors[key] = err.data.data[key].message;
            return { error: 'Validation failed.', fieldErrors, data: returnData };
        }
        return { error: `Failed to save settings: ${err.message}`, data: returnData };
    }
}
// --- End Save Logic ---


export const load: PageServerLoad = async ({ locals }) => {
    try {
        // Fetch the single record (replace filter if not using Singleton option)
        const settings = await locals.pb.collection('site_settings').getFirstListItem<SiteSettings>('');

        // Prepare data with image/file URLs
        const settingsData = structuredClone(settings);
        settingsData.currentProfilePictureUrl = settings.profilePicture ? getFileUrl(settings, settings.profilePicture, 'thumb=100x100') : null;
        settingsData.currentResumeUrl = settings.resume ? getFileUrl(settings, settings.resume) : null;

        return {
            settings: settingsData
        };
    } catch (err: any) {
         // Handle case where settings don't exist yet (e.g., first run)
         if (err instanceof ClientResponseError && err.status === 404) {
             console.warn('Site settings record not found. Returning defaults.');
             // Return default structure so the form component doesn't break
             return {
                 settings: { id: null, socialLinks: {} } // Indicate no ID, provide default for socialLinks
             };
         }
        console.error('Error loading site settings:', err);
        throw error(err.status || 500, 'Failed to load site settings');
    }
};

export const actions: Actions = {
    save: async ({ request, locals, data }) => { // Access loaded data if needed for ID
        const formData = await request.formData();
        const settingsId = data.settings?.id; // Get ID from loaded data

        if (!settingsId) {
             // Handle case where settings record doesn't exist yet (shouldn't happen if created first)
             return fail(500, { error: "Site settings record ID not found. Please create the record in PocketBase admin first." });
        }

        const result = await saveSiteSettings(formData, locals.pb, settingsId);

        if (result.success) {
            // Redirect back to the same page (or show success message)
             // We need to reload data, so redirecting is easiest
             throw redirect(303, '/admin/settings');
        } else {
            // Fetch existing image/file URLs again for error state
            let currentProfilePictureUrl = null;
            let currentResumeUrl = null;
             try {
                 const existing = await locals.pb.collection('site_settings').getOne(settingsId, { fields: 'collectionId,id,profilePicture,resume'});
                 currentProfilePictureUrl = existing.profilePicture ? getFileUrl(existing, existing.profilePicture, 'thumb=100x100') : null;
                 currentResumeUrl = existing.resume ? getFileUrl(existing, existing.resume) : null;
             } catch (_) { /* Ignore */ }

            const returnData = {
                 ...result.data, // Form values from failed attempt
                 currentProfilePictureUrl,
                 currentResumeUrl
             };

            return fail(400, {
                error: result.error,
                fieldErrors: result.fieldErrors,
                data: returnData,
                settingsId: settingsId // Pass ID back if needed by form repopulation logic
            });
        }
    }
};