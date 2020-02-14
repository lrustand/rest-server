const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const SqlString = require('sqlstring')

const app = express()
app.use(express.json())
const port = 3000


var db = new sqlite3.Database('diktsamling.db')

// GET reqest til diktdatabase
app.get(['/diktsamling/*'], function (req, res)
{
	var response = ""

	// Sjekker at request er alphanumerisk
	if( req.params[0].search(/[^0-9a-z\/]/gi) != -1) return

	console.log(req.connection.remoteAddress + " requests " + req.path)

	// Deler opp * biten av urlen på /
	var args = req.params[0].split("/")

	// Tar bort alle tomme elementer fra args
	args = args.filter((element) => element.length > 0)

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
})

// TBA
app.post('/diktsamling/dikt/', (req, res) =>
{
	console.log(`${req.connection.remoteAddress} `
		+ `requests to insert at ${req.path} as ${req.body.epostadresse}`)

	db.run(`INSERT INTO dikt `
		+ `(`
		+	`diktid, `
		+	`dikt, `
		+	`epostadresse`
		+ `)`
		+ ` VALUES `
		+ `(`
		+	`NULL, `
		+	`${SqlString.escape(req.body.dikt)}, `
		+	`${SqlString.escape(req.body.epostadresse)}`
		+ `)`
		, function(err)
	{
		if (err)
		{
			res.status(400)
			return console.error(err.message)
		}

		res.send()
		console.log(`\t200 ${req.path}${this.lastID} successfully created by `
		+ `${req.connection.remoteAddress} as ${req.body.epostadresse}`)
	})
})

app.put('/diktsamling/dikt/*', (req, res) =>
{
	console.log(`${req.connection.remoteAddress} requests to update ${req.path}`)

	// Sjekker at request er alphanumerisk
	if( req.params[0].search(/[^0-9a-z]/gi) != -1) return

	db.run(`UPDATE dikt SET dikt=${SqlString.escape(req.body.dikt)} `
		+ `WHERE diktid=${req.params[0]}`, function(err)
	{
		if (err) return console.error(err.message)

		if(this.changes > 0)
		{
			res.send()
			console.log(`\t200 ${req.path} successfully updated`)
		}
		else
		{
			res.status(404)
			console.log(`\t404 ${req.path} not found`)
		}
	})
})

app.delete('/diktsamling/dikt/', (req, res) => 
{
	console.log(`${req.connection.remoteAdress} requests to delete ${req.path}`)

	db.run(`DELETE FROM dikt WHERE epostadresse = ${SqlString.escape(req.body.epostadresse)}`, function(err)
	{
		if (err) return console.error(err.message)

		if(this.changes > 0)
		{
			res.send()
			console.log(`\t200 ${req.body.epostadresse} successfully deleted`)
		}
		else
		{
			res.status(404)
			console.log(`\t404 ${req.body.epostadresse} bad actor`)
		}
	}
	)
})

app.delete('/diktsamling/dikt/*', (req, res) => 
{
	console.log(`${req.connection.remoteAddress} requests to delete ${req.path}`)

	db.run(`DELETE FROM dikt WHERE diktid=${SqlString.escape(req.params[0])}`, function(err)
	{
		if (err) return console.error(err.message)

		if(this.changes > 0)
		{
			res.send()
			console.log(`\t200 ${req.path} successfully deleted`)
		}
		else
		{
			res.status(404)
			console.log(`\t404 ${req.path} not found`)
		}
	}
	)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
