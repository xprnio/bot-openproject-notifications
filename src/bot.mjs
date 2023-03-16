import { driver } from '@rocket.chat/sdk';
import { Command } from 'commander';
import { createConfig, createFilter, getConfig, listAllConfigs, listFilters, listProjectConfigs, listRoomConfigs } from './database/database.mjs';
import sql from './database/sql.mjs';
import * as format from './lib/rocket-chat/formatters.mjs';

/**
  * @param { Bot } bot
  */
const createCommander = (bot, room) => {
  const command = (name = undefined) => {
    const c = new Command(name);

    const sendMessage = (str) => {
      const message = format.code(str.split('\n'), 'text');
      return bot.sendMessage(room, message);
    };

    c.exitOverride();
    c.configureOutput({
      writeOut: sendMessage,
      writeErr: sendMessage,
    });

    return c;
  };

  const program = command();
  program.name('@bot-openproject');

  const config = command('config');

  config.command('list')
    .option('-c, --channel <channel>', 'Filter configurations for this channel')
    .option('-p, --project <project>', 'Filter configurations for this project')
    .action(async ({ channel, project }) => {
      const configs = (!channel && !project)
        ? await listAllConfigs(bot.database)
        : channel
          ? await listRoomConfigs(bot.database, channel)
          : await listProjectConfigs(bot.database, project);
      bot.sendMessage(room, format.code(JSON.stringify(configs, null, 2).split('\n'), 'json'));
    });

  config.command('create')
    .argument('<project>', 'The project to assign to the channel')
    .argument('[channel]', 'Channel to create a configuration for')
    .action(async (project, channel = room) => {
      try {
        const config = await createConfig(bot.database, project, channel);
        await bot.sendMessage(room, [
          `Configuration created for ${channel}`,
          format.code(JSON.stringify(config, null, 2).split('\n'), 'json'),
        ]);
      } catch (err) {
        await bot.sendMessage(room, err.message);
      }
    });

  const filters = command('filters');

  filters.command('list')
    .option('-p, --project <project>', 'List notification filters for this project')
    .option('-c, --channel <project>', 'List notification filters for this channel')
    .action(async ({ channel, project }) => {
      const where = [];
      if (channel) {
        if (Array.isArray(channel)) {
          const or = channel
            .map(channel => `c.room_name = '${channel}'`)
            .join(' OR ');
          where.push(`(${or})`);
        } else {
          where.push(`c.room_name = '${channel}'`);
        }
      }
      if (project) {
        if (Array.isArray(project)) {
          const or = project
            .map(project => `c.project_id = ${project}`)
            .join(' OR ');
          where.push(`(${or})`);
        } else {
          where.push(`c.project_id = ${project}`);
        }
      }
      const query = `
        SELECT
          f.config_id,
          c.project_id,
          c.room_name,
          f.action
        FROM bot_filters AS f
        LEFT JOIN bot_configs AS c ON c.id = f.config_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      `;
      const result = await bot.database.all(query);
      await bot.sendMessage(room, [
        format.code(JSON.stringify(result, null, 2).split('\n'), 'json'),
      ]);
    });

  filters.command('create')
    .argument('<action>', 'The action to assign')
    .argument('<project>', 'The project to assign the filter to')
    .argument('[channel]', 'The channel to assign the filter to', room)
    .action(async (action, project, channel) => {
      const config = await getConfig(bot.database, project, channel);
      if (!config) {
        await bot.sendMessage(room, 'Missing configuration');
        return;
      }
      const filter = await createFilter(bot.database, config.id, action);

      await bot.sendMessage(room, [
        format.code(JSON.stringify(filter, null, 2).split('\n'), 'json'),
      ]);
    });

  program.addCommand(config);
  program.addCommand(filters);

  return program;
};

export class Bot {
  /** @type {Database} */
  database = undefined;
  /** @type {IAsteroid} */
  connection = undefined;
  /** @type {string} */
  id = undefined;

  constructor(database, connection, id) {
    this.database = database;
    this.connection = connection;
    this.id = id;
  }

  async initialize() {
    await driver.subscribeToMessages();
    driver.reactToMessages((err, message, options) => {
      return this.handleMessage(err, message, options);
    });
  }

  async handleNotification({ project_id, action }, message) {
    const rooms = await this.database.all(`
      SELECT
        c.room_name
      FROM
        bot_filters AS f LEFT JOIN
        bot_configs AS c ON f.config_id = c.id
      WHERE
        c.project_id = ${project_id} AND
        f.action = '${action}'
    `);

    for (const { room_name } of rooms) {
      await this.sendMessage(room_name, message);
    }
  }

  async handleMessage(err, payload, options) {
    if (err) {
      console.error('Error receiving message', err);
      return;
    }

    const {
      rid: roomId,
      msg: message,
      u: user,
    } = payload;

    const name = '@bot-openproject';
    if (!message.startsWith(`${name} `)) return;

    const room = await driver.getRoomName(roomId);
    if (user.username !== 'ragnar') {
      await this.sendMessage(room, 'I will only respond to @ragnar');
      return;
    }

    const [, ...command] = message.split(' ');
    const commander = createCommander(this, room);
    console.log(command);
    try {
      commander.parse(command, { from: 'user' });
    } catch (err) { }
  }

  async sendMessage(room, content) {
    if (Array.isArray(content)) {
      return this.sendMessage(
        room,
        content.join('\n'),
      );
    }

    if (typeof content !== 'string') {
      throw new Error(`Invalid message: ${content}`);
    }

    console.log('Sending message to', room);
    console.log('>', content);
    await driver.sendToRoom(content, room);
  }
}

export async function createBot({
  database,
  hostname,
  username = 'openproject',
  password = '',
  rooms = [],
  ssl = true,
}) {
  const connection = await driver.connect({ host: hostname, useSsl: ssl !== false })
  const botId = await driver.login({ username, password });
  await driver.joinRooms(rooms);

  const bot = new Bot(database, connection, botId);
  await bot.initialize();

  return bot;
}
