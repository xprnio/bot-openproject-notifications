import WorkPackagesRouter from "./work-packages.mjs";

const handlers = [
	WorkPackagesRouter,
];

export function createHandler(bot) {
	return async function(payload) {
		for(const handler of handlers) {
			await handler(payload, bot);
		}
	}
}

