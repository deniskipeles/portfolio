import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { type Message } from '$lib/pocketbase'; // Assumes Message type defined
import { ClientResponseError } from 'pocketbase';

export const load: PageServerLoad = async ({ locals }) => {
    try {
        const resultList = await locals.pb.collection('messages').getList<Message>(1, 50, { // Add pagination later
            sort: '+read,-created', // Show unread first, then newest within read/unread
        });

        return {
            messages: structuredClone(resultList.items)
        };
    } catch (err: any) {
        console.error('Error loading admin messages:', err);
        throw error(err.status || 500, 'Failed to load messages');
    }
};

export const actions: Actions = {
    toggleRead: async ({ request, locals }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const currentReadStatus = formData.get('currentReadStatus') === 'true'; // Check current status passed from form

        if (!id) return fail(400, { toggleError: 'Message ID missing' });

        try {
            // Toggle the read status
            await locals.pb.collection('messages').update(id, { read: !currentReadStatus });
            return { toggleSuccess: true, message: `Message ${id} marked as ${!currentReadStatus ? 'read' : 'unread'}.` };
        } catch (err: any) {
            console.error('Error toggling read status:', err);
             if (err instanceof ClientResponseError) {
                return fail(err.status, { toggleError: `Failed to update message: ${err.data.message || err.message}` });
             }
            return fail(500, { toggleError: `Failed to update message: ${err.message}` });
        }
    },

    deleteMessage: async ({ request, locals }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) return fail(400, { deleteError: 'Message ID missing' });

        try {
            await locals.pb.collection('messages').delete(id);
            return { deleteSuccess: true, message: `Message ${id} deleted.` };
        } catch (err: any) {
            console.error('Error deleting message:', err);
             if (err instanceof ClientResponseError) {
                 return fail(err.status, { deleteError: `Failed to delete message: ${err.data.message || err.message}` });
             }
            return fail(500, { deleteError: `Failed to delete message: ${err.message}` });
        }
    }
};