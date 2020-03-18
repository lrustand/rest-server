// Liste over brukerens egne dikt
getUrl("/diktsamling/bruker", function(xhttp) {
	var mine_dikt = JSON.parse(xhttp.responseText)
	var main = document.getElementsByClassName("main")[0]
	if (xhttp.status == 200) {
		mine_dikt.forEach(function (dikt, index) {
			var row = `<div class="dikt" id="dikt_${dikt.diktid}">`
			row += `<h3><a href=vis_dikt.html?diktid=${dikt.diktid}>Dikt #${dikt.diktid}</a></h3>`
			row += "<pre>"
				+dikt.dikt
					.replace(/\\n/g, "\n")
					.replace(/\+/g, " ")
				+"</pre>"
			row += "<br><br>"
			row += `<button onclick="slettDikt(${dikt.diktid});">Slett</button>`
			row += `<button onclick="window.location.href='endre_dikt.html?diktid=${dikt.diktid}';">Endre</button>`
			row += "</div>"
			main.innerHTML += row
		})
		if (mine_dikt.length > 0) {
			main.innerHTML += "<br><hr><br>"
			main.innerHTML += "<button onclick='slettAlleDikt();'>Slett alle mine dikt</button>"
		}
		else {
			showMessage("Du har ingen dikt. Opprett et dikt for å se det her")
		}
	}
	else if (xhttp.status == 401) {
		showError("Du må være logget inn for å se diktene dine")
	}
	else {
		showError("En ukjent feil oppsto. Prøv igjen senere")
	}
})


function slettDikt(diktid) {
	var ans = confirm(`Er du sikker på at du vil slette dikt ${diktid}?`)
	if (ans) {
		AJAXRequest("DELETE", `/diktsamling/dikt/${diktid}`, null, function(xhttp) {
			if (xhttp.status == 200) {
				var dikt = document.getElementById(`dikt_${diktid}`)
				dikt.parentElement.removeChild(dikt)
			}
		})
	}
}


function slettAlleDikt(diktid) {
	var ans = confirm(`Er du helt sikker på at du vil slette alle diktene dine?`)
	if (ans) {
		AJAXRequest("DELETE", "/diktsamling/dikt", null, function(xhttp) {
			if (xhttp.status == 200) {
				location.reload();
			}
		})
	}
}
