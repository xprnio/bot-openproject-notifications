import { apiFetch as fetch } from './fetch.mjs';
export { apiFetch as fetch } from './fetch.mjs';
export { apiFetchLink as link } from './fetch.mjs';

export async function getWorkPackageActivities(id) {
	return await fetch(`/work_packages/${id}/activities`)
		.then(json => json['_embedded'])
		.then(json => json['elements']);
}

