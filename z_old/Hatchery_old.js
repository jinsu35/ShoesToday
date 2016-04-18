// Import packages
var request = require('request');

var privateIpList = [ '192.168.13.225', '172.18.11.6' ];

setInterval(sendRequest, 0.2*1000);

function sendRequest() {
	var option = {
		headers: {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
		},
		localAddress: '172.18.11.6',
		uri: "http://www.footlocker.com/product/model:259316/sku:14962002/nike-air-more-uptempo-mens/black/white/?cm="
	};

	request(option, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('SUCCESS');
		} else {
			console.log('ERROR: error = ' + error);
			console.log('ERROR: response = ' + response);
			if(response != null) {
				console.log('ERROR: response.statusCode = ' + response.statusCode);
			}
		}
	});
}