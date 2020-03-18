
const queryString = new URLSearchParams(window.location.search);
const diktid = queryString.get("diktid")

// Viser dikt spesifisert i query string (?diktid=)
if (diktid != null) {
	getUrl("/diktsamling/dikt/"+diktid, function(xhttp) {
		var main = document.getElementsByClassName("main")[0]
		if (xhttp.status == 200) {
			var dikt = JSON.parse(xhttp.responseText)[0]
			var out = "<div class='dikt'>"
			out += `<h3><a href=vis_dikt.html?diktid=${dikt.diktid}>Dikt #${dikt.diktid}</a></h3>`
			out += "<pre>"
				+dikt.dikt
					.replace(/\\n/g, "\n")
					.replace(/\+/g, " ")
				+"</pre>"
			out += "<br>"
			out += "<p><i>- "+dikt.fornavn+" "+dikt.etternavn+"<i><p>"
			out += "</div>"
			main.innerHTML += out
		}
		else if (status == 404) {
			showError("Dette diktet finnes ikke.")
		}
		else {
			showError("En ukjent feil oppsto. Prøv igjen senere")
		}

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
