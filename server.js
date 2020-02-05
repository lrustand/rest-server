const express = require('express')
const sqlite3 = require('sqlite3').verbose()

const app = express()
const port = 3000


var db = new sqlite3.Database('diktsamling.db')

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


		switch(args[0])
		{
			case "dikt":
				// Sjekker om det er 1 argument etter deling
				if(args.length == 1)
				{
					// Henter alle dikt med informasjon om forfatter
					db.all(`SELECT diktid,dikt,fornavn,etternavn FROM dikt, bruker WHERE `
						+ `dikt.epostadresse=bruker.epostadresse`, function (err, rows)
					{

						response += JSON.stringify(rows,null,4)
						res.setHeader("Content-Type", "application/json")
						res.cookie("asd","12345")
						res.send(response)
					})
				}
				else if(args.length == 2)
				{
					// Søker etter dikt og føyer til informasjon om forfatter
					db.all(`SELECT diktid,dikt,fornavn,etternavn FROM dikt, bruker WHERE diktid='${args[1]}' AND `
						+ `dikt.epostadresse=bruker.epostadresse`, function (err, rows)
					{

						response += JSON.stringify(rows,null,4)
						res.setHeader("Content-Type", "application/json")
						res.send(response)
					})
				}
				break

			default:
				// Feilmelding dersom bruker forespør tabell som ikke støttes
				res.status(404)
				res.send("")
				break
		}
	}
})

// TBA
app.post('/', (req, res) => res.send('Hello World!'))
app.put('/', (req, res) => res.send('Hello World!'))
app.delete('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
