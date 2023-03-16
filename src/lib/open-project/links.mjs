import constants from '../../constants.mjs';
const { openProjectURL } = constants;

export function platform(path = '/') {
	return `${openProjectURL}${path}`;
}

export function api(path = '/') {
	return platform(`/api/v3${path}`);
}

export function workPackages(path = '/') {
	return platform(`/work_packages${path}`);
}

export function workPackage(id) {
	return workPackages(`/${id}`);
}

export function users(path = '/') {
	return platform(`/users${path}`);
}

export function user(id) {
	return users(`/${id}`);
}
