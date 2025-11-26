import { oauthState, oauthVerifier } from '../../lib/stores/oauthStore';
import { generateVerifier, generateChallenge, generateState } from '../../lib/oauth';

import { CLIENT_ID, REDIRECT_URI, BROKER_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

// Clear verifier just in case
oauthVerifier.set(null);
oauthState.set(null);

// Generate verifier and challenge
const verifier = await generateVerifier();
const challenge = await generateChallenge(verifier);
const state = await generateState();

// Set verifier and state
oauthVerifier.set(verifier);
oauthState.set(state);

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
