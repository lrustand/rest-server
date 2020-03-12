default:
	cat db_init.sql | sqlite3 diktsamling.db
	sudo docker build -t rest-server .
