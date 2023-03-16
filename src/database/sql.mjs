import { readFileSync as readFile } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

const execRunner = (db, sql, params) => db.run(sql, params);
const oneRunner  = (db, sql, params) => db.get(sql, params);
const allRunner = (db, sql, params) => db.all(sql, params);

const multipleSql = (filenames, runner = execRunner) => {
	const contents = filenames.map(filename => {
		const path = resolvePath('src/database/sql', filename);
		return readFile(path, 'utf-8');
	});

	return async (db, params = undefined) => {
		for(const sql of contents) {
			console.log(`Running query`, { sql, params });
			await runner(db, sql, params);
		}
	}
};
const sql = (filename, runner = execRunner) => {
	const path = resolvePath('src/database/sql', filename);
	const contents = readFile(path, 'utf-8');

	return (db, params = undefined) => {
		console.log(`Running query`, { sql: contents, params });
		return runner(db, contents, params);
	};
};

export default {
	migrate: multipleSql([
		'migrate/configs.sql',
		'migrate/filters.sql',
	]),
	configs: {
		create: sql('configs-insert.sql'),
		all: sql('configs-all.sql', allRunner),
		one: sql('configs-one.sql', oneRunner ),
		room: sql('configs-room.sql', allRunner),
		project: sql('configs-project.sql', allRunner),
	},
	filters: {
		create: sql('filters-insert.sql'),
		find: sql('filters-find.sql', oneRunner),
		all: sql('filters-all.sql', allRunner),
	},
};
