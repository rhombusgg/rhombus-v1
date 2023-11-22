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
		id: string;
		discord?: {
			id: string;
			image: string;
			username: string;
			globalUsername: string;
		};
		emails: string[];
		avatarFallback: string;
		isTeamOwner: boolean;
		team: {
			id: string;
			ownerId: string;
			users: {
				id: string;
				discord: {
					id: string;
					username: string;
					globalUsername: string;
					image: string;
				} | null;
				emails: {
					email: string;
				}[];
			}[];
		};
	}
}

export {};
