export { apiFetch as fetch } from './fetch.mjs';
export { apiFetchLink as link } from './fetch.mjs';

export async function getWorkPackageActivities(id) {
	const res = await fetch(`/work_packages/${id}/activities`);
	return await res.json()
		.then(json => json['_embedded'])
		.then(json => json['elements']);
}

