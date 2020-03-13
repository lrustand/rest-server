
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



// Oppdaterer header
function refreshHeader() {
	// Fyller header med inn/utloggingsdetaljer osv
	getUrl("/diktsamling/sesjon", function(xhttp) {
		var email = JSON.parse(xhttp.responseText).epostadresse
		var header = document.getElementById("header")
		var newheader = ""

		var txtLoggedInAs = document.getElementById("txtLoggedInAs")
		var btnLogin = document.getElementById("btnLogin")
		var btnLogout = document.getElementById("btnLogout")

		// Ikke logget inn
		if (email == "null" || email == null) {
			txtLoggedInAs.innerHTML = "Ikke logget inn"
			btnLogin.style.display = "block"
			btnLogout.style.display = "none"
		}

		// Logget inn
		else {
			txtLoggedInAs.innerHTML = "Logget inn som " + email
			btnLogin.style.display = "none"
			btnLogout.style.display = "block"
		}
	})
}



// Setter inn header
document.body.innerHTML += `
		<ul id="header">
			<li id="btnHome"><a href="index.html">Hjem</a></li>
			<li id="btnLogin" style='float:right; display:none'><a href='login.html'>Logg inn</a></li>
			<li id="btnLogout" style='float:right; display:none'><button onclick='logout()'>Logg ut</button></li>
			<li id="txtLoggedInAs" style='float:right' class='white'></li>
		</ul>`
refreshHeader()



// Logger ut av rest api
function logout() {
	AJAXRequest("DELETE", "/diktsamling/sesjon", null, function (xhttp) {
		refreshHeader()
	})
}
