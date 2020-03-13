
// Wrapper for AJAX requests
function AJAXRequest(method, url, data, func) {
	var xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			func(this)
		}
	}
	xhttp.open(method, url, true)
	if (data != null) {
		xhttp.setRequestHeader("Content-Type","application/json")
		xhttp.send(JSON.stringify(data))
	}
	else {
		xhttp.send()
	}
}



// Wrapper for asynkrone AJAX get requests
function getUrl(url, func) {
	AJAXRequest("GET", url, null, func)
}



// Wrapper for asynkrone AJAX post requests
function postUrl(url, data, func) {
	AJAXRequest("POST", url, data, func)
}



// Legger til header
document.body.innerHTML +=
`<ul id="header">
</ul>`



// Oppdaterer header
function refreshHeader() {
	// Fyller header med inn/utloggingsdetaljer osv
	getUrl("/diktsamling/sesjon", function(xhttp) {
		var email = JSON.parse(xhttp.responseText).epostadresse
		var header = document.getElementById("header")
		var newheader = '<li><a href="index.html">Hjem</a></li>'

		// Ikke logget inn
		if (email == "null" || email == null) {
			newheader += "<li style='float:right'><a href='login.html'>Logg inn</a></li>"
			newheader += "<li style='float:right' class='white'>Ikke innlogget</li>"
		}

		// Logget inn
		else {
			newheader += "<li style='float:right'><button onclick='logout()'>Logg ut</button></li>"
			newheader += "<li style='float:right' class='white'>Logget inn som " + email + "</li>"
		}

		header.innerHTML = newheader
	})
}
refreshHeader()


// Send inn innloggingsdetaljer til rest api
function login() {
	var data = {}

	data.username = document.getElementById("username").value
	data.password = document.getElementById("password").value

	postUrl("/diktsamling/sesjon", data, function(xhttp) {
		if (xhttp.status == 200) {
			refreshHeader()
		}
	})
	return false
}



// Logger ut av rest api
function logout() {
	AJAXRequest("DELETE", "/diktsamling/sesjon", null, function (xhttp) {
		refreshHeader()
	})
}
