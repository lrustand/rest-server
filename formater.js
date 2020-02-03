const dikt = function(rows)
{
	response = "";
	for(index in rows)
	{
		var row = rows[index]

		//Formaterer dikt
		var dikt = row.dikt.replace("\n", "<br>\n\t\t")

		// Legger informasjon til i html med riktig innrykk
		response += `<h1>Dikt #${row.diktid}</h1>\n`
			+ `<table>\n`
			+ `\t<tr>\n\t\t${dikt}\n\t</tr>\n\t<tr>\n`
			+ `\t\t<table style="fontstyle: italic">\n`
			+ `\t\t\t<td>&ndash;${row.fornavn} ${row.etternavn}</td>\n`
			+ `\t\t\t<td><a href="mailto:${row.epostadresse}">${row.epostadresse}</a></td>\n`
			+ `\t\t</table>\n\t</tr>\n`
			+ `</table>\n<hr>\n`
	}
	return response
}
module.exports = { dikt }
