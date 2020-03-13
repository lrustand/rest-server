// Liste over brukerens egne dikt
getUrl("/diktsamling/bruker", function(xhttp) {
	var mine_dikt = JSON.parse(xhttp.responseText)
	mine_dikt.forEach(function (dikt, index) {
		var row = "<div class='dikt'>"
		row += `<h3><a href=vis_dikt.html?diktid=${dikt.diktid}>Dikt #${dikt.diktid}</a></h3>`
		row += dikt.dikt
		row += "</div>"
		document.getElementsByClassName("main")[0].innerHTML += row
	})
})
