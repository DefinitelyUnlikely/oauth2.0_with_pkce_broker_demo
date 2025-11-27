import type { RequestHandler } from './$types';
import { db } from '$lib/dataAccess/database';
import { auth } from '$lib/auth';
import { error, json } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import { SignJWT } from 'jose';

async function verifyChallenge(verifier: string, challenge: string, method: string) {
	if (method !== 'S256') return false;

	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const hash = await crypto.subtle.digest('SHA-256', data);

	// Convert to base64url
	const hashArray = Array.from(new Uint8Array(hash));
	const base64 = btoa(String.fromCharCode(...hashArray))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	return base64 === challenge;
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.formData();
	const grant_type = body.get('grant_type');
	const code = body.get('code')?.toString();
	const redirect_uri = body.get('redirect_uri')?.toString();
	const client_id = body.get('client_id')?.toString();
	const code_verifier = body.get('code_verifier')?.toString();

	if (grant_type !== 'authorization_code') {
		throw error(400, 'Invalid grant type');
	}

	if (!code || !redirect_uri || !client_id || !code_verifier) {
		throw error(400, 'Missing parameters');
	}

	const authCode = await db
		.selectFrom('oauth_codes')
		.selectAll()
		.where('code', '=', code)
		.executeTakeFirst();

	if (!authCode) {
		throw error(400, 'Invalid code');
	}

	if (authCode.expires_at < new Date()) {
		throw error(400, 'Code expired');
	}

	if (authCode.client_id !== client_id) {
		throw error(400, 'Invalid client id');
	}

	if (authCode.redirect_uri !== redirect_uri) {
		throw error(400, 'Invalid redirect uri');
	}

	const isValidChallenge = await verifyChallenge(
		code_verifier,
		authCode.code_challenge,
		authCode.code_challenge_method
	);
	if (!isValidChallenge) {
		throw error(400, 'Invalid code verifier');
	}

	const session = await auth.api.getSession(request);

	if (!session || !session.user || session.user.id !== authCode.user_id) {
		throw error(401, 'Unauthorized');
	}

	const secret = new TextEncoder().encode(JWT_SECRET);
	const jwt = await new SignJWT({
		sub: session.user.id,
		name: session.user.name,
		email: session.user.email
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setIssuer('http://localhost:5173')
		.setAudience(client_id)
		.setExpirationTime('1h')
		.sign(secret);

	await db.deleteFrom('oauth_codes').where('code', '=', code).execute();

	return json({
		token: jwt,
		token_type: 'Bearer',
		expires_in: 3600
	});
};
