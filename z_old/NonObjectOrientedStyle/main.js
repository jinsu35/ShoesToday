// Import packages
var request = require('request');
var fs = require('fs');

// PrivateIp addresses do not change. They are fixed.
//var privateIpList = AWS.getAllPrivateIp();
var privateIpList = ['172.18.12.142'];

// (1/requestInterval) requests per each hatchery
// Adjust this value for maximum performance, which can reduce number of public IPs needed.
var numberOfRequestPerSecond = 5;
var requestInterval = 1000 / numberOfRequestPerSecond;

// List of all shoes, extracted from 'SHOES' table.
// This list should be refreshed everytime the 'TASK' table is updated, which results in updating the 'SHOES' table.
//var shoesList = Database.getShoesList;
/*var shoesList;
var oneHour = 1 * 60 * 60 * 1000;
setInterval(function() {
	shoesList = Database.getShoesList
}, oneHour);*/

var shoesList = [{model:259316, sku:14962002}];
var privateIpListIndex = 0;
var shoesListIndex = 0;
setInterval(function() {
	sendRequest(privateIpList[privateIpListIndex], shoesList[shoesListIndex]);
	privateIpListIndex = (privateIpListIndex + 1) % privateIpList.length;
	shoesListIndex = (shoesListIndex + 1) % shoesList.length;
}, requestInterval);

function sendRequest(privateIp, shoes) {
	var logPrefix = 'Private Ip: ' + privateIp + ',' + ' Shoes model: ' + shoes.model + ',' + ' Shoes sku: ' + shoes.sku;

	var option = {
		headers: {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
		},
		localAddress: privateIp,
		uri: "http://www.footlocker.com/product/model:" + shoes.model + "/sku:" + shoes.sku + "/nike-air-more-uptempo-mens/black/white/?cm="
	};

	request(option, function(error, response, body) {
		if(error) {
			console.log('ERROR: error = ' + error);
		} else {
			if (response != null && response.statusCode == 200) {
				console.log('SUCCESS - ' + logPrefix);
				fs.writeFileSync('body.html', body);
				// scrapper(response, body);
			} else if(response != null && response.statusCode == 403) {
				console.log('ERROR: response = ' + response);
				console.log('ERROR: response.statusCode = ' + response.statusCode);
				// Change Elastic IP Address
				// AWS.privateIpBanned(this.privateIpAddress)
			}
		}
	});
}
