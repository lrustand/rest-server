
// Wrapper for asynkrone AJAX get requests
function getUrl(url, func) {
	var xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			func(this)
		}
	}
	xhttp.open("GET", url, true)
	xhttp.send()
}

