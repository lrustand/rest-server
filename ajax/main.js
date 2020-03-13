
// Wrapper for asynkrone AJAX get requests
function getUrl(url, func) {
	var xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			func(this)
		}
	}
	xhttp.open("GET", url, true)
	xhttp.send()
}

// Wrapper for asynkrone AJAX post requests
function postUrl(url, data, func) {
	var xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			func(this)
		}
	}
	xhttp.open("POST", url, true)
	xhttp.send(JSON.stringify(data))
}

// Legger til header
document.body.innerHTML =
`<ul id="header">
	<li><a href="index.html">Hjem</a></li>
</ul>`

// Fyller header med inn/utloggingsdetaljer osv
getUrl("/diktsamling/sesjon", function(xhttp) {
	var email = JSON.parse(xhttp.responseText).epostadresse
	var header = document.getElementById("header")

	// Ikke logget inn
	if (email == "null" || email == null) {
		header.innerHTML += "<li style='float:right'><a href='login.html'>Logg inn</a></li>"
		header.innerHTML += "<li style='float:right' class='white'>Ikke innlogget</li>"
	}

	// Logget inn
	else {
		header.innerHTML += "<li style='float:right'><a href='logout.html'>Logg ut</a></li>"
		header.innerHTML += "<li style='float:right' class='white'>Logget inn som " + email + "</li>"
	}
})


