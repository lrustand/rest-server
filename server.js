const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const formater = require('./formater')

const app = express()
const port = 3000

var db = new sqlite3.Database('diktsamling.db')

// Databaseopperasjoner i serie
db.serialize(function () {

	// Lager brukertabell
	db.run('DROP TABLE IF EXISTS bruker')
	db.run('CREATE TABLE bruker (epostadresse TEXT UNIQUE NOT NULL, '
		+ 'passordhash TEXT NOT NULL, fornavn TEXT NOT NULL, etternavn TEXT, '
		+ 'PRIMARY KEY(epostadresse))')

	// Lager tabell over sesjoner
	db.run('DROP TABLE IF EXISTS sesjon')
	db.run('CREATE TABLE sesjon (sesjonsid INTEGER NOT NULL, epostadresse TEXT UNIQUE NOT NULL, '
		+ 'PRIMARY KEY(sesjonsid), FOREIGN KEY(epostadresse) REFERENCES bruker(epostadresse))')

	// Lager tabell over dikt
	db.run('DROP TABLE IF EXISTS dikt')
	db.run('CREATE TABLE dikt (diktid INTEGER NOT NULL, dikt TEXT, '
		+ 'epostadresse TEXT UNIQUE NOT NULL, PRIMARY KEY(diktid),'
		+ 'FOREIGN KEY(epostadresse) REFERENCES bruker(epostadresse))')

	// Setter inn testbrukere i brukertabell
	var stmt = db.prepare('INSERT INTO bruker VALUES ((?), (?), (?), (?))')
	
	stmt.run("test@test.no", "sdfaseldjasdg", "test", "")
	stmt.run("test2@test.no", "sdelkfjalkja", "test2", "")

	stmt.finalize()

	// Setter inn test dikt i dikttabell
	var stmt = db.prepare('INSERT INTO dikt VALUES ((?), (?), (?))')

	stmt.run("0", "Sample text\nsample text", "test@test.no")
	stmt.run("1", "Sample text\nsample text2", "test2@test.no")

	stmt.finalize()
})
db.close()

// GET reqest til diktdatabase
app.get(['/diktsamling/*'], function (req, res)
{
	var response = ""

	// Sjekker at request er alphanumerisk
	if( req.params[0].search(/[^0-9a-z\/]/gi) == -1)
	{
		console.log(req.connection.remoteAddress + " requests " + req.path)

		//Deler opp * biten av urlen på /
		var args = req.params[0].split("/")
		
		
		// Åpner databasen og kjører opperasjoner i serie avhengig av argument 0
		db = new sqlite3.Database('diktsamling.db')
		
		db.serialize(function ()
		{
			switch(args[0])
			{
				case "dikt":
					// Sjekker om det er 1 argument etter deling
					if(args.length == 1)
					{
						// Henter alle dikt med informasjon om forfatter
						db.all(`SELECT * FROM dikt, bruker WHERE `
							+ `dikt.epostadresse=bruker.epostadresse`, function (err, rows)
						{
							
							response += formater.dikt(rows)
							res.send(response)
						})
					}
					else if(args.length == 2)
					{
						// Søker etter dikt og føyer til informasjon om forfatter
						db.all(`SELECT * FROM dikt, bruker WHERE diktid='${args[1]}' AND `
							+ `dikt.epostadresse=bruker.epostadresse`, function (err, rows)
						{
							
							response += formater.dikt(rows)
							res.send(response)
						})
					}
					break

				default:
					// Feilmelding dersom bruker forespør tabell som ikke støttes
					res.send(`<div style="font-family: Helvetica"><h1>`
						+ `Table "${args[0]}" either does not exist, `
						+ `or does not provide access</h1></div>\n`)
					break
			}
		})
		db.close()
	}
})

// TBA
app.post('/', (req, res) => res.send('Hello World!'))
app.put('/', (req, res) => res.send('Hello World!'))
app.delete('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
