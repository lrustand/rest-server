
// Send inn innloggingsdetaljer til rest api
function login() {
	var data = {}

	data.username = document.getElementById("username").value
	data.password = document.getElementById("password").value

	postUrl("/diktsamling/sesjon", data, function(xhttp) {
		if (xhttp.status == 200) {
			refreshHeader()
			location.href = document.referrer
		}
	})
	return false
}
