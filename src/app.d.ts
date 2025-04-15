import PocketBase from 'pocketbase';
import type { Admin, Record } from 'pocketbase'; // Or your specific user model type

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            pb: PocketBase;
            user: Admin | Record | undefined; // Or your user type
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
// // See https://svelte.dev/docs/kit/types#app.d.ts
// // for information about these interfaces
// declare global {
// 	namespace App {
// 		// interface Error {}
// 		// interface Locals {}
// 		// interface PageData {}
// 		// interface PageState {}
// 		// interface Platform {}
// 	}
// }

// export {};
