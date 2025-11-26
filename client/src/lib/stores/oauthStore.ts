import { writable } from 'svelte/store';

export const oauthVerifier = writable<string | null>(null);
