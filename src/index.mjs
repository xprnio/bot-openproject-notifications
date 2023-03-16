import express from 'express';

import constants from './constants.mjs';
import { Bot, createBot } from './bot.mjs';
import { createWebhookHandler } from './webhook.mjs';

/** @param { Bot } bot */
function createServer(bot) {
  const server = express();

  server.use(express.json());
  server.post('/webhook', createWebhookHandler(bot));

  return new Promise((resolve) => {
    server.listen(constants.port, resolve);
  });
}

async function main() {
  const bot = await createBot({
    hostname: constants.hostname,
    username: constants.username,
    password: constants.password,
    rooms: constants.rooms,
  });
  console.log('Bot created', bot.id);

  await createServer(bot);
  console.log('Webhook server running on port', constants.port);
}

main().catch(
  (err) => {
    console.error(err);
    process.exit(1);
  },
)
