const express = require('express')
const sqlite3 = require('sqlite3').verbose()

const app = express()
const port = 3000
var db = new sqlite3.Database('diktsamling.db')

db.serialize(function () {
	db.run('DROP TABLE IF EXISTS bruker')
	db.run('CREATE TABLE bruker (epostadresse TEXT UNIQUE NOT NULL, '
		+ 'passordhash TEXT NOT NULL, fornavn TEXT NOT NULL, etternavn TEXT, '
		+ 'PRIMARY KEY(epostadresse))')

	db.run('DROP TABLE IF EXISTS sesjon')
	db.run('CREATE TABLE sesjon (sesjonsid INTEGER NOT NULL, epostadresse TEXT UNIQUE NOT NULL, '
		+ 'PRIMARY KEY(sesjonsID), FOREIGN KEY(epostadresse) REFERENCES bruker(epostadresse))')

	db.run('DROP TABLE IF EXISTS dikt')
	db.run('CREATE TABLE dikt (diktid INTEGER NOT NULL, dikt TEXT, '
		+ 'epostadresse TEXT UNIQUE NOT NULL, PRIMARY KEY(diktid),'
		+ 'FOREIGN KEY(epostadresse) REFERENCES bruker(epostadresse))')

	var stmt = db.prepare('INSERT INTO bruker VALUES ((?), (?), (?), (?))')
	
	stmt.run("test@test.no", "sdfaseldjasdg", "test", "")
	stmt.run("test2@test.no", "sdelkfjalkja", "test2", "")

	stmt.finalize()

	var stmt = db.prepare('INSERT INTO dikt VALUES ((?), (?), (?))')

	stmt.run("0", "Sample text\nsample text", "test@test.no")
	stmt.run("1", "Sample text\nsample text2", "test2@test.no")

	stmt.finalize()
})

db.close()
app.get(['/diktsamling/*'], function (req, res) {

	var response = ""

	if( req.params[0].search(/[^0-9a-z\/]/gi) == -1)
	{
		console.log(req.connection.remoteAddress + " requests " + req.path)
		var args = req.params[0].split("/")
		
		if(args.length == 2)
		{
			db.serialize(function () {
				switch(args[0])
				{
					case "dikt":
						db = new sqlite3.Database('diktsamling.db')
						
						db.all(`SELECT * FROM dikt, bruker WHERE diktid='${args[1]}' AND `
							+ `dikt.epostadresse=bruker.epostadresse`, function (err, rows) {
							
							response += "<table>\n"
							for(index in rows)
							{
								row = rows[index]
								response += `<tr>\n<td>${row.diktid}</td>\n`
									+ `<td>${row.dikt}</td>\n`
									+ `<td>${row.fornavn}</td>\n`
									+ `<td>${row.etternavn}</td>\n`
									+ `<td>${row.epostadresse}</td>\n</tr>\n`
							}
							response += "</table>\n"
							res.send(response)
						})
						db.close()
						break
					default:
						res.send(`<div style="font-family:Comic Sans MS"><h1>`
							+ `Table "${args[0]}" either does not exist, `
							+ `or does not provide access</h1></div>\n`)
				}
			})
		}
	}
})
app.post('/', (req, res) => res.send('Hello World!'))
app.put('/', (req, res) => res.send('Hello World!'))
app.delete('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
