import express from 'express';
import { createHandler } from './handlers/index.mjs';
import { Bot } from './bot.mjs';

/**
	* @param { Bot } bot
	*/
export function createWebhookHandler(bot) {
	const handle = createHandler(bot);

	/**
		@param { express.Request } req
		@param { express.Response } res
		*/
	return async function(req, res) {
		await handle(req.body);
		res.status(200).json({ success: true });
	};
}