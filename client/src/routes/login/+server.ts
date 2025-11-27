import { generateVerifier, generateChallenge, generateState } from '../../lib/oauth';

import { CLIENT_ID, REDIRECT_URI, BROKER_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	const verifier = await generateVerifier();
	const challenge = await generateChallenge(verifier);
	const state = await generateState();

	cookies.set('oauth_verifier', verifier, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10
	});

	const scope = 'openid profile';

	const params = new URLSearchParams({
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		response_type: 'code',
		scope,
		code_challenge: challenge,
		code_challenge_method: 'S256',
		state
	});

	throw redirect(302, `${BROKER_URL}/oauth/authorize?${params.toString()}`);
};
