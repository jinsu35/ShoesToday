// Import packages
var request = require('request');
var async = require('async');
var database_shoesTable = require('./../database/shoesTable.js');
var scrapper = require("./../scrapper/brokenLinkChecker.js");
var proxy = require('./../proxy/proxy-manager.js');

// Adjust numberOfRequestPerSecondPerIp for maximum performance, which can reduce number of public IPs needed.
var numberOfRequestPerSecondPerIp = 4;
// var requestInterval = 1000 / numberOfRequestPerSecondPerIp / proxyIpAddressList.length;
// var requestInterval = 5000;

function Hatchery(store, requestInterval) {
	var store = store;
	var requestInterval = requestInterval;
	var shoesList = undefined;
	var requestDaemon = undefined;

	this.start = function() {
		async.parallel([
	 		database_shoesTable.selectAll,
	 		proxy.loadAllProxyIpAddresses
		],
		function(err, results) {
			if(err) {
				console.log(err);
				return;
			}
			
			shoesList = results[0];

			// the results array will equal [proxyIpList, shoesList]
			console.log('Hatchery(%s) sending %d crawlers.', store, shoesList.length);

			startSendingRequests();
		});
	}

	// Start the request daemon.
	var startSendingRequests = function() {
		console.log('startSendingRequests: ' + 'Sending one request every %d seconds', requestInterval / 1000);
		// Send request for every 'requestInterval' seconds
		var shoesListIndex = 0;
		requestDaemon = setInterval(function() {
			// Send request
			sendRequest(proxy.nextAvailableAddress(), shoesList[shoesListIndex]);

			// Increase indexes by one
			shoesListIndex = (shoesListIndex + 1) % shoesList.length;
		}, requestInterval);
	}

	var sendRequest = function(proxyIpAddress, shoes) {
		var logPrefix = 'proxy Ip Address: ' + proxyIpAddress + ',' + ' Shoes Model: ' + shoes.model + ',' + ' Shoes SKU: ' + shoes.sku;

		var option = {
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
			},
			proxy: 'http://' + proxyIpAddress,
			uri: "http://www.footlocker.com/product/model:" + shoes.model + "/sku:" + shoes.sku
		};

		request(option, function(error, response, body) {
			if(error) {
				console.log('Request Error in Hatchery(%s): %s', store, error);
				if (error.code == 'ECONNREFUSED') {
					proxy.removeBlockedIpAddress(proxyIpAddress);
				}
			} else {
				if (response != null && response.statusCode == 200) {
					console.log('SUCCESS - ' + logPrefix);
					var storeName = 'footlocker';
					scrapper.checkForBrokenLink(storeName, response, body);
				} else if(response != null && response.statusCode == 403) {
					console.log('BLOCKED: response.statusCode = ' + response.statusCode);
				}
			}
		});
	}
}

// Stop the request daemon.
Hatchery.prototype.stopSendingRequests = function() {
	if(this.requestDaemon != undefined) {
		clearInterval(this.requestDaemon);
	}
};

// Setter for shoesList
Hatchery.prototype.setShoesList = function(shoesList) {
	this.shoesList = shoesList;
};

module.exports = Hatchery;