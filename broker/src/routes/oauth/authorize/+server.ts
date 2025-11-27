import type { RequestHandler } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { db } from '$lib/dataAccess/database';

export const GET: RequestHandler = async ({ url, request }) => {
	const client_id = url.searchParams.get('client_id');
	const redirect_uri = url.searchParams.get('redirect_uri');
	const response_type = url.searchParams.get('response_type');
	const state = url.searchParams.get('state');
	const code_challenge = url.searchParams.get('code_challenge');
	const code_challenge_method = url.searchParams.get('code_challenge_method');

	if (
		!client_id ||
		!redirect_uri ||
		!response_type ||
		!state ||
		!code_challenge ||
		!code_challenge_method
	) {
		throw error(400, 'Invalid request');
	}

	if (response_type !== 'code') {
		throw error(400, 'Invalid response type');
	}

	if (code_challenge_method !== 'S256') {
		throw error(400, 'Invalid code challenge method');
	}

	const code = nanoid();
	const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

	await db
		.insertInto('oauth_codes')
		.values({
			code,
			client_id,
			redirect_uri,
			expires_at,
			code_challenge,
			code_challenge_method
		})
		.execute();

	const redirectURL = new URL(redirect_uri);
	redirectURL.searchParams.set('code', code);
	redirectURL.searchParams.set('state', state);
	throw redirect(302, redirectURL.toString());
};
