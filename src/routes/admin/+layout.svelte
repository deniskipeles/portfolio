<script lang="ts">
    import '../../app.css'; // Assuming main CSS is imported elsewhere or here
    import type { LayoutData } from './$types';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import { LogOut, LayoutDashboard, FileText, MessageSquare, Settings, Briefcase } from 'lucide-svelte'; // Example icons

    export let data: LayoutData; // Contains user from server load

    $: userEmail = data.user?.email; // Adjust if using a different field

    const navItems = [
        // { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/projects', label: 'Projects', icon: Briefcase },
        { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
        { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
        { href: '/admin/settings', label: 'Site Settings', icon: Settings },
    ];
</script>

<div class="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <a href="/admin/projects" class="text-xl font-bold text-indigo-600 dark:text-indigo-400">Admin Panel</a>
        </div>
        <nav class="flex-1 overflow-y-auto p-4 space-y-2">
            {#each navItems as item}
                {@const isActive = $page.url.pathname.startsWith(item.href)}
                <a
                    href={item.href}
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    class:bg-indigo-100={isActive}
                    class:dark:bg-indigo-900={isActive}
                    class:text-indigo-700={isActive}
                    class:dark:text-indigo-300={isActive}
                    class:text-gray-600={!isActive}
                    class:dark:text-gray-300={!isActive}
                    class:hover:bg-gray-200={!isActive}
                    class:dark:hover:bg-gray-700={!isActive}
                >
                    <svelte:component this={item.icon} class="w-5 h-5 mr-3" />
                    {item.label}
                </a>
            {/each}
        </nav>
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate mb-2" title={userEmail}>{userEmail || 'Admin'}</p>
            <!-- Logout Form -->
            <form method="POST" action="/admin/logout" use:enhance>
                <button type="submit" class="w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
                    <LogOut class="w-5 h-5 mr-2" />
                    Logout
                </button>
            </form>
        </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <slot /> <!-- Admin page content goes here -->
    </main>
</div>