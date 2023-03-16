import { config } from 'dotenv';
config();

const {
  ROCKET_CHAT_HOST,
  OPEN_PROJECT_URL,
  BOT_USERNAME,
  BOT_PASSWORD,
  BOT_ROOMS,
  PORT = 8888,
} = process.env;

export default {
  hostname: ROCKET_CHAT_HOST,
  username: BOT_USERNAME,
  password: BOT_PASSWORD,
  rooms: BOT_ROOMS.split(',').map(room => room.trim()),
  port: PORT,

  openProjectURL: OPEN_PROJECT_URL,
};