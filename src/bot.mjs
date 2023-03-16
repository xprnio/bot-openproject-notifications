import { driver } from '@rocket.chat/sdk';

export class Bot {
  /** @type {IAsteroid} */
  connection = undefined;
  /** @type {string} */
  id = undefined;

  constructor(connection, id) {
    this.connection = connection;
    this.id = id;
  }

  async sendMessage(room, content) {
    if (Array.isArray(content)) {
      return this.sendMessage(
        room,
        content.join(','),
      );
    }

    if (typeof content !== 'string') {
      throw new Error(`Invalid message: ${content}`);
    }

    await driver.sendToRoom(content, room);
  }
}

export async function createBot({
  hostname,
  username = 'openproject',
  password = '',
  rooms = [],
  ssl = true,
}) {
  const connection = await driver.connect({ host: hostname, useSsl: ssl !== false })
  const botId = await driver.login({ username, password });
  await driver.joinRooms(rooms);

  return new Bot(connection, botId);
}
