const queryString = new URLSearchParams(window.location.search)
const diktid = queryString.get("diktid")
getUrl(`/diktsamling/dikt/${diktid}`, function(xhttp) {
	var diktInnhold = JSON.parse(xhttp.responseText)[0].dikt
	document.getElementById("dikt").value = diktInnhold
})

function endreDikt() {
	const dikt = {"dikt":document.getElementById("dikt").value}
	AJAXRequest("PUT", `/diktsamling/dikt/${diktid}`, dikt, function(xhttp) {
		if (xhttp.status == 200) {
			window.location.href = document.referrer
		}
		else if (xhttp.status == 401) {
			showError("Du må være logget inn for å kunne gjøre dette")
		}
		else {
			showError("En ukjent feil oppsto. Prøv igjen senere")
		}
	})
}
