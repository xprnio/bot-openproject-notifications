import express from 'express';
import fetch from 'node-fetch';
import { Bot } from './bot.mjs';
import constants from './constants.mjs';

const { rooms, openProjectURL } = constants;
const openProjectApiUrl = `${openProjectURL}/api/v3`;
const [room] = rooms;

function createAuthorization() {
	const { openProjectApiKey } = constants;
	return `Basic apikey:${openProjectApiKey}`;
}

async function getWorkPackageActivities(id) {
	const url = `${openProjectApiUrl}/work_packages/${id}/activities`;
	const res = await fetch(url, {
		headers: {
			'Authorization': createAuthorization(),
		},
	});
	return await res.json()
		.then(json => {
			console.log(JSON.stringify(json, null, 2));
			return json;
		})
		.then(json => json['_embedded'])
		.then(json => json['elements']);
}

async function formatMessage(payload) {
	const { action } = payload;
	switch (action) {
		case 'work_package:updated': {
			const { id } = payload.work_package;
			const url = `${openProjectURL}/work_packages/${id}`;
			const activities = await getWorkPackageActivities(id);
			const lastActivity = activities[activities.length - 1];

			console.log(
				'work_package:updated',
				JSON.stringify(lastActivity, null, 2),
			);

			return [
				`Changes were made to work package #${id}: ${url}`,
				...lastActivity.details.map(details => details['raw']),
			];
		}
		default:
			return `OpenProject Action: ${action}`;
	}
}

/**
	* @param { Bot } bot
	*/
export function createWebhookHandler(bot) {
	/**
		@param { express.Request } req
		@param { express.Response } res
		*/
	return async function(req, res) {
		const message = await formatMessage(req.body);
		await bot.sendMessage(room, message);

		res.status(200).json({ success: true });
	};
}