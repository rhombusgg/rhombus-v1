// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		interface Locals {
			session: Session | undefined;
		}

		interface PageData {
			session: Session | undefined;
		}
	}

	interface Session {
		discord?: {
			id: string;
			image: string;
			username: string;
			globalUsername: string;
		};
		emails: string[];
		avatarFallback: string;
	}
}

export {};
