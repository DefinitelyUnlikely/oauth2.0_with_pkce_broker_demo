import { redirect, type RequestHandler } from '@sveltejs/kit';
import { jwtVerify, createRemoteJWKSet } from 'jose';

import { REDIRECT_URI, BROKER_URL, CLIENT_ID } from '$env/static/private';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const verifierValue = cookies.get('oauth_verifier');
	const stateValue = cookies.get('oauth_state');

	if (!code || !verifierValue) {
		return new Response('Missing code or verifier', { status: 400 });
	}

	if (!stateValue) {
		return new Response('Missing stored state', { status: 400 });
	}

	if (state !== stateValue) {
		return new Response('State mismatch', { status: 400 });
	}

	const response = await fetch(`${BROKER_URL}/oauth/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded' // Per protocol standard
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: REDIRECT_URI,
			client_id: CLIENT_ID,
			code_verifier: verifierValue
		})
	});

	if (!response.ok) {
		const err = await response.text();
		return new Response(`Token exchange failed: ${err}`, { status: response.status });
	}

	const data = await response.json();

	// decode JWT, validate the signature
	const JWKS = createRemoteJWKSet(new URL(`${BROKER_URL}/.well-known/jwks.json`));

	try {
		const { payload, protectedHeader } = await jwtVerify(data.id_token, JWKS, {
			issuer: BROKER_URL,
			audience: CLIENT_ID
		});
		// store the decoded values in a httpOnly cookie
		// The Svelte team seems to recommend to use a cookie like this
		// as a key for a server side state, but for the demo I'm using it
		// to also keep track on logged in state directly.
		cookies.set('oauth_id_token', data.id_token, {
			path: '/',
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 // 1 day
		});
	} catch (error) {
		console.error('JWT verification failed:', error);
		return new Response('JWT verification failed', { status: 401 });
	} finally {
		// clear verifier and state
		cookies.delete('oauth_verifier', { path: '/' });
		cookies.delete('oauth_state', { path: '/' });
	}

	throw redirect(302, '/');
};
