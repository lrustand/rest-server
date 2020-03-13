function opprettDikt() {
	const dikt = {"dikt":document.getElementById("dikt").value}
	console.log(dikt)
	postUrl("/diktsamling/dikt", dikt, function(xhttp) {
	})
}
