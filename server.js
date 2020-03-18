const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const SqlString = require('sqlstring')
const cookieParser = require('cookie-parser')
const crypto = require('crypto');
const md5 = require('md5');

const app = express()
app.use(cookieParser())
app.use(express.json())
const port = 3000


var db = new sqlite3.Database('diktsamling.db')

// Middleware for å logge alle requests
app.use((req, res, next) =>
{
	var client = req.connection.remoteAddress
	var path = req.path
	var method = req.method
	console.log(`${client} ${method} ${path}`)
	next()
})


// Middleware for å hente epostadressen til innlogget bruker
app.use((req, res, next) =>
{
	var session = req.cookies.Session

	db.get(`SELECT epostadresse FROM sesjon WHERE sesjonsid="${session}"`,
		{}, (err, result) =>
	{
		if (err) return internalError(res, err)
		req.email = null
		if (result != null)
		{
			req.email = result.epostadresse
		}
		next()
	})
})


// Handling av interne feil
function internalError(res, err)
{
	res.status(500)
	res.send()
	console.err(err)
}

// GET request til diktdatabase
// Henter alle dikt
app.get('/diktsamling/dikt/', (req, res) =>
{
	// Henter alle dikt med informasjon om forfatter
	db.all(`SELECT diktid, dikt, fornavn, etternavn, dikt.epostadresse `
		+ `FROM dikt LEFT JOIN bruker `
		+ `ON dikt.epostadresse=bruker.epostadresse`,
		(err, rows) =>
	{
		if (err) return internalError(res, err)
		var response = JSON.stringify(rows, null, 4)
		res.setHeader("Content-Type", "application/json")
		res.send(response)
	})
})

// GET request med diktid
// Henter et spesifikt dikt
app.get('/diktsamling/dikt/*', (req, res) =>
{
	var diktid = req.params[0]

	// Sjekker at diktid er numerisk
	if (diktid.search(/[^0-9]/g) != -1) return

	// Søker etter dikt og føyer til informasjon om forfatter
	db.all(`SELECT diktid, dikt, fornavn, etternavn FROM dikt `
		+ `LEFT JOIN bruker `
		+ `ON dikt.epostadresse=bruker.epostadresse `
		+ `WHERE diktid='${diktid}'`,
		(err, rows) =>
	{
		if (err) return internalError(res, err)
		if (rows.length <= 0)
		{
			res.status(404)
		}
		var response = JSON.stringify(rows, null, 4)
		res.setHeader("Content-Type", "application/json")
		res.send(response)
	})
})

// GET request for alle dikt til bruker
// Henter alle dikt til innlogget bruker
app.get('/diktsamling/bruker/', (req, res) =>
{
	if (req.email == null)
	{
		res.setHeader("Content-Type", "application/json")
		res.status(401)
		res.send("[]")
		return
	}

	// Søker etter dikt og føyer til informasjon om forfatter
	db.all(`SELECT diktid, dikt, fornavn, etternavn `
		+ `FROM dikt, bruker `
		+ `WHERE dikt.epostadresse='${req.email}' AND `
		+ `dikt.epostadresse=bruker.epostadresse`,
		(err, rows) =>
	{
		if (err) return internalError(res, err)
		var response = JSON.stringify(rows, null, 4)
		res.setHeader("Content-Type", "application/json")
		res.send(response)
	})
})

// Opprett nytt dikt
app.post('/diktsamling/dikt/', (req, res) =>
{
	// Bare la innloggede brukere laste opp dikt
	if (req.email == null)
	{
		res.status(401)
		return
	}

	// Dekoder dikt og epost for å tilate spesialtegn med %
	var dikt = decodeURIComponent(req.body.dikt);

	db.run(`INSERT INTO dikt `
		+ `(`
		+	`dikt, `
		+	`epostadresse`
		+ `)`
		+ ` VALUES `
		+ `(`
		+	`${SqlString.escape(dikt)}, `
		+	`"${req.email}"`
		+ `)`,
		(err) =>
	{
		if (err) return internalError(res, err)

		res.send()
	})
})

// Endre et allerede eksisterende dikt
app.put('/diktsamling/dikt/*', (req, res) =>
{
	// Bare la innloggede brukere endre dikt
	if (req.email == null)
	{
		res.status(401)
		res.send()
		return
	}

	// Dekoder dikt for å tillate spesialtegn med %
	var dikt = decodeURIComponent(req.body.dikt);
	var diktid = req.params[0]

	// Sjekker at diktid er numerisk
	if (diktid.search(/[^0-9]/g) != -1)
	{
		res.status(400)
		res.send()
		return
	}

	db.run(`UPDATE dikt SET dikt=${SqlString.escape(dikt)} `
		+ `WHERE diktid="${diktid}" `
		+ `AND epostadresse="${req.email}"`,
		function (err)
	{
		if (err) return internalError(res, err)

		if(this.changes > 0)
		{
			res.send()
			console.log(`\t200 ${req.path} successfully updated`)
		}
		else
		{
			res.status(404)
			res.send()
			console.log(`\t404 ${req.path} not found`)
		}
	})
})

// Sletter alle diktene til innlogget bruker
app.delete('/diktsamling/dikt/', (req, res) =>
{
	if (req.email == null)
	{
		res.status(401)
		return
	}
	db.run(`DELETE FROM dikt WHERE epostadresse = "${req.email}"`,
		function (err)
	{
		if (err) return internalError(res, err)

		if(this.changes > 0)
		{
			res.send()
			console.log(`\t200 ${req.email} successfully deleted`)
		}
		else
		{
			res.status(404)
			console.log(`\t404 ${req.email} bad actor`)
		}
	})
})

// Sletter spesifisert dik
app.delete('/diktsamling/dikt/*', (req, res) =>
	{
	var diktid = req.params[0]

	if (req.email == null)
	{
		res.status(401)
		return
	}

	// Sjekker at diktid er numerisk
	if (diktid.search(/[^0-9]/g) != -1) return

	db.run(`DELETE FROM dikt `
		+ `WHERE diktid=${SqlString.escape(diktid)} `
		+ `AND epostadresse="${req.email}"`,
		function (err)
	{
		if (err) return internalError(res, err)

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
	})
})

// Innlogging
app.post('/diktsamling/sesjon/', (req, res) =>
{
	try
	{
		var username = req.body.username
		var passwordhash = md5(req.body.password)
	}
	catch(err)
	{
		res.status(400)
		res.send()
		return
	}
	db.get(`SELECT passordhash FROM bruker `
		+ `WHERE epostadresse="${username}"`,
		{}, (err, result) =>
	{
		if (err) return internalError(res, err)
		if (result == null)
		{
			res.status(401)
			res.send()
			return
		}
		if (passwordhash == result.passordhash)
		{
			var session = crypto.randomBytes(16).toString('base64')
			res.cookie("Session", session)
			db.run(`INSERT INTO sesjon VALUES ("${session}","${username}")`)
			res.send("Successfully logged in")
		}
		else
		{
			res.status(401)
			res.send("")
		}
	})
})

// Sjekker hvilken bruker som er logget inn
app.get('/diktsamling/sesjon', (req, res) =>
{
	res.send(`{"epostadresse":"${req.email}"}`)
})

// Utlogging
// Logger ut kun denne sesjonen
app.delete('/diktsamling/sesjon/', (req, res) =>
{
	if (req.email != null)
	{
		db.get(`DELETE FROM sesjon `
			+ `WHERE sesjonsid='${req.cookies.Session}'`,
			{}, (err, result) =>
		{
			if (err) return internalError(res, err)
			res.clearCookie('Session');
			res.send("Successfully logged out")
		})
	}
})


// Serve statiske filer fra ajax-mappen
app.use('/ajax/',express.static('ajax'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
