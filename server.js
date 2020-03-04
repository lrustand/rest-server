const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const SqlString = require('sqlstring')
const cookieParser = require('cookie-parser')
const crypto = require('crypto');

const app = express()
app.use(cookieParser())
app.use(express.json())
const port = 3000


var db = new sqlite3.Database('diktsamling.db')

// GET request til diktdatabase
// Henter alle dikt
app.get(['/diktsamling/dikt/'], (req, res) =>
{
	console.log(`${req.connection.remoteAddress} `
		+ `requests ${req.path}`)

	// Henter alle dikt med informasjon om forfatter
	db.all(`SELECT diktid,dikt,fornavn,etternavn FROM dikt `
		+ `LEFT JOIN bruker `
		+ `ON dikt.epostadresse=bruker.epostadresse`,
		(err, rows) =>
	{
		var response = JSON.stringify(rows,null,4)
		res.setHeader("Content-Type", "application/json")
		res.send(response)
	})
})

// GET request med diktid
// Henter et spesifikt dikt
app.get(['/diktsamling/dikt/*'], (req, res) =>
{
	console.log(`${req.connection.remoteAddress} `
		+ `requests ${req.path}`)

	// Sjekker at request er numerisk
	if( req.params[0].search(/[^0-9]/g) != -1) return

	// Søker etter dikt og føyer til informasjon om forfatter
	db.all(`SELECT diktid,dikt,fornavn,etternavn `
		+ `FROM dikt, bruker WHERE diktid='${req.params[0]}' AND `
		+ `dikt.epostadresse=bruker.epostadresse`,
		(err, rows) =>
	{
		var response = JSON.stringify(rows,null,4)
		res.setHeader("Content-Type", "application/json")
		res.send(response)
	})
})

// GET request for alle dikt til bruker
// Henter alle dikt til innlogget bruker
function listEgneDikt(epost, res)
{
	// Søker etter dikt og føyer til informasjon om forfatter
	db.all(`SELECT diktid,dikt,fornavn,etternavn FROM dikt, bruker `
		+ `WHERE dikt.epostadresse='${epost}' AND `
		+ `dikt.epostadresse=bruker.epostadresse`,
		(err, rows) =>
	{
		var response = JSON.stringify(rows,null,4)
		res.setHeader("Content-Type", "application/json")
		res.send(response)
	})
}
app.get(['/diktsamling/bruker/'], (req, res) =>
{
	console.log(`${req.connection.remoteAddress} `
		+ `requests ${req.path}`)
	sudo(req.cookies.Session, res, listEgneDikt, [])
})

// Opprett nytt dikt
app.post('/diktsamling/dikt/', (req, res) =>
{
	// Dekoder dikt og epost for å tilate spesialtegn med %
	var dikt = decodeURIComponent(req.body.dikt);

	sudo(req.cookies.Session, res, lagDikt, [dikt])
})

function lagDikt(epost, res, dikt)
{
	db.run(`INSERT INTO dikt `
		+ `(`
		+	`dikt, `
		+	`epostadresse`
		+ `)`
		+ ` VALUES `
		+ `(`
		+	`${SqlString.escape(dikt)}, `
		+	`${SqlString.escape(epost)}`
		+ `)`,
		(err) =>
	{
		if (err)
		{
			res.status(400)
			return console.error(err.message)
		}

		res.send()
	})
}

// Endre et allerede eksisterende dikt
app.put('/diktsamling/dikt/*', (req, res) =>
{
	// Dekoder dikt og epost for å tilate spesialtegn med %
	var dikt = decodeURIComponent(req.body.dikt);
	var epost = decodeURIComponent(req.body.epostadresse);

	console.log(`${req.connection.remoteAddress} requests to update ${req.path}`)

	// Sjekker at request er numerisk
	if( req.params[0].search(/[^0-9]/g) != -1) return

	db.run(`UPDATE dikt SET dikt=${SqlString.escape(dikt)} `
		+ `WHERE diktid=${req.params[0]}`,
		(err) =>
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

// TODO
// Denne må fikses
app.delete('/diktsamling/dikt/', (req, res) =>
{
	// Dekoder dikt og epost for å tilate spesialtegn med %
	var dikt = decodeURIComponent(req.body.dikt);
	var epost = decodeURIComponent(req.body.epostadresse);

	console.log(`${req.connection.remoteAdress} requests to delete ${req.path}`)

	db.run(`DELETE FROM dikt `
		+ `WHERE epostadresse = ${SqlString.escape(epost)}`,
		(err) =>
	{
		if (err) return console.error(err.message)

		if(this.changes > 0)
		{
			res.send()
			console.log(`\t200 ${epost} successfully deleted`)
		}
		else
		{
			res.status(404)
			console.log(`\t404 ${epost} bad actor`)
		}
	}
	)
})

// Sletter spesifisert dik
app.delete('/diktsamling/dikt/*', (req, res) =>
{
	console.log(`${req.connection.remoteAddress} requests to delete ${req.path}`)

	db.run(`DELETE FROM dikt `
		+ `WHERE diktid=${SqlString.escape(req.params[0])}`,
		(err) =>
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

// Kjører priviligerte funksjoner
function sudo(session, res, func, args)
{
	if (session == null)
	{
		res.status(403)
		res.send("FORBIDDEN")
		return
	}

	db.get(`SELECT epostadresse FROM sesjon WHERE sesjonsid="${session}"`,
		{}, (err, result) =>
	{
		if (err) throw err
		if (result == null)
		{
			console.log(`Session:${session} not found`)
			res.status(403)
			res.send("FORBIDDEN")
			return
		}
		else
		{
			user = result.epostadresse
		}
		func(user, res, ...args);
	})
}


// Innlogging
app.post('/diktsamling/bruker/', (req, res) =>
{
	var username = req.body.username
	var password = req.body.password
	db.get(`SELECT passordhash FROM bruker `
		+ `WHERE epostadresse="${username}"`,
		{}, (err, result) =>
	{
		if (err) throw err
		if (password == result.passordhash)
		{
			var session = crypto.randomBytes(16).toString('base64')
			res.cookie("Session", session)
			db.run(`INSERT INTO sesjon VALUES ("${session}","${username}")`)
			res.send("Successfully logged in")
		}
		else
		{
			res.status(403)
			res.send("")
		}
	})
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
