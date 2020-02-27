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
	diktid INTEGER UNIQUE NOT NULL,
	dikt TEXT,
	epostadresse TEXT NOT NULL,
	PRIMARY KEY(diktid),
	FOREIGN KEY(epostadresse) REFERENCES bruker(epostadresse)
);

INSERT INTO bruker VALUES
	("test@test.no", "asdlkjwgoijwerge", "test", ""),
	("test2@test.no", "tlbkjerljwlkjwrr", "test2", "");

INSERT INTO dikt VALUES
	(0, "Sample text\nsample text", "test@test.no"),
	(1, "Sample text2\nsample text2", "test2@test.no");

