import { authClient } from '$lib/authClient';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const redirectTo = url.searchParams.get('redirectTo');

	if (redirectTo) {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					redirect(302, redirectTo); // redirect to login page
				}
			}
		});
	}

	await authClient.signOut();
	redirect(302, '/');
};
