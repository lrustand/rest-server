
const queryString = new URLSearchParams(window.location.search);
const diktid = queryString.get("diktid")

// Viser dikt spesifisert i query string (?diktid=)
if (diktid != null) {
	getUrl("/diktsamling/dikt/"+diktid, function(xhttp) {
		var dikt = JSON.parse(xhttp.responseText)[0]
		var out = "<div class='dikt'>"
		out += `<h3><a href=vis_dikt.html?diktid=${dikt.diktid}>Dikt #${dikt.diktid}</a></h3>`
		out += dikt.dikt
		out += "<br>"
		out += "<p><i>- "+dikt.fornavn+" "+dikt.etternavn+"<i><p>"
		out += "</div>"
		document.getElementsByClassName("main")[0].innerHTML += out
	})
}

// Liste over alle dikt
else {
	getUrl("/diktsamling/dikt/", function(xhttp) {
		const valgte_dikt = JSON.parse(xhttp.responseText)
		valgte_dikt.forEach(function (dikt, index) {
			var row = "<div class='dikt'>"
			row += `<h3><a href=vis_dikt.html?diktid=${dikt.diktid}>Dikt #${dikt.diktid}</a></h3>`
			row += "Skrevet av " + dikt.fornavn + " " + dikt.etternavn
			row += "</div>"
			document.getElementsByClassName("main")[0].innerHTML += row
		})
	})
}
