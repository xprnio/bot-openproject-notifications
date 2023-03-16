import { Bot } from '../bot.mjs';
import { router } from './router.mjs';

import * as format from '../lib/rocket-chat/formatters.mjs';
import * as links from '../lib/open-project/links.mjs';
import * as api from '../lib/open-project/api.mjs';
import constants from '../constants.mjs';

const action = (action) => `work_package:${action}`;

const WorkPackagesRouter = router({
	/**
		* @param { * } payload
		* @param { Bot } bot
		*/
	[action('updated')]: async (payload, bot) => {
		const { id, subject } = payload.work_package;
		const url = links.workPackage(id);
		const activities = await api.getWorkPackageActivities(id);
		const lastActivity = activities[activities.length - 1];

		const userLink = lastActivity['_links']['user']['href'];
		const user = await api.link(userLink);

		await bot.sendMessage(constants.rooms[0], [
			`Work package updated by ${format.link(
				user.name,
				links.user(user.id),
			)}`,
			format.link(
				`#${id} - ${subject}`,
				url,
			),
			format.code(
				...lastActivity.details
					.map(details => details['raw'])
					.map(row => `- ${row}`),
			),
		]);
	},
	[action('created')]: async (payload, bot) => {
		// TODO
	},
});

export default WorkPackagesRouter;