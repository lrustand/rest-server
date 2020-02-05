default:
	cat db_init.sql | sqlite3 diktsamling.db
	docker build -t rest-server .
