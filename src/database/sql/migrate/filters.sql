CREATE TABLE IF NOT EXISTS bot_filters (
	config_id	INT,
	action		TEXT,

	UNIQUE(config_id, action)
);

