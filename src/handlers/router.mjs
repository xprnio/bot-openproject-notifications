export function router(routes) {
	return function (payload, bot) {
		if (!routes[payload.action]) return;

		const handler = routes[payload.action];
		return handler(payload, bot);
	}
}