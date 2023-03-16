export { apiFetchLink as link } from './fetch.mjs';

export async function getWorkPackageActivities(id) {
	const res = await apiFetch(`/work_packages/${id}/activities`);
	return await res.json()
		.then(json => json['_embedded'])
		.then(json => json['elements']);
}

