function opprettDikt() {
	const dikt = {"dikt":document.getElementById("dikt").value}
	postUrl("/diktsamling/dikt", dikt, function(xhttp) {
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
