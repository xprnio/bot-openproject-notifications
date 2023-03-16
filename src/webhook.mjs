import express from 'express';
import { Bot } from './bot.mjs';
import constants from './constants.mjs';

function formatJSON(json) {
	const tags = "```";
	const format = 'json';
	const payload = JSON.stringify(json, null, 2);
	const newLine = '\n';

	return `${tags}${format}${newLine}${payload}${newLine}${tags}`;
}

/**
	* @param { Bot } bot
	*/
export function createWebhookHandler(bot) {
	/**
		@param { express.Request } req
		@param { express.Response } res
		*/
	return async function (req, res) {
		const message = formatJSON(req.body);
		const [room] = constants.rooms;

		console.log(JSON.stringify(req.body, null, 2));

		await bot.sendMessage(room, message);

		res.status(200).json({ success: true });
	};
}