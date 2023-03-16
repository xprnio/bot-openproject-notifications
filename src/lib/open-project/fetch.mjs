import fetch from 'node-fetch';
import constants from '../../constants.mjs';
const { openProjectURL } = constants;

const API_URL = `${openProjectURL}/api/v3`;

function createAuthorization() {
	const { openProjectApiKey } = constants;
	const auth = Buffer.from(`apikey:${openProjectApiKey}`).toString('base64');
	return `Basic ${auth}`;
}

function createHeaders() {
	return {
		'Authorization': createAuthorization(),
	};
}

export async function apiFetch(url) {
	const headers = createHeaders();
	const res = await fetch(`${API_URL}${url}`, { headers });
	return await res.json();
}

export async function apiFetchLink(link) {
	const headers = createHeaders();
	const res = await fetch(`${openProjectURL}${link}`, { headers });
	return await res.json();
}
