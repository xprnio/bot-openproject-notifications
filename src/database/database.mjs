import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import sql from './sql.mjs';

export async function createDatabase(filename) {
	const db = await open({
		filename,
		driver: sqlite3.Database,
	});

	await sql.migrate(db);

	return db;
}


export async function getConfig(db, project_id, room_name) {
	return sql.configs.one(db, {
		':project_id': project_id,
		':room_name': room_name,
	});
};

export async function hasConfig(db, project_id, room_name) {
	const config = await getConfig(db, project_id, room_name);
	return config !== undefined;
};

export async function listAllConfigs(db) {
	return sql.configs.all(db);
}

export async function listRoomConfigs(db, room_name) {
	return sql.configs.room(db, {
		':room_name': room_name,
	});
}

export async function listProjectConfigs(db, project_id) {
	return sql.configs.project(db, {
		':project_id': project_id,
	});
}

export async function createConfig(db, project_id, room_name) {
	if (await hasConfig(db, project_id, room_name)) {
		throw new Error('Configuration already exists');
	}

	return sql.configs.create(db, {
		':project_id': project_id,
		':room_name': room_name,
	});
}

export async function createFilter(db, config_id, action) {
	if (await hasFilter(db, config_id, action)) {
		throw new Error('Configuration filter already exists');
	}
	return sql.filters.create(db, {
		':config_id': config_id,
		':action': action,
	});
}

export async function hasFilter(db, config_id, action) {
	const result = await sql.filters.find(db, {
		':config_id': config_id,
		':action': action,
	});
	console.log({ result });

	return result !== undefined;
}

export async function listFilters(db, config_id) {
	return sql.filters.all(db, {
		':config_id': config_id,
	});
}
