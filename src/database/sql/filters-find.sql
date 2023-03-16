SELECT * FROM bot_filters
WHERE config_id = :config_id
AND action = :action
LIMIT 1;