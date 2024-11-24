import type { RequestHandler } from './$types';
import { clearGamesCache } from '$lib/sheets';

export const GET: RequestHandler = async ({ }) => {
	clearGamesCache();

	return new Response('OK');
};