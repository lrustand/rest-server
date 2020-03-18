DROP TABLE IF EXISTS bruker;
CREATE TABLE bruker
(
	epostadresse TEXT UNIQUE NOT NULL,
	passordhash TEXT NOT NULL,
	fornavn TEXT NOT NULL,
	etternavn TEXT,
	PRIMARY KEY(epostadresse)
);

DROP TABLE IF EXISTS sesjon;
CREATE TABLE sesjon
(
	sesjonsid TEXT UNIQUE NOT NULL,
	epostadresse TEXT NOT NULL,
	PRIMARY KEY(sesjonsid),
	FOREIGN KEY(epostadresse) REFERENCES bruker(epostadresse)
);

DROP TABLE IF EXISTS dikt;
CREATE TABLE dikt
(
	diktid INTEGER PRIMARY KEY AUTOINCREMENT,
	dikt TEXT,
	epostadresse TEXT NOT NULL,
	FOREIGN KEY(epostadresse) REFERENCES bruker(epostadresse)
);

INSERT INTO bruker VALUES
	("test@test.no", "5a105e8b9d40e1329780d62ea2265d8a", "test", ""),
	("test2@test.no", "ad0234829205b9033196ba818f7a872b", "test2", ""),
	("meg", "1a1dc91c907325c69271ddf0c944bc72", "meg", "selv");

INSERT INTO dikt VALUES
	(0, "Sample text\nsample text", "test@test.no"),
	(1, "Sample text2\nsample text2", "test2@test.no");

