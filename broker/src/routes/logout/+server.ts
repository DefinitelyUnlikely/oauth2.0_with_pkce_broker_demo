import { auth } from '$lib/auth';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, request }) => {
	const redirectTo = url.searchParams.get('redirect_uri');

	// let better-auth handle logout for the broker
	await auth.api.signOut({
		headers: request.headers
	});

	// For Single Logout, we need to contact all the service providers
	// to let them know that they should invalidate their user session as well,
	// given that we aren't issuing authorization tokens (which we could invalidate from the broker),
	// only ID tokens.

	if (redirectTo) {
		redirect(302, redirectTo);
	}

	redirect(302, '/');
};
