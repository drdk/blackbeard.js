var path = require("path");
var ghpages = require("gh-pages");

var options = {
	logger: function(message) {
		console.log(message);
	}
};

function callback () {
	console.log("gh-pages pushed");
}

ghpages.publish(path.join(__dirname, "_book"), options, callback);