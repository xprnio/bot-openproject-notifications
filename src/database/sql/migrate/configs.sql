CREATE TABLE IF NOT EXISTS bot_configs (
	id			INTEGER PRIMARY KEY,
	project_id	INT NOT NULL,
	room_name	TEXT NOT NULL,

	UNIQUE(project_id, room_name)
);
