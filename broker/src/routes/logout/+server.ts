import { auth } from '$lib/auth';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, request }) => {
	const redirectTo = url.searchParams.get('redirect_uri');

	await auth.api.signOut({
		headers: request.headers
	});

	if (redirectTo) {
		redirect(302, redirectTo);
	}

	redirect(302, '/');
};
