import type { Handle } from '@sveltejs/kit';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { BROKER_URL, CLIENT_ID } from '$env/static/private';

const JWKS = createRemoteJWKSet(new URL(`${BROKER_URL}/.well-known/jwks.json`));

export const handle: Handle = async ({ event, resolve }) => {
	const jwt = event.cookies.get('jwt');

	if (jwt) {
		try {
			const { payload } = await jwtVerify(jwt, JWKS, {
				issuer: BROKER_URL,
				audience: CLIENT_ID
			});

			event.locals.user = {
				id: payload.sub as string,
				email: payload.email as string,
				name: payload.name as string
			};
		} catch (error) {
			event.cookies.delete('jwt', { path: '/' });
		}
	}

	return resolve(event);
};
