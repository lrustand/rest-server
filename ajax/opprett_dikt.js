function opprettDikt() {
	const dikt = {"dikt":document.getElementById("dikt").value}
	postUrl("/diktsamling/dikt", dikt, function(xhttp) {
	})
}
