import express from 'express';
import { Bot } from './bot.mjs';
import constants from './constants.mjs';

const { rooms, openProjectURL } = constants;
const [room] = rooms;

function formatMessage(payload) {
	const { action } = payload;
	switch( action ) {
		case 'work_package:updated': {
			const { id } = payload.work_package;
			const url = `${openProjectURL}/work_packages/${ id }`;

			return `Work package updated:\n${ url }`;
		}
		default: 
			return `OpenProject Action: ${ action }`;
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
	return async function (req, res) {
		const message = formatMessage(req.body);
		await bot.sendMessage(room, message);

		res.status(200).json({ success: true });
	};
}