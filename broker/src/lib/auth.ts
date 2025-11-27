import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { dialect } from './dataAccess/database';

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export const auth = betterAuth({
	baseURL: 'http://localhost:5173',
	trustedOrigins: ['http://localhost:5174'],
	database: {
		dialect,
		type: 'mssql'
	},
	socialProviders: {
		github: {
			clientId: GITHUB_CLIENT_ID,
			clientSecret: GITHUB_CLIENT_SECRET
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)] // make sure sveltekitCookies is last in the array
});
