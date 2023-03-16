SELECT * FROM bot_configs
WHERE project_id = :project_id
AND room_name = :room_name
LIMIT 1;