// Liste over brukerens egne dikt
getUrl("/diktsamling/bruker", function(xhttp) {
	var mine_dikt = JSON.parse(xhttp.responseText)
	mine_dikt.forEach(function (dikt, index) {
		var row = `<div class="dikt" id="dikt_${dikt.diktid}">`
		row += `<h3><a href=vis_dikt.html?diktid=${dikt.diktid}>Dikt #${dikt.diktid}</a></h3>`
		row += dikt.dikt
		row += "<br><br>"
		row += `<button onclick="slettDikt(${dikt.diktid});">Slett</button>`
		row += "</div>"
		document.getElementsByClassName("main")[0].innerHTML += row
	})
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
