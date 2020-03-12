
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

// Fyller header med inn/utloggingsdetaljer osv
getUrl("/diktsamling/sesjon", function(xhttp) {
	var email = JSON.parse(xhttp.responseText).epostadresse
	var header = document.getElementById("header")

	// Ikke logget inn
	if (email == "null" || email == null) {
		header.innerHTML += "<li class='white'>Ikke innlogget</li>"
	}

	// Logget inn
	else {
		header.innerHTML += "<li class='white'>Logget inn som " + email + "</li>"
	}
})


