import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const subject = formData.get('subject') as string; // Optional
        const message = formData.get('message') as string;

        // Basic Server-side Validation
        if (!name || !email || !message) {
            return fail(400, { error: 'Please fill in all required fields.', name, email, subject, message });
        }
        // You could add more robust email validation here if needed

        const data = {
            name,
            email,
            subject: subject || '', // Ensure subject is not null if empty
            message,
            read: false // Default value
        };

        try {
            await pb.collection('messages').create(data);
            // Success! Don't return the submitted data back unless needed for UI state.
            return { success: true, message: 'Thank you! Your message has been sent.' };
        } catch (err: any) {
            console.error("Error sending message:", err);
            // Return the error and the submitted data to repopulate the form
            return fail(500, { error: 'Failed to send message. Please try again later.', name, email, subject, message });
        }
    }
};