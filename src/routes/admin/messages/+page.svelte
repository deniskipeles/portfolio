<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { Trash2, Eye, EyeOff, Mail } from 'lucide-svelte';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;
    export let form: ActionData; // For action feedback

     $: messages = data.messages || [];

    // Simple modal for viewing message content
    let showModal = false;
    let selectedMessage: any = null;

    function viewMessage(message: any) {
         selectedMessage = message;
         showModal = true;
         // Optional: Mark as read when viewing if not already read
         if (!message.read) {
             // Trigger the markRead action programmatically (more complex)
             // Or rely on user clicking the button if needed
         }
    }

    function closeModal() {
         showModal = false;
         selectedMessage = null;
    }

    function confirmDelete(messageSubject: string | undefined): boolean {
        return confirm(`Are you sure you want to delete the message "${messageSubject || 'No Subject'}"?`);
    }

     // Feedback handling (simple alerts for now)
     $: if (form?.toggleSuccess || form?.deleteSuccess) {
         alert(form.message);
         form = undefined; // Clear form state after showing message
     } else if (form?.toggleError || form?.deleteError) {
          alert(`Error: ${form.toggleError || form.deleteError}`);
          form = undefined;
     }

</script>

<svelte:head>
    <title>Admin - Messages</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-semibold">Inbox Messages</h1>
    <!-- No "New" button needed here -->
</div>

<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
    <table class="w-full table-auto">
        <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                 <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From</th>
                 <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                 <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Received</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each messages as message (message.id)}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 {message.read ? '' : 'font-semibold bg-indigo-50 dark:bg-indigo-900/20'}">
                    <td class="px-4 py-3 whitespace-nowrap text-center">
                       {#if !message.read} <span class="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block" title="Unread"></span> {/if}
                     </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm {message.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}">
                        {message.name} {message.email}
                    </td>
                    <td class="px-4 py-3 text-sm {message.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}">
                        <button on:click={() => viewMessage(message)} class="hover:underline truncate max-w-xs block" title="View Message">
                            {message.subject || '(No Subject)'}
                        </button>
                    </td>
                     <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(message.created).toLocaleString()}
                     </td>
                    <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <!-- Toggle Read Status Form -->
                         <form
                            method="POST"
                            action="?/toggleRead"
                            use:enhance={() => {
                                 // No confirmation needed
                                 return async ({ result, update }) => {
                                     await update({ reset: false });
                                     if (result.type === 'success' || result.type === 'redirect') {
                                         invalidateAll(); // Refresh list
                                     }
                                 };
                             }}
                            class="inline-block"
                         >
                             <input type="hidden" name="id" value={message.id} />
                             <input type="hidden" name="currentReadStatus" value={message.read ? 'true' : 'false'} />
                             <button type="submit" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200" title={message.read ? 'Mark as Unread' : 'Mark as Read'}>
                                 {#if message.read} <EyeOff class="w-4 h-4 inline-block"/> {:else} <Eye class="w-4 h-4 inline-block"/> {/if}
                             </button>
                         </form>

                        <!-- Delete Form -->
                        <form
                            method="POST"
                            action="?/deleteMessage"
                            use:enhance={({ formElement }) => {
                                if (!confirmDelete(message.subject)) return { cancel: true };
                                return async ({ result, update }) => {
                                    await update({ reset: false });
                                    if (result.type === 'success' || result.type === 'redirect') {
                                        invalidateAll();
                                    }
                                };
                            }}
                            class="inline-block"
                        >
                            <input type="hidden" name="id" value={message.id} />
                            <button type="submit" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" title="Delete">
                                <Trash2 class="w-4 h-4 inline-block"/>
                            </button>
                        </form>
                    </td>
                </tr>
            {:else}
                <tr>
                     <td colspan="5" class="text-center py-6 text-gray-500 dark:text-gray-400">Inbox is empty.</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <!-- Add Pagination controls here later -->
</div>


<!-- Simple Modal for Viewing Message -->
{#if showModal && selectedMessage}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" on:click|self={closeModal}>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full m-4 overflow-hidden">
         <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
             <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Message Details</h3>
             <button on:click={closeModal} class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">×</button>
         </div>
        <div class="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
             <p><strong class="font-medium text-gray-700 dark:text-gray-300">From:</strong> {selectedMessage.name} {selectedMessage.email}</p>
             <p><strong class="font-medium text-gray-700 dark:text-gray-300">Subject:</strong> {selectedMessage.subject || '(No Subject)'}</p>
             <p><strong class="font-medium text-gray-700 dark:text-gray-300">Received:</strong> {new Date(selectedMessage.created).toLocaleString()}</p>
             <hr class="dark:border-gray-600 my-3">
             <div class="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {selectedMessage.message}
             </div>
        </div>
         <div class="p-3 bg-gray-50 dark:bg-gray-700 text-right">
             <button on:click={closeModal} class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Close
             </button>
        </div>
    </div>
</div>
{/if}