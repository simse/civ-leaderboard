import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	await platform?.env?.KV.delete("games_from_google_sheets");

	return new Response('OK');
};